package store

import (
	"github.com/leighmacdonald/steamid/v2/extra"
	"github.com/leighmacdonald/steamid/v2/steamid"
	"github.com/leighmacdonald/steamweb"
	"net"
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

type Person struct {
	SteamID          steamid.SID64 `db:"steam_id" json:"steam_id"`
	Name             string        `db:"name" json:"name"`
	CreatedOn        time.Time     `db:"created_on" json:"created_on"`
	UpdatedOn        time.Time     `db:"updated_on" json:"updated_on"`
	PermissionLevel  Privilege     `db:"permission_level" json:"permission_level"`
	IsNew            bool          `db:"-" json:"-"`
	DiscordID        string        `db:"discord_id" json:"discord_id"`
	IPAddr           net.IP        `db:"ip_addr" json:"ip_addr"`
	CommunityBanned  bool
	VACBans          int
	GameBans         int
	EconomyBan       string
	DaysSinceLastBan int
	*steamweb.PlayerSummary
}

// LoggedIn checks for a valid steamID
func (p *Person) LoggedIn() bool {
	return p.SteamID.Valid() && p.SteamID.Int64() > 0
}

// NewPerson allocates a new default person instance
func NewPerson(sid64 steamid.SID64) *Person {
	return &Person{
		SteamID:         sid64,
		IsNew:           true,
		CreatedOn:       time.Now(),
		UpdatedOn:       time.Now(),
		PlayerSummary:   &steamweb.PlayerSummary{},
		PermissionLevel: PAuthenticated,
	}
}
