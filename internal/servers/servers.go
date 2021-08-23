package servers

import (
	"github.com/leighmacdonald/uncletopia-web/internal/store"
	"github.com/pkg/errors"
	"github.com/rumblefrog/go-a2s"
	log "github.com/sirupsen/logrus"
	"sync"
)

type ServerInfoCollection map[string]*a2s.ServerInfo

var (
	serverInfo   = ServerInfoCollection{}
	serverInfoMu = &sync.RWMutex{}
)

func Update(servers store.ServerCollection) {
	responses := make(map[string]*a2s.ServerInfo)
	mu := &sync.RWMutex{}
	wg := &sync.WaitGroup{}
	for _, s := range servers {
		wg.Add(1)
		go func(server *store.Server) {
			defer wg.Done()
			resp, err := a2sQuery(server)
			if err != nil {
				log.Errorf("A2S: %v", err)
				return
			}
			mu.Lock()
			responses[server.NameShort] = resp
			mu.Unlock()
		}(s)
	}
	wg.Wait()
	serverInfoMu.Lock()
	serverInfo = responses
	serverInfoMu.Unlock()
}

// Servers returns a copy of the current server state
func Servers() ServerInfoCollection {
	serverInfoMu.RLock()
	defer serverInfoMu.RUnlock()
	sic := serverInfo
	return sic
}

func a2sQuery(server *store.Server) (*a2s.ServerInfo, error) {
	client, err := a2s.NewClient(server.Addr())
	if err != nil {
		return nil, errors.Wrapf(err, "Failed to create a2s client")
	}
	defer func() {
		if errC := client.Close(); errC != nil {
			log.WithFields(log.Fields{"server": server.NameShort}).Errorf("Failed to close a2s client: %v", errC)
		}
	}()
	info, errQ := client.QueryInfo() // QueryInfo, QueryPlayer, QueryRules
	if errQ != nil {
		return nil, errors.Wrapf(errQ, "Failed to query server info")
	}
	return info, nil
}
