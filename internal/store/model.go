package store

import (
	"fmt"
	"github.com/leighmacdonald/steamid/v2/extra"
	"github.com/leighmacdonald/steamid/v2/steamid"
	"github.com/leighmacdonald/steamweb"
	"time"
)

type Privilege uint8

const (
	PGuest         Privilege = 1
	PBanned        Privilege = 2 // Logged in, but is banned
	PAuthenticated Privilege = 10
	PModerator     Privilege = 50
	PAdmin         Privilege = 100
)

type PatreonAuth struct {
	SteamID      steamid.SID64 `json:"steam_id,int64"`
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	ExpiresIn    int           `json:"expires_in"`
	Scope        string        `json:"scope"`
	TokenType    string        `json:"token_type"`
	CreatedOn    time.Time     `json:"-"`
	UpdatedOn    time.Time     `json:"-"`
}

func NewPatreonAuth(sid steamid.SID64) PatreonAuth {
	return PatreonAuth{SteamID: sid, CreatedOn: time.Now(), UpdatedOn: time.Now()}
}

type News struct {
	NewsID    int           `json:"news_id"`
	SteamID   steamid.SID64 `json:"steam_id,int64"`
	Title     string        `json:"title"`
	BodyMD    string        `json:"body_md"`
	BodyHTML  string        `json:"body_html"`
	CreatedOn time.Time     `json:"created_on"`
	UpdatedOn time.Time     `json:"updated_on"`
	PublishOn time.Time     `json:"publish_on"`
}

type Donation struct {
}

type ServerCollection []*Server

func (c ServerCollection) Contains(s *Server) bool {
	for _, server := range c {
		if server.NameShort == s.NameShort {
			return true
		}
	}
	return false
}

func (c ServerCollection) FilterEnabled() ServerCollection {
	var nc ServerCollection
	for _, server := range c {
		if server.IsEnabled {
			nc = append(nc, server)
		}
	}
	return nc
}

type Server struct {
	ServerId       int           `json:"server_id"`
	NameShort      string        `json:"name_short"`
	NameLong       string        `json:"name_long"`
	Host           string        `json:"host"`
	Port           int           `json:"port"`
	Pass           string        `json:"-"`
	Region         string        `json:"region"`
	Latitude       float64       `json:"latitude"`
	Longitude      float64       `json:"longitude"`
	IsEnabled      bool          `json:"is_enabled"`
	CountryCode    string        `json:"cc"`
	LastHadPlayers time.Time     `json:"last_had_players"`
	State          *extra.Status `json:"state"`
}

func (s Server) Addr() string {
	return fmt.Sprintf("%s:%d", s.Host, s.Port)
}

type Person struct {
	SteamID         steamid.SID64           `json:"steam_id"`
	PatreonUserID   string                  `json:"patreon_user_id"`
	CreatedOn       time.Time               `json:"created_on"`
	UpdatedOn       time.Time               `json:"updated_on"`
	LastLogin       time.Time               `json:"last_login"`
	PermissionLevel Privilege               `json:"permission_level"`
	SteamProfile    *steamweb.PlayerSummary `json:"steam_profile"`
}

// LoggedIn checks for a valid steamID
func (p *Person) LoggedIn() bool {
	return p.SteamID.Valid() && p.SteamID.Int64() > 0
}

// NewPerson allocates a new default person instance
func NewPerson(sid64 steamid.SID64) *Person {
	return &Person{
		SteamID:         sid64,
		CreatedOn:       time.Now(),
		UpdatedOn:       time.Now(),
		SteamProfile:    &steamweb.PlayerSummary{},
		PermissionLevel: PAuthenticated,
	}
}
