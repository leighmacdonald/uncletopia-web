package app

import (
	"context"
	"crypto/tls"
	"github.com/leighmacdonald/uncletopia-web/internal/config"
	"github.com/leighmacdonald/uncletopia-web/internal/servers"
	"github.com/leighmacdonald/uncletopia-web/internal/store"
	"github.com/leighmacdonald/uncletopia-web/internal/web"
	"github.com/leighmacdonald/uncletopia-web/pkg/coordinator"
	log "github.com/sirupsen/logrus"
	"net/http"
	"time"
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

	w, errWeb := web.New(s, c)
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
	go func() {
		doUpdate := func(x context.Context) {
			sc, cancel := context.WithTimeout(ctx, time.Second*5)
			defer cancel()
			serverCol, err := s.Servers(sc)
			if err != nil {
				log.Errorf("Failed to fetch servers to update")
				return
			}
			servers.Update(serverCol)
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
