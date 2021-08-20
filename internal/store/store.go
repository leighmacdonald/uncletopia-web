package store

import "context"

type StorageInterface interface {
	ServerAdd(ctx context.Context, server *Server) error
	ServerDelete(ctx context.Context, server *Server) error
	Servers(ctx context.Context) (ServerCollection, error)

	Donations(ctx context.Context) ([]Donation, error)
}
