package store

import (
	"context"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

var (
	// Use $ for pg based queries
	sb = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

	ErrDuplicate = errors.New("Duplicate entity")
	ErrNoResult  = errors.New("No results")
)

// dbErr is used to wrap common database errors in own own error types
func dbErr(err error) error {
	if err == nil {
		return err
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case pgerrcode.UniqueViolation:
			return ErrDuplicate
		default:
			log.Errorf("Unhandled store error: (%s) %s", pgErr.Code, pgErr.Message)
			return err
		}
	}
	if err.Error() == "no rows in result set" {
		return ErrNoResult
	}
	return err
}

type pgStore struct {
	db *pgxpool.Pool
}

func (s pgStore) ServerAdd(ctx context.Context, server *Server) error {
	port := 27015
	if server.Port > 0 {
		port = server.Port
	}
	q, a, e := sb.
		Insert("server").
		Columns("name_short", "name_long", "host", "port", "pass", "region", "cc", "is_enabled", "location").
		Values(server.NameShort, server.NameLong, server.Host, port, server.Pass,
			server.Region, server.CountryCode, server.IsEnabled,
			fmt.Sprintf(`POINT(%f %f)`, server.Longitude, server.Latitude)).
		Suffix("RETURNING server_id").
		ToSql()
	if e != nil {
		return dbErr(e)
	}
	return s.db.QueryRow(ctx, q, a...).Scan(&server.ServerId)
}

func (s pgStore) ServerDelete(ctx context.Context, server *Server) error {
	if server.ServerId == 0 {
		return errors.New("Detached instance")
	}
	q, a, e := sb.Delete("server").Where(sq.Eq{"server_id": server.ServerId}).ToSql()
	if e != nil {
		return e
	}
	_, err := s.db.Exec(ctx, q, a...)
	if err != nil {
		return dbErr(err)
	}
	server.ServerId = 0
	return nil
}

func (s pgStore) Servers(ctx context.Context) (ServerCollection, error) {
	q, a, e := sb.Select("server_id", "name_short", "name_long", "host", "port",
		"pass", "region", "cc", "is_enabled", "ST_X(location::geometry)", "ST_Y(location::geometry)").
		From("server").
		ToSql()
	if e != nil {
		return nil, e
	}
	var servers ServerCollection
	rows, err := s.db.Query(ctx, q, a...)
	if err != nil {
		return nil, dbErr(err)
	}
	for rows.Next() {
		server := &Server{}
		if errS := rows.Scan(&server.ServerId, &server.NameShort, &server.NameLong,
			&server.Host, &server.Port, &server.Pass, &server.Region, &server.CountryCode, &server.IsEnabled,
			&server.Longitude, &server.Latitude,
		); errS != nil {
			return nil, dbErr(err)
		}
		servers = append(servers, server)
	}
	return servers, nil
}

func (s pgStore) Donations(ctx context.Context) ([]Donation, error) {
	panic("implement me")
}

// New sets up underlying required services.
func New(dsn string) (StorageInterface, error) {
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, errors.Wrapf(err, "Unable to parse config: %v", err)
	}
	dbConn, errConn := pgxpool.ConnectConfig(context.Background(), cfg)
	if errConn != nil {
		return nil, errors.Wrapf(errConn, "Failed to connect to database: %v", errConn)
	}
	return &pgStore{db: dbConn}, nil
}

func (s pgStore) Close() {
	if s.db != nil {
		s.db.Close()
	}
}
