package store

import (
	"context"
	"fmt"
	"github.com/leighmacdonald/steamid/v2/extra"
	"github.com/leighmacdonald/steamid/v2/steamid"
	"github.com/leighmacdonald/uncletopia-web/internal/config"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"math/rand"
	"os"
	"testing"
	"time"
)

var (
	testDb StorageInterface
)

func TestMain(m *testing.M) {
	rand.Seed(time.Now().UnixNano())
	config.Read()
	db, err := New(config.Database.DSN)
	if err != nil {
		log.Errorf("Failed to open db connection")
		os.Exit(2)
	}
	testDb = db
	os.Exit(m.Run())
}

func randServer() *Server {
	randNum := rand.Int31()
	return &Server{
		NameShort:      fmt.Sprintf("test-%d", randNum),
		NameLong:       fmt.Sprintf("Test Server | %d", randNum),
		Host:           fmt.Sprintf("srv-%d.test.localhost", randNum),
		Port:           27015,
		Pass:           "",
		Region:         "na",
		Latitude:       float64(rand.Int31n(179)),
		Longitude:      float64(rand.Int31n(179)),
		IsEnabled:      true,
		CountryCode:    "ca",
		LastHadPlayers: time.Now(),
		State:          &extra.Status{},
	}
}

func TestPgStore_Servers(t *testing.T) {
	c := context.Background()
	s := randServer()
	require.NoError(t, testDb.ServerSave(c, s))
	require.Greater(t, s.ServerId, 0, "Save did not set server_id")

	servers, errServers := testDb.Servers(c)
	require.NoError(t, errServers)
	require.True(t, servers.Contains(s), "Missing server in results")

	require.NoError(t, testDb.ServerDelete(c, s))
	servers2, errServers2 := testDb.Servers(c)
	require.NoError(t, errServers2)
	require.False(t, servers2.Contains(s))
	require.True(t, servers.Contains(s), "Missing server in deleted results")

}

func TestPgStore_Person(t *testing.T) {
	ctx := context.Background()
	sid := steamid.SID64(76561197961279983)
	p := NewPerson(sid)
	p.SteamProfile.PersonaName = "test-1"
	require.NoError(t, testDb.PersonSave(ctx, &p))
	pf, ef := testDb.Person(ctx, sid)
	require.NoError(t, ef, "Failed to fetch person")
	require.EqualValues(t, p.SteamProfile.PersonaName, pf.SteamProfile.PersonaName)
}
