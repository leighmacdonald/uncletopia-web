package app

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"github.com/leighmacdonald/gbans/pkg/ip2location"
	"github.com/leighmacdonald/steamid/v2/steamid"
	"github.com/leighmacdonald/uncletopia-web/internal/config"
	"github.com/leighmacdonald/uncletopia-web/internal/store"
	"github.com/leighmacdonald/uncletopia-web/pkg/coordinator"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"sync"
	"time"
)

const serversUrl = "https://gbans.uncletopia.com/api/servers"

var (
	serverState   []serverInfo
	serverStateMu *sync.RWMutex
)

type App struct {
	ctx         context.Context
	store       store.StorageInterface
	router      http.Handler
	http        *http.Server
	coordinator *coordinator.Coordinator
}

func (a App) Start() {
	if err := a.http.ListenAndServe(); err != nil {
		log.Fatalf("Error returned by listener: %v", err)
	}
}

func New() (*App, error) {
	ctx := context.Background()
	c := coordinator.New()

	s, errStore := store.New(config.Database.DSN)
	if errStore != nil {
		return nil, errStore
	}

	w, errWeb := NewWeb(s, c)
	if errWeb != nil {
		return nil, errWeb
	}

	opts := DefaultHTTPOpts()
	h := &http.Server{
		Addr:           opts.ListenAddr,
		Handler:        w,
		ReadTimeout:    opts.ReadTimeout,
		WriteTimeout:   opts.WriteTimeout,
		MaxHeaderBytes: opts.MaxHeaderBytes,
	}
	if config.HTTP.TLS {
		tlsVar := &tls.Config{
			// Causes servers to use Go's default cipher suite preferences,
			// which are tuned to avoid attacks. Does nothing on clients.
			PreferServerCipherSuites: true,
			// Only use curves which have assembly implementations
			CurvePreferences: []tls.CurveID{
				tls.CurveP256,
				tls.X25519, // Go 1.8 only
			},
			MinVersion: tls.VersionTLS12,
			CipherSuites: []uint16{
				tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305, // Go 1.8 only
				tls.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,   // Go 1.8 only
				tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
				tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
			},
		}
		h.TLSConfig = tlsVar
	}
	go func() {
		httpClient := &http.Client{}
		doUpdate := func(x context.Context) {
			ct, cancel := context.WithTimeout(x, time.Second*5)
			defer cancel()
			req, errReq := http.NewRequestWithContext(ct, "GET", serversUrl, nil)
			if errReq != nil {
				log.Errorf("Failed to prepare to fetch servers to update: %v", errReq)
				return
			}
			resp, errDo := httpClient.Do(req)
			if errDo != nil {
				log.Errorf("Failed to fetch servers to update: %v", errDo)
				return
			}
			b, errRA := ioutil.ReadAll(resp.Body)
			if errRA != nil {
				return
			}
			defer resp.Body.Close()
			var si serverInfoResp
			if errDec := json.Unmarshal(b, &si); errDec != nil {
				log.Errorf("Failed to unmarshal server state: %v", errDec)
				return
			}
			serverStateMu.Lock()
			serverState = si.Data
			serverStateMu.Unlock()
		}
		t := time.NewTicker(time.Second * 30)
		doUpdate(ctx)
		for {
			select {
			case <-ctx.Done():
				return
			case <-t.C:
				doUpdate(ctx)
			}
		}
	}()
	return &App{
		ctx:         ctx,
		store:       s,
		router:      w,
		http:        h,
		coordinator: c,
	}, nil
}

func init() {
	serverStateMu = &sync.RWMutex{}
}

// servers returns a copy of the current server state
func servers() []serverInfo {
	serverStateMu.RLock()
	defer serverStateMu.RUnlock()
	sic := serverState
	return sic
}

type playerInfo struct {
	SteamID       steamid.SID64 `json:"steamid"`
	Name          string        `json:"name"`
	UserId        int           `json:"user_id"`
	ConnectedTime int64         `json:"connected_secs"`
}

type serverInfo struct {
	ServerID int64 `db:"server_id" json:"server_id"`
	// ServerName is a short reference name for the server eg: us-1
	ServerName     string `json:"server_name"`
	ServerNameLong string `json:"server_name_long"`
	Address        string `json:"address"`
	// Port is the port of the server
	Port              int                 `json:"port"`
	PasswordProtected bool                `json:"password_protected"`
	VAC               bool                `json:"vac"`
	Region            string              `json:"region"`
	CC                string              `json:"cc"`
	Location          ip2location.LatLong `json:"location"`
	CurrentMap        string              `json:"current_map"`
	Tags              []string            `json:"tags"`
	DefaultMap        string              `json:"default_map"`
	ReservedSlots     int                 `json:"reserved_slots"`
	CreatedOn         time.Time           `json:"created_on"`
	UpdatedOn         time.Time           `json:"updated_on"`
	PlayersMax        int                 `json:"players_max"`
	Players           []playerInfo        `json:"players"`
}

type serverInfoResp struct {
	Status  bool         `json:"status"`
	Message string       `json:"message"`
	Data    []serverInfo `json:"data"`
}
