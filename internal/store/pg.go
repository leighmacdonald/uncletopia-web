package store

import (
	"context"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/leighmacdonald/steamid/v2/steamid"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gopkg.in/mxpv/patreon-go.v1"
	"time"
)

var (
	// Use $ for pg based queries
	sb = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

	ErrDuplicate = errors.New("Duplicate entity")
	ErrNoResult  = errors.New("No results")
	ErrNoTable   = errors.New("Table does not exist")
)

// dbErr is used to wrap common database errors in owr own error types
func dbErr(err error) error {
	if err == nil {
		return err
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case pgerrcode.UndefinedTable:
			return ErrNoTable
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

func (s pgStore) News(ctx context.Context, showUnPublished bool) ([]News, error) {
	qb := sb.Select("news_id", "title", "body_md", "created_on", "updated_on",
		"publish_on", "steam_id").
		From("news").
		OrderBy("publish_on desc")
	if !showUnPublished {
		qb.Where(sq.Gt{"publish_on": time.Now()})
	}
	q, a, e := qb.ToSql()
	if e != nil {
		return nil, e
	}
	rows, err := s.db.Query(ctx, q, a...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var news []News
	for rows.Next() {
		var n News
		if eS := rows.Scan(&n.NewsID, &n.Title, &n.BodyMD, &n.CreatedOn, &n.UpdatedOn, &n.PublishOn, &n.SteamID); eS != nil {
			return nil, eS
		}
		news = append(news, n)
	}
	return news, nil
}

func (s pgStore) NewsSave(ctx context.Context, p *News) error {
	if p.NewsID > 0 {
		const qUpd = `
			UPDATE news set title = $2, body_md = $2, updated_on = $4, publish_on = $5, steam_id = $6 
			WHERE news_id = $1`
		_, e := s.db.Exec(ctx, qUpd, p.NewsID, p.Title, p.BodyMD, p.UpdatedOn, p.PublishOn, p.SteamID)
		if e != nil {
			return dbErr(e)
		}
	} else {
		const qIns = `
		INSERT INTO news (title, body_md, created_on, updated_on, publish_on, steam_id) 
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING news_id`
		if err := s.db.QueryRow(ctx, qIns, p.Title, p.BodyMD, p.CreatedOn, p.UpdatedOn, p.PublishOn, p.SteamID).Scan(&p.NewsID); err != nil {
			return dbErr(err)
		}
	}
	return nil
}

func (s pgStore) NewsDelete(ctx context.Context, p *News) error {
	if p.NewsID <= 0 {
		return ErrNoResult
	}
	_, err := s.db.Exec(ctx, "DELETE FROM news WHERE news_id = $1", p.NewsID)
	if err != nil {
		return dbErr(err)
	}
	p.NewsID = 0
	return nil
}

func (s pgStore) PatreonUserSave(ctx context.Context, pa *patreon.User) error {
	const q = `
		INSERT INTO patreon_user 
		VALUES ($1, $2, $3) 
		ON CONFLICT (patreon_user_id) 
    	DO UPDATE SET user_data = $2`
	_, err := s.db.Exec(ctx, q, pa.ID, pa, time.Now())
	return dbErr(err)
}

func (s pgStore) PatreonUser(ctx context.Context, patreonUserID string) (*patreon.User, error) {
	const q = `SELECT user_data FROM patreon_user WHERE patreon_user_id = $1`
	var pu patreon.User
	if err := s.db.QueryRow(ctx, q, patreonUserID).Scan(&pu); err != nil {
		return nil, dbErr(err)
	}
	return &pu, nil
}

func (s pgStore) PatreonAuth(ctx context.Context, sid *steamid.SID64) (*PatreonAuth, error) {
	q, a, e := sb.
		Select("steam_id", "access_token", "refresh_token", "expires_in", "scope",
			"token_type", "created_on", "updated_on").
		From("patreon_auth").
		Where(sq.Gt{"steam_id": sid}).
		ToSql()
	if e != nil {
		return nil, dbErr(e)
	}
	var pa PatreonAuth
	errQ := s.db.QueryRow(ctx, q, a...).Scan(
		&pa.SteamID, &pa.AccessToken, &pa.RefreshToken, &pa.ExpiresIn,
		&pa.Scope, &pa.TokenType, &pa.CreatedOn, &pa.UpdatedOn)
	if errQ != nil {
		return nil, dbErr(errQ)
	}
	return &pa, nil
}

func (s pgStore) Person(ctx context.Context, sid steamid.SID64) (Person, error) {
	const q = `
		SELECT 
		    p.steam_id, p.patreon_user_id, p.permission_level, p.last_login, p.created_on, p.updated_on,
		    sp.steam_id::varchar, sp.profilestate, sp.personaname, sp.profileurl, sp.avatar, sp.avatarmedium, 
		    sp.avatarfull, sp.avatarhash, sp.personastate, sp.realname, sp.timecreated, sp.loccountrycode, 
		    sp.locstatecode, sp.loccityid
		FROM person p
		LEFT JOIN steam_profile sp on p.steam_id = sp.steam_id
		WHERE p.steam_id = $1`
	p := NewPerson(0)
	if err := s.db.QueryRow(ctx, q, sid).Scan(&p.SteamID, &p.PatreonUserID, &p.PermissionLevel, &p.LastLogin,
		&p.CreatedOn, &p.UpdatedOn,
		&p.SteamProfile.Steamid, &p.SteamProfile.ProfileState, &p.SteamProfile.PersonaName, &p.SteamProfile.ProfileURL,
		&p.SteamProfile.Avatar, &p.SteamProfile.AvatarMedium, &p.SteamProfile.AvatarFull, &p.SteamProfile.AvatarHash,
		&p.SteamProfile.PersonaState, &p.SteamProfile.RealName, &p.SteamProfile.TimeCreated, &p.SteamProfile.LocCountryCode,
		&p.SteamProfile.LocStateCode, &p.SteamProfile.LocCityID); err != nil {
		return Person{}, dbErr(err)
	}
	return p, nil
}

func (s pgStore) PersonSave(ctx context.Context, p *Person) error {
	const pSql = `
		INSERT INTO person (steam_id, patreon_user_id, permission_level, last_login, created_on, updated_on) 
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (steam_id) DO UPDATE SET patreon_user_id = $2, permission_level = $3, last_login = $4, updated_on = $6`
	const sSql = `
		INSERT INTO steam_profile 
		    (steam_id, profilestate, personaname, profileurl, avatar, avatarmedium, 
		     avatarfull, avatarhash, personastate, realname, timecreated, loccountrycode, locstatecode, loccityid) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		ON CONFLICT (steam_id) DO UPDATE SET 
			profilestate = $2, personaname = $3, profileurl = $4, avatar = $5, avatarmedium = $6, 
		    avatarfull = $7, avatarhash = $8, personastate = $9, realname = $10, timecreated = $11, 
		    loccountrycode = $12, locstatecode = $13, loccityid = $14
`
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return dbErr(err)
	}
	_, e := tx.Exec(ctx, pSql, p.SteamID, p.PatreonUserID, p.PermissionLevel, p.LastLogin, p.CreatedOn, p.UpdatedOn)
	if e != nil {
		_ = tx.Rollback(ctx)
		return dbErr(e)
	}
	_, eS := tx.Exec(ctx, sSql, p.SteamID, p.SteamProfile.ProfileState, p.SteamProfile.PersonaName, p.SteamProfile.ProfileURL,
		p.SteamProfile.Avatar, p.SteamProfile.AvatarMedium, p.SteamProfile.AvatarFull, p.SteamProfile.AvatarHash,
		p.SteamProfile.PersonaState, p.SteamProfile.RealName, p.SteamProfile.TimeCreated, p.SteamProfile.LocCountryCode,
		p.SteamProfile.LocStateCode, p.SteamProfile.LocCityID)
	if eS != nil {
		_ = tx.Rollback(ctx)
		return dbErr(eS)
	}
	if errCommit := tx.Commit(ctx); errCommit != nil {
		_ = tx.Rollback(ctx)
		return dbErr(errCommit)
	}
	return nil
}

func (s pgStore) PersonDelete(ctx context.Context, p *Person) error {
	q, a, e := sb.Delete("person").Where(sq.Eq{"steam_id": p.SteamID}).ToSql()
	if e != nil {
		return e
	}
	_, err := s.db.Exec(ctx, q, a...)
	return dbErr(err)
}

func (s pgStore) PatreonAuthOlderThan(ctx context.Context, dt time.Time) ([]*PatreonAuth, error) {
	q, a, e := sb.
		Select("steam_id", "access_token", "refresh_token", "expires_in", "scope",
			"token_type", "created_on", "updated_on").
		From("patreon_auth").
		Where(sq.Gt{"updated_on": dt}).
		ToSql()
	if e != nil {
		return nil, e
	}
	var pas []*PatreonAuth
	rows, errQ := s.db.Query(ctx, q, a...)
	if errQ != nil {
		return nil, errQ
	}
	defer rows.Close()
	for rows.Next() {
		var pa PatreonAuth
		if err := rows.Scan(&pa.SteamID, &pa.AccessToken, &pa.RefreshToken, &pa.ExpiresIn,
			&pa.Scope, &pa.TokenType, &pa.CreatedOn, &pa.UpdatedOn); err != nil {
			return nil, err
		}
		pas = append(pas, &pa)
	}
	return pas, nil
}

func (s pgStore) PatreonAuthSave(ctx context.Context, pa *PatreonAuth) error {
	const q = `
		INSERT INTO  patreon_auth 
		    (steam_id, access_token, refresh_token, expires_in, scope, token_type, created_on, updated_on)
		VALUES
		    ($1, $2, $3,$4, $5, $6, $7, $8)
		ON CONFLICT (steam_id) DO UPDATE 
		SET access_token = $2, refresh_token = $3, expires_in = $4, scope = $5, token_type = $6, updated_on = $8`
	_, err := s.db.Exec(ctx, q, pa.SteamID, pa.AccessToken, pa.RefreshToken, pa.ExpiresIn, pa.Scope,
		pa.TokenType, pa.CreatedOn, pa.UpdatedOn)
	return dbErr(err)
}

func (s pgStore) Exec(ctx context.Context, raw string, args ...interface{}) error {
	_, err := s.db.Exec(ctx, raw, args...)
	return dbErr(err)
}

func (s pgStore) Version(ctx context.Context) (int, error) {
	const q = `SELECT version from _version where name = 'database'`
	var version int
	if err := s.db.QueryRow(ctx, q).Scan(&version); err != nil {
		return -1, dbErr(err)
	}
	return version, nil
}

func (s pgStore) ServerSave(ctx context.Context, server *Server) error {
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
	defer rows.Close()
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
	si := &pgStore{db: dbConn}
	diff, errM := migrate(si)
	if errM != nil {
		return nil, errors.Wrapf(errM, "Failed to migrate database")
	}
	if diff > 0 {
		log.Infof("Migrated database +%d", diff)
	}
	return si, nil
}

func (s pgStore) Close() {
	if s.db != nil {
		s.db.Close()
	}
}
