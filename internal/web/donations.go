package web

import (
	"context"
	"github.com/gin-gonic/gin"
	"github.com/leighmacdonald/uncletopia-web/internal/config"
	"github.com/pkg/errors"
	"golang.org/x/oauth2"
	"gopkg.in/mxpv/patreon-go.v1"
	"net/http"
	"time"
)

func onPatreonWebhook(c *gin.Context) {
	var pledge patreon.WebhookPledge
	if err := c.BindJSON(&pledge); err != nil {
		c.String(http.StatusInternalServerError, "Internal error")
		return
	}
}

func NewPatreonClient() (*patreon.Client, error) {
	cfg := oauth2.Config{
		ClientID:     config.Patreon.ClientID,
		ClientSecret: config.Patreon.ClientSecret,
		Endpoint: oauth2.Endpoint{
			AuthURL:  patreon.AuthorizationURL,
			TokenURL: patreon.AccessTokenURL,
		},
		Scopes: []string{"users", "pledges-to-me", "my-campaign"},
	}
	token := oauth2.Token{
		AccessToken:  config.Patreon.AccessToken,
		RefreshToken: config.Patreon.RefreshToken,
		// Must be non-nil, otherwise token will not be expired
		Expiry: time.Now().Add(-24 * time.Hour),
	}
	client := patreon.NewClient(cfg.Client(context.Background(), &token))
	_, err := client.FetchUser()
	if err != nil {
		return nil, errors.Wrap(err, "Failed sanity check request")
	}

	return client, nil
}
