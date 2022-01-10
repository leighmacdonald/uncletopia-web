package app

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/leighmacdonald/steamid/v2/steamid"
	"github.com/leighmacdonald/steamweb"
	"github.com/leighmacdonald/uncletopia-web/internal/config"
	"github.com/leighmacdonald/uncletopia-web/internal/store"
	"github.com/leighmacdonald/uncletopia-web/pkg/coordinator"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/yohcop/openid-go"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"path"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type M map[string]interface{}

type Web struct {
	router *gin.Engine
	srv    *http.Server
	ctx    context.Context
}

func NewWeb(db store.StorageInterface, coord *coordinator.Coordinator) (http.Handler, error) {
	r := gin.Default()
	staticPath := config.HTTP.StaticPath
	if staticPath == "" {
		staticPath = "frontend/dist/static"
	}
	idxPath := path.Join(staticPath, "index.html")

	r.Static("/static", staticPath)
	for _, p := range []string{"/", "/settings", "/credits", "/donate", "/servers", "/login/success", "/demos",
		"/profile", "/maps", "/rules", "/admin/news", "/admin/donations", "/admin/servers", "/404"} {
		r.GET(p, func(c *gin.Context) {
			idx, err := os.ReadFile(idxPath)
			if err != nil {
				c.AbortWithStatus(http.StatusInternalServerError)
				log.Errorf("Failed to load index.html")
				return
			}
			c.Data(200, "text/html", idx)
		})
	}
	r.POST("/coordinator/connect", onCoordinatorConnect(coord))
	r.POST("/coordinator/disconnect", onCoordinatorDisconnect(coord))
	r.GET("/api/servers", onApiServers())
	r.GET("/api/news", onApiNews(db))
	r.GET("/discord", func(c *gin.Context) {
		c.Redirect(http.StatusTemporaryRedirect, "https://discord.gg/caQKCWFMrN")
	})
	r.GET("/auth/callback", onOpenIDCallback(db))
	r.GET("/patreon/callback", onPatreonCallback(db))
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
	authed := r.Use(authMiddleware(store.PAuthenticated, db))
	authed.GET("/api/whoami", onApiWhoAmI())

	// Admin access
	admin := r.Use(authMiddleware(store.PAdmin, db))
	admin.DELETE("/api/news/:news_id", onApiNewsDelete(db))
	admin.POST("/api/news/:news_id", onApiNewsUpdate(db))
	admin.POST("/api/news", onApiNewsCreate(db))

	return r, nil
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

func currentPerson(c *gin.Context) store.Person {
	p, found := c.Get("person")
	if !found {
		return store.NewPerson(0)
	}
	person, ok := p.(store.Person)
	if !ok {
		log.Warnf("Total not cast store.Person from session")
		return store.NewPerson(0)
	}
	return person
}

func onApiWhoAmI() gin.HandlerFunc {
	return func(c *gin.Context) {
		//if !p.SteamID.Valid() {
		//	responseErr(c, http.StatusForbidden, nil)
		//	return
		//}
		//friendList, err := steamweb.GetFriendList(p.SteamID)
		//if err != nil && !strings.Contains(err.Error(), "Invalid status code") {
		//	responseErr(c, http.StatusServiceUnavailable, "Could not fetch friends")
		//	return
		//}
		//var friendIds steamid.Collection
		//for _, f := range friendList {
		//	friendIds = append(friendIds, f.Steamid)
		//}
		//friends, err := steamweb.PlayerSummaries(friendIds)
		//if err != nil && len(friendIds) > 0 {
		//	responseErr(c, http.StatusServiceUnavailable, "Could not fetch summaries")
		//	return
		//}
		responseOK(c, http.StatusOK, currentPerson(c))
	}
}

func newsFromParam(c *gin.Context, db store.StorageInterface) (store.News, error) {
	var news store.News
	idStr := c.Param("news_id")
	newsId, errP := strconv.ParseInt(idStr, 10, 64)
	if errP != nil {
		return news, errP
	}
	e := db.NewsByID(c, newsId, &news)
	return news, e

}
func onApiNewsDelete(db store.StorageInterface) gin.HandlerFunc {
	return func(c *gin.Context) {
		n, e := newsFromParam(c, db)
		if e != nil {
			if e == store.ErrNoResult {
				responseErr(c, http.StatusNotFound, nil)
				return
			}
			responseErr(c, http.StatusInternalServerError, nil)
			return
		}
		if errDel := db.NewsDelete(c, &n); errDel != nil {
			responseErr(c, http.StatusInternalServerError, nil)
			return
		}
		responseOK(c, http.StatusNoContent, nil)
	}
}

type discordWH struct {
	Username  string `json:"username"`
	AvatarURL string `json:"avatar_url"`
	Content   string `json:"content"`
}

type updateNewsPayload struct {
	Title     string `json:"title"`
	BodyMD    string `json:"body_md"`
	Published bool   `json:"published"`
}

const botTitle = "Uncletopia Announcement"

func sendWebhook(m discordWH) {
	httpClient := &http.Client{Timeout: time.Second * 15}
	b, errEnc := json.Marshal(m)
	if errEnc != nil {
		log.Errorf("Failed to marshal discord announcement: %v", errEnc)
		return
	}
	cx, cancel := context.WithTimeout(context.Background(), time.Second*15)
	defer cancel()
	req, errReq := http.NewRequestWithContext(cx, "POST", config.Hook.DiscordAnnouncement, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	if errReq != nil {
		log.Errorf("Failed to create announcement request: %v", errEnc)
		return
	}
	resp, errResp := httpClient.Do(req)
	if errResp != nil {
		log.Errorf("Failed to send announcement request: %v", errEnc)
		return
	}
	if resp.StatusCode >= 400 {
		be, e := ioutil.ReadAll(resp.Body)
		if e != nil {
			log.Errorf("Failed to read error body: %v", e)
			return
		}
		defer func() { _ = resp.Body.Close() }()
		log.Errorf("Invalid response code for webhook: %d\n%v", resp.StatusCode, be)
		return
	}
	log.Infof("Sent announcement to discord")
}

func onApiNewsCreate(db store.StorageInterface) gin.HandlerFunc {
	return func(c *gin.Context) {
		p := currentPerson(c)
		var r updateNewsPayload
		if err := c.BindJSON(&r); err != nil {
			responseErr(c, http.StatusInternalServerError, nil)
			return
		}
		var u store.News
		u.BodyMD = r.BodyMD
		u.CreatedOn = time.Now()
		u.UpdatedOn = time.Now()
		u.Title = r.Title
		u.Published = r.Published
		u.SteamID = p.SteamID
		if errDel := db.NewsSave(c, &u); errDel != nil {
			responseErr(c, http.StatusInternalServerError, nil)
			return
		}
		responseOK(c, http.StatusNoContent, nil)
		go sendWebhook(discordWH{Content: u.Title + "\n\n" + u.BodyMD, Username: botTitle})

	}
}

func onApiNewsUpdate(db store.StorageInterface) gin.HandlerFunc {
	return func(c *gin.Context) {
		n, e := newsFromParam(c, db)
		if e != nil {
			if e == store.ErrNoResult {
				responseErr(c, http.StatusNotFound, nil)
				return
			}
			responseErr(c, http.StatusInternalServerError, nil)
			return
		}
		var u updateNewsPayload
		if err := c.BindJSON(&u); err != nil {
			responseErr(c, http.StatusInternalServerError, nil)
			return
		}
		n.BodyMD = u.BodyMD
		n.Title = u.Title
		n.Published = u.Published

		if errDel := db.NewsSave(c, &n); errDel != nil {
			responseErr(c, http.StatusInternalServerError, nil)
			return
		}
		responseOK(c, http.StatusNoContent, nil)
		go sendWebhook(discordWH{Content: u.Title + "\n\n" + u.BodyMD, Username: botTitle})
	}
}

func onApiNews(db store.StorageInterface) gin.HandlerFunc {
	opts := html.RendererOptions{
		Flags: html.CommonFlags,
	}
	renderer := html.NewRenderer(opts)
	return func(c *gin.Context) {
		var rendered []store.News
		news, err := db.News(c, false)
		if err != nil {
			responseErr(c, http.StatusInternalServerError, "Internal error")
			return
		}
		for _, n := range news {
			n.BodyHTML = string(markdown.ToHTML([]byte(n.BodyMD), nil, renderer))
			rendered = append(rendered, n)
		}
		responseOK(c, http.StatusOK, rendered)
	}
}

func onApiServers() gin.HandlerFunc {
	return func(c *gin.Context) {
		states := servers()
		responseOK(c, http.StatusOK, states)
	}
}

type coordClientReq struct {
	Sid steamid.SID64 `json:"sid"`
}

func onCoordinatorConnect(coord *coordinator.Coordinator) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req coordClientReq
		if err := c.BindJSON(&req); err != nil {
			responseErr(c, http.StatusInternalServerError, nil)
			return
		}
		coord.ClientConnected(coordinator.NewClient(req.Sid, c.ClientIP(), &coordinator.Filters{}))
		responseOK(c, http.StatusNoContent, nil)
	}
}

func onCoordinatorDisconnect(coord *coordinator.Coordinator) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req coordClientReq
		if err := c.BindJSON(&req); err != nil {
			responseErr(c, http.StatusInternalServerError, nil)
			return
		}
		coord.ClientDisconnected(coordinator.NewClient(req.Sid, c.ClientIP(), &coordinator.Filters{}))
		responseOK(c, http.StatusNoContent, nil)
	}
}

func (a *Web) Serve(opts HTTPOpts) error {
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

func onOpenIDCallback(db store.StorageInterface) gin.HandlerFunc {
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
		person, errF := db.Person(c, sid)
		if errF != nil {
			if errF != store.ErrNoResult {
				log.Printf("Error verifying: %q\n", err)
				c.Redirect(302, ref)
				return
			}
			person = store.NewPerson(sid)
		}
		summaries, errSum := steamweb.PlayerSummaries(steamid.Collection{sid})
		if errSum != nil || len(summaries) == 0 {
			log.Warnf("Failed to fetch player profile: %v", errSum)
		}
		person.SteamProfile = &summaries[0]

		if errSave := db.PersonSave(c, &person); errSave != nil {
			log.Printf("Error saving person: %q\n", errSave)
			c.Redirect(302, ref)
			return
		}

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

func authMiddleware(level store.Privilege, db store.StorageInterface) gin.HandlerFunc {
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
			cx, cancel := context.WithTimeout(context.Background(), time.Second*6)
			defer cancel()
			loggedInPerson, err := db.Person(cx, sid)
			if err != nil {
				log.Errorf("Failed to load persons session user: %v", err)
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
			if level > loggedInPerson.PermissionLevel {
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
			c.Set("person", loggedInPerson)
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

func onPatreonCallback(db store.StorageInterface) gin.HandlerFunc {
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
		statePcs := strings.Split(state, "----")
		sid, err := sid64FromJWTToken(statePcs[0])
		if err != nil {
			log.Errorf("Failed to load persons session user: %v", err)
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()

		person, errP := db.Person(ctx, sid)
		if errP != nil {
			log.Errorf("Failed to load persons session user: %v", err)
			c.AbortWithStatus(http.StatusForbidden)
			return
		}

		form := url.Values{}
		form.Set("code", code)
		form.Set("grant_type", "authorization_code")
		form.Set("client_id", config.Patreon.ClientID)
		form.Set("client_secret", config.Patreon.ClientSecret)
		form.Set("redirect_uri", fmt.Sprintf("https://%s/patreon/callback", config.HTTP.Domain))

		req, errNR := http.NewRequestWithContext(ctx, "POST",
			"https://www.patreon.com/api/oauth2/token",
			strings.NewReader(form.Encode()))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

		if errNR != nil {
			log.WithError(errNR).Errorf("Failed to create patreon request")
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
		put := store.NewPatreonAuth(person.SteamID)
		if errD := decode(resp.Body, &put); errD != nil {
			log.Errorf("Faile to decode error message: %v", errD)
		}
		if errS := db.PatreonAuthSave(ctx, &put); errS != nil {
			log.WithError(errS).Errorf("Failed to save patreon token: %s", errS)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		pc, errPc := NewPatreonClient()
		if errPc != nil {
			log.WithError(errPc).Errorf("Failed to create patreon client: %s", errPc)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		u, errFu := pc.FetchUser()
		if errFu != nil {
			log.WithError(errPc).Errorf("Failed to fetch patreon user info: %s", errFu)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		person.PatreonUserID = u.Data.ID
		if errUs := db.PersonSave(c, &person); errUs != nil {
			log.WithError(errPc).Errorf("Failed to save patreon user id: %s", errUs)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		if errPUS := db.PatreonUserSave(ctx, &u.Data); errPUS != nil {
			log.WithError(errPc).Errorf("Failed to save patreon user info: %s", errPUS)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		c.Redirect(http.StatusTemporaryRedirect, "/donate")
		log.WithFields(log.Fields{
			"type":       put.TokenType,
			"expires_in": put.ExpiresIn,
			"scope":      put.Scope,
		}).Infof("New patreon OAuth token successfully granted")
	}
}
