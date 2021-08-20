package app

import (
	"context"
	"crypto/tls"
	"github.com/leighmacdonald/uncletopia-web/internal/config"
	"github.com/leighmacdonald/uncletopia-web/internal/store"
	"github.com/leighmacdonald/uncletopia-web/internal/web"
	log "github.com/sirupsen/logrus"
	"net/http"
)

type App struct {
	ctx    context.Context
	store  store.StorageInterface
	router http.Handler
	http   *http.Server
}

func (a App) Start() {

	if err := a.http.ListenAndServe(); err != nil {
		log.Fatalf("Error returned by listener: %v", err)
	}
}

func New() (*App, error) {
	s, errStore := store.New(config.Database.DSN)
	if errStore != nil {
		return nil, errStore
	}

	w, errWeb := web.New(s)
	if errWeb != nil {
		return nil, errWeb
	}
	opts := web.DefaultHTTPOpts()
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

	return &App{
		ctx:    context.Background(),
		store:  s,
		router: w,
		http:   h,
	}, nil
}
