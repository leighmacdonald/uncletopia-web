// +build patreon

package donation

import (
	"encoding/json"
	"github.com/leighmacdonald/golib"
	"github.com/leighmacdonald/uncletopia-web/internal/config"
	"github.com/leighmacdonald/uncletopia-web/internal/store"
	"github.com/stretchr/testify/require"
	"gopkg.in/mxpv/patreon-go.v1"
	"io/ioutil"
	"testing"
)

var (
	testClient *patreon.Client
)

func testPatreonClient(t *testing.T) *patreon.Client {
	if testClient == nil {
		config.Read()
		fp := golib.FindFile(".patreon_test_token.json", "uncletopia-web")
		if fp == "" {
			t.Skipf("Test token file does not exist: ~/.patreon_test_token.json")
		}
		b, e := ioutil.ReadFile(fp)
		if e != nil {
			t.Skipf("Failed to read test tokenot: %v", e)
		}
		var pa store.PatreonAuth
		if err := json.Unmarshal(b, &pa); err != nil {
			t.Skipf("Failed to decode test tokenot: %v", err)
		}
		client, err := NewPatreonClient(&pa)
		require.NoError(t, err)
		testClient = client
	}
	return testClient
}

func TestGetUser(t *testing.T) {
	user, err2 := testPatreonClient(t).FetchUser()
	require.NoError(t, err2)
	require.True(t, user.Data.ID != "")
}

func TestGetPledges(t *testing.T) {
	c := testPatreonClient(t)
	campaigns, err := c.FetchCampaign()
	require.NoError(t, err)
	require.True(t, len(campaigns.Data) == 3)
	pledges, err2 := c.FetchPledges(campaigns.Data[0].ID)
	require.NoError(t, err2)
	require.True(t, len(pledges.Data) >= 0)
}
