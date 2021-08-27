package store

import (
	"context"
	"github.com/leighmacdonald/steamid/v2/steamid"
	"gopkg.in/mxpv/patreon-go.v1"
	"time"
)

type StorageInterface interface {
	// Version returns the current database schema version
	Version(ctx context.Context) (int, error)
	// Exec provides a generic SQL interface for executing direct queries.
	// Should only be used for special cases.
	Exec(ctx context.Context, raw string, args ...interface{}) error

	// ServerSave inserts or updates the server instance depending if it has a server_id > 0
	ServerSave(ctx context.Context, server *Server) error
	// ServerDelete fully drops the server from the system. There is no soft-deletion yet
	ServerDelete(ctx context.Context, server *Server) error
	// Servers provides all the servers tracked
	Servers(ctx context.Context) (ServerCollection, error)

	// Donations returns all donations
	Donations(ctx context.Context) ([]Donation, error)

	PatreonAuth(ctx context.Context, sid *steamid.SID64) (*PatreonAuth, error)
	PatreonAuthSave(ctx context.Context, pa *PatreonAuth) error
	PatreonAuthOlderThan(ctx context.Context, dt time.Time) ([]*PatreonAuth, error)

	PatreonUserSave(ctx context.Context, pa *patreon.User) error
	PatreonUser(ctx context.Context, userID string) (*patreon.User, error)

	Person(ctx context.Context, sid steamid.SID64) (Person, error)
	PersonSave(ctx context.Context, p *Person) error
	PersonDelete(ctx context.Context, p *Person) error

	News(ctx context.Context, showUnPublished bool) ([]News, error)
	NewsSave(ctx context.Context, p *News) error
	NewsDelete(ctx context.Context, p *News) error
}
