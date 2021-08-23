package donation

import (
	"context"
	"github.com/gin-gonic/gin"
	"github.com/leighmacdonald/uncletopia-web/internal/config"
	"github.com/leighmacdonald/uncletopia-web/internal/store"
	"golang.org/x/oauth2"
	"gopkg.in/mxpv/patreon-go.v1"
	"net/http"
	"strings"
	"time"
)

func onPatreonWebhook(c *gin.Context) {
	var pledge patreon.WebhookPledge
	if err := c.BindJSON(&pledge); err != nil {
		c.String(http.StatusInternalServerError, "Internal error")
		return
	}
}

func NewPatreonClient(pa *store.PatreonAuth) (*patreon.Client, error) {
	cfg := oauth2.Config{
		ClientID:     config.Patreon.ClientID,
		ClientSecret: config.Patreon.ClientSecret,
		Endpoint: oauth2.Endpoint{
			AuthURL:  patreon.AuthorizationURL,
			TokenURL: patreon.AccessTokenURL,
		},
		Scopes: strings.Split(pa.Scope, " "),
	}
	token := oauth2.Token{
		AccessToken:  pa.AccessToken,
		RefreshToken: pa.RefreshToken,
		// Must be non-nil, otherwise token will not be expired
		Expiry: pa.UpdatedOn.Add(time.Duration(pa.ExpiresIn) * time.Second),
	}
	client := patreon.NewClient(cfg.Client(context.Background(), &token))
	return client, nil
}

// patreonTokenRefresh
//
// Tokens are valid for up to one month after they are issued.
func patreonTokenRefresh() {

}
