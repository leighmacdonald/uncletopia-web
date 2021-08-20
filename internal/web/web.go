package web

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/leighmacdonald/steamid/v2/extra"
	"github.com/leighmacdonald/steamid/v2/steamid"
	"github.com/leighmacdonald/steamweb"
	"github.com/leighmacdonald/uncletopia-web/internal/config"
	"github.com/leighmacdonald/uncletopia-web/internal/store"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/yohcop/openid-go"
	"io"
	"io/ioutil"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"path"
	"regexp"
	"strings"
	"time"
)

type M map[string]interface{}

type App struct {
	router *gin.Engine
	srv    *http.Server
	ctx    context.Context
}

type APIResponse struct {
	Status  bool        `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func responseErr(c *gin.Context, status int, data interface{}) {
	c.JSON(status, APIResponse{
		Status: false,
		Data:   data,
	})
}

func responseOK(c *gin.Context, status int, data interface{}) {
	c.JSON(status, APIResponse{
		Status: true,
		Data:   data,
	})
}

func currentPerson(c *gin.Context) *store.Person {
	p, found := c.Get("person")
	if !found {
		return store.NewPerson(0)
	}
	person, ok := p.(*store.Person)
	if !ok {
		log.Warnf("Total not cast store.Person from session")
		return store.NewPerson(0)
	}
	return person
}

func onApiWhoAmI() gin.HandlerFunc {
	type resp struct {
		Player  *store.Person            `json:"player"`
		Friends []steamweb.PlayerSummary `json:"friends"`
	}
	return func(c *gin.Context) {
		p := currentPerson(c)
		if !p.SteamID.Valid() {
			responseErr(c, http.StatusForbidden, nil)
			return
		}
		friendList, err := steamweb.GetFriendList(p.SteamID)
		if err != nil {
			responseErr(c, http.StatusServiceUnavailable, "Could not fetch friends")
			return
		}
		var friendIds steamid.Collection
		for _, f := range friendList {
			friendIds = append(friendIds, f.Steamid)
		}
		friends, err := steamweb.PlayerSummaries(friendIds)
		if err != nil {
			responseErr(c, http.StatusServiceUnavailable, "Could not fetch summaries")
			return
		}
		var response resp
		response.Player = p
		response.Friends = friends
		responseOK(c, http.StatusOK, response)
	}
}
func onApiServers(db store.StorageInterface) gin.HandlerFunc {
	return func(c *gin.Context) {
		servers, err := db.Servers(context.Background())
		if err != nil {
			responseErr(c, http.StatusInternalServerError, "Internal error")
			return
		}

		for i, s := range servers {
			pc := int(rand.Int31n(24))
			if i%2 == 0 {
				pc = 24
			}
			s.State = &extra.Status{
				Map:          "pl_thundermountain",
				PlayersMax:   24,
				PlayersCount: pc,
			}
		}
		responseOK(c, http.StatusOK, servers.FilterEnabled())
	}
}

func New(db store.StorageInterface) (http.Handler, error) {
	r := gin.Default()
	staticPath := config.HTTP.StaticPath
	if staticPath == "" {
		staticPath = "frontend/dist/static"
	}
	idxPath := path.Join(staticPath, "index.html")
	idx, err := os.ReadFile(idxPath)
	if err != nil {
		return nil, errors.Wrapf(err, "Could not read %s", idxPath)
	}
	r.Static("/static", staticPath)
	for _, p := range []string{"/", "/settings", "/credits", "/donate", "/servers", "/login/success"} {
		r.GET(p, func(c *gin.Context) {
			c.Data(200, "text/html", idx)
		})
	}
	r.GET("/api/servers", onApiServers(db))
	r.GET("/auth/callback", onOpenIDCallback())
	r.GET("/patreon/callback", onPatreonCallback())
	r.GET("/embed", func(c *gin.Context) {
		c.JSON(200, M{
			"version":       "1.0",
			"type":          "rich",
			"title":         "Uncletopia",
			"description":   "Uncletopia",
			"author_name":   "Uncletopia",
			"author_url":    "https://uncletopia.com",
			"provider_name": "Check out my Uncletopia TF2 Servers",
			"provider_url":  "https://uncletopia.com",
		})
	})

	// Basic logged in user
	authed := r.Use(authMiddleware(store.PAuthenticated))
	authed.GET("/api/whoami", onApiWhoAmI())

	// Admin access
	//admin := r.Use(authMiddleware(store.PAdmin))
	//admin.GET("/api/

	return r, nil
}

func (a *App) Serve(opts HTTPOpts) error {
	opts.Handler = a.router
	a.srv = NewHTTPServer(opts)

	return a.srv.ListenAndServe()
}

// HTTPOpts is used to configure a http.Server instance
type HTTPOpts struct {
	ListenAddr     string
	UseTLS         bool
	Handler        http.Handler
	ReadTimeout    time.Duration
	WriteTimeout   time.Duration
	MaxHeaderBytes int
	TLSConfig      *tls.Config
}

// DefaultHTTPOpts returns a default set of options for http.Server instances
func DefaultHTTPOpts() HTTPOpts {
	addr := config.HTTP.Listen
	return HTTPOpts{
		ListenAddr:     addr,
		UseTLS:         false,
		Handler:        nil,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
		TLSConfig:      nil,
	}
}

// NewHTTPServer will configure and return a *http.Server suitable for serving requests.
// This should be used over the default ListenAndServe options as they do not set certain
// parameters, notably timeouts, which can negatively effect performance.
func NewHTTPServer(opts HTTPOpts) *http.Server {
	var tlsCfg *tls.Config
	if opts.UseTLS && opts.TLSConfig == nil {
		tlsCfg = &tls.Config{
			MinVersion:               tls.VersionTLS12,
			CurvePreferences:         []tls.CurveID{tls.CurveP521, tls.CurveP384, tls.CurveP256},
			PreferServerCipherSuites: true,
			CipherSuites: []uint16{
				tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,
				tls.TLS_RSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_RSA_WITH_AES_256_CBC_SHA,
			},
		}
	} else {
		tlsCfg = nil
	}
	return &http.Server{
		Addr:           opts.ListenAddr,
		Handler:        opts.Handler,
		TLSConfig:      tlsCfg,
		ReadTimeout:    opts.ReadTimeout,
		WriteTimeout:   opts.WriteTimeout,
		MaxHeaderBytes: opts.MaxHeaderBytes,
	}
}

// noOpDiscoveryCache implements the DiscoveryCache interface and doesn't cache anything.
type noOpDiscoveryCache struct{}

// Put is a no op.
func (n *noOpDiscoveryCache) Put(_ string, _ openid.DiscoveredInfo) {}

// Get always returns nil.
func (n *noOpDiscoveryCache) Get(_ string) openid.DiscoveredInfo {
	return nil
}

var nonceStore = openid.NewSimpleNonceStore()
var discoveryCache = &noOpDiscoveryCache{}

func onOpenIDCallback() gin.HandlerFunc {
	oidRx := regexp.MustCompile(`^https://steamcommunity\.com/openid/id/(\d+)$`)
	return func(c *gin.Context) {
		ref, found := c.GetQuery("return_url")
		if !found {
			ref = "/"
		}
		fullURL := "https://" + config.HTTP.Domain + c.Request.URL.String()
		id, err := openid.Verify(fullURL, discoveryCache, nonceStore)
		if err != nil {
			log.Printf("Error verifying: %q\n", err)
			c.Redirect(302, ref)
			return
		}
		m := oidRx.FindStringSubmatch(id)
		if m == nil || len(m) != 2 {
			c.Redirect(302, ref)
			return
		}
		sid, err := steamid.SID64FromString(m[1])
		if err != nil {
			log.Errorf("Received invalid steamid: %v", err)
			c.Redirect(302, ref)
			return
		}
		//p := &steamweb.PlayerSummary{}
		//s, errS := steamweb.PlayerSummaries(steamid.Collection{})
		//
		//
		//p, ok := res.Value.(*model.Person)
		//if !ok {
		//	log.Errorf("Failed to cast user profile")
		//	c.Redirect(302, ref)
		//	return
		//}
		u, errParse := url.Parse("/login/success")
		if errParse != nil {
			c.Redirect(302, ref)
			return
		}
		t, errJWT := NewJWT(sid)
		if errJWT != nil {
			log.Errorf("Failed to create new JWT: %v", errJWT)
			c.Redirect(302, ref)
			return
		}
		v := u.Query()
		v.Set("token", t)
		v.Set("permission_level", fmt.Sprintf("%d", 100))
		v.Set("next_url", ref)
		u.RawQuery = v.Encode()
		c.Redirect(302, u.String())
	}
}

type authClaims struct {
	SteamID int64 `json:"steam_id"`
	Exp     int64 `json:"exp"`
	jwt.StandardClaims
}

func NewJWT(steamID steamid.SID64) (string, error) {
	claims := &authClaims{
		SteamID:        steamID.Int64(),
		Exp:            time.Now().Add(time.Hour * 24).Unix(),
		StandardClaims: jwt.StandardClaims{},
	}
	at := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := at.SignedString([]byte(config.HTTP.CookieKey))
	if err != nil {
		return "", err
	}
	return token, nil
}

func getTokenKey(_ *jwt.Token) (interface{}, error) {
	return []byte(config.HTTP.CookieKey), nil
}

func onTokenRefresh() gin.HandlerFunc {
	return func(c *gin.Context) {
		ah := c.GetHeader("Authorization")
		tp := strings.SplitN(ah, " ", 2)
		var token string
		if ah != "" && len(tp) == 2 && tp[0] == "Bearer" {
			token = tp[1]
		}
		if token == "" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		claims := &authClaims{}
		tkn, err := jwt.ParseWithClaims(token, claims, getTokenKey)
		if err != nil {
			if err == jwt.ErrSignatureInvalid {
				c.AbortWithStatus(http.StatusUnauthorized)
				return
			}
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		if !tkn.Valid {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		if time.Until(time.Unix(claims.ExpiresAt, 0)) > 30*time.Second {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		// Now, create a new token for the current use, with a renewed expiration time
		expirationTime := time.Now().Add(24 * time.Hour)
		claims.ExpiresAt = expirationTime.Unix()
		outToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err2 := outToken.SignedString(config.HTTP.CookieKey)
		if err2 != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, gin.H{"token": tokenString})
	}
}

func authMiddleware(level store.Privilege) gin.HandlerFunc {
	type header struct {
		Authorization string `header:"Authorization"`
	}
	return func(c *gin.Context) {
		hdr := header{}
		if err := c.ShouldBindHeader(&hdr); err != nil {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		pcs := strings.Split(hdr.Authorization, " ")
		if len(pcs) != 2 && level > store.PGuest {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		if level > store.PGuest {
			sid, err := sid64FromJWTToken(pcs[1])
			if err != nil {
				log.Errorf("Failed to load persons session user: %v", err)
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
			//cx, cancel := context.WithTimeout(context.Background(), time.Second*6)
			//defer cancel()
			//loggedInPerson, err := store.GetPersonBySteamID(cx, sid)
			//if err != nil {
			//	log.Errorf("Failed to load persons session user: %v", err)
			//	c.AbortWithStatus(http.StatusForbidden)
			//	return
			//}
			//if level > loggedInPerson.PermissionLevel {
			//	c.AbortWithStatus(http.StatusForbidden)
			//	return
			//}
			c.Set("person", sid)
		}
		c.Next()
	}
}

var (
	ErrAuthentication = errors.New("Auth invalid")
)

func sid64FromJWTToken(token string) (steamid.SID64, error) {
	claims := &authClaims{}
	tkn, errC := jwt.ParseWithClaims(token, claims, getTokenKey)
	if errC != nil {
		if errC == jwt.ErrSignatureInvalid {
			return 0, ErrAuthentication
		}
		return 0, ErrAuthentication
	}
	if !tkn.Valid {
		return 0, ErrAuthentication
	}
	sid := steamid.SID64(claims.SteamID)
	if !sid.Valid() {
		log.Warnf("Invalid steamID")
		return 0, ErrAuthentication
	}
	return sid, nil
}

type PatreonUserToken struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	Scope        string `json:"scope"`
	TokenType    string `json:"token_type"`
}

func onPatreonCallback() gin.HandlerFunc {
	type patreonError struct {
		Error string `json:"error"`
	}
	decode := func(body io.ReadCloser, target interface{}) error {
		b, errB := ioutil.ReadAll(body)
		if errB != nil {
			return errors.Wrapf(errB, "Failed to read patreon response body")
		}
		defer func() {
			if errC := body.Close(); errC != nil {
				log.Errorf("Failed to close patreon response body")
			}
		}()
		if errJ := json.Unmarshal(b, &target); errJ != nil {
			return errors.Wrapf(errJ, "Failed to decode patreon response body to json")
		}
		return nil
	}

	httpClient := http.Client{
		Timeout: time.Second * 10,
	}
	return func(c *gin.Context) {
		code, codeFound := c.GetQuery("code")
		state, stateFound := c.GetQuery("state")
		if !codeFound || !stateFound || state == "" {
			c.String(http.StatusBadRequest, "invalid request")
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()

		form := url.Values{}
		form.Set("code", code)
		form.Set("grant_type", "authorization_code")
		form.Set("client_id", config.Patreon.ClientID)
		form.Set("client_secret", config.Patreon.ClientSecret)
		form.Set("redirect_uri", "https://ut.roto.su/patreon/callback")

		req, err := http.NewRequestWithContext(ctx, "POST",
			"https://www.patreon.com/api/oauth2/token",
			strings.NewReader(form.Encode()))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

		if err != nil {
			log.WithError(err).Errorf("Failed to create patreon request")
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		resp, errR := httpClient.Do(req)
		if errR != nil {
			log.WithError(errR).Errorf("Invalid patreon client response")
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		if resp.StatusCode != 200 {
			var e patreonError
			if errD := decode(resp.Body, &e); errD != nil {
				log.Errorf("Faile to decode error message: %v", errD)
			}
			log.WithError(err).Errorf("Invalid patreon client status: %s", e.Error)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		var put PatreonUserToken
		if errD := decode(resp.Body, &put); errD != nil {
			log.Errorf("Faile to decode error message: %v", errD)
		}
		c.Redirect(http.StatusTemporaryRedirect, "/donate")
		log.WithFields(log.Fields{
			"type":       put.TokenType,
			"expires_in": put.ExpiresIn,
			"scope":      put.Scope,
		}).Infof("New patreon OAuth token successfully granted")
	}
}
