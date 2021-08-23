package coordinator

// coordinator intends to provide a service similar to valves own built in
// matchmaking / game coordinator system.  It's intended to be used from the website
// to use all the queueing features.
//
// - Filter by specific server locations
// - Filter by selectable radius around the client location
// - Filter by preselected regions eg: us west, us central, us east, eu, sa
//
// For this to work well for all users some caveats will exist.
//
// Empty server:
// - No restrictions on how you can join. via console, server browser or site is all equal.
//
// Full server:
// - People connecting via in-game browser or console will get a (friendlier) message similar to valves
// "No Ad-Hoc connections can be made..." when trying to join a casual game manually. It will direct them to the
// website where they can join the queue process.
// - Automatically allocate in-game failed connection users into the queue at the time they tried to connect. If
// they decide to then go to the site to sit in the queue, well give them their initial queue position they would
// have otherwise had.
// - Super cool queue notification sound bap.wav?
// - Show queue positions
// - Show other queued players?
// - Queued player live chat/mini-games room?
//
import (
	"context"
	"github.com/leighmacdonald/steamid/v2/steamid"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"sync"
	"time"
)

type onQueueFn func(*Client) error

type ClientCollection []*Client

func (col *ClientCollection) remove(c *Client) bool {
	var newCol ClientCollection
	removed := false
	for _, client := range *col {
		if client == c {
			removed = true
			continue
		}
		newCol = append(newCol, client)
	}
	*col = newCol
	return removed
}

func (col *ClientCollection) add(c *Client) {
	*col = append(*col, c)
}

func (col *ClientCollection) exists(c *Client) bool {
	for _, client := range *col {
		if client == c {
			return true
		}
	}
	return false
}

type Coordinator struct {
	// Clients waiting in  FIFO queue
	clients ClientCollection
	// How long a client is given to connect to a server once initiating the queue connection trigger
	// They will be dropped and the next client takes their position
	connectionTimeAllowance time.Duration
	clientsMu               *sync.RWMutex
	onQueueReady            onQueueFn
}

func (c *Coordinator) registerOnQueueReady(fn onQueueFn) {
	c.onQueueReady = fn
}

func (c *Coordinator) start(ctx context.Context) {
	queueUpdateTicker := time.NewTicker(time.Second)
	for {
		select {
		case <-queueUpdateTicker.C:
			c.clientsMu.Lock()
			var expiredClients []*Client
			for _, client := range c.clients {
				if client.expired() {
					log.WithFields(log.Fields{"sid": client.sid, "addr": client.ipAddr}).
						Warnf("Client queue expired")
					expiredClients = append(expiredClients, client)
				}
			}
			for _, exC := range expiredClients {
				c.clients.remove(exC)
			}

			c.clientsMu.Unlock()
		case <-ctx.Done():
			// Send disconnects to existing queue?
			return
		}
	}
}

func (c *Coordinator) queueSize() int {
	c.clientsMu.RLock()
	defer c.clientsMu.RUnlock()
	return len(c.clients)
}

func (c *Coordinator) IsQueued(sid steamid.SID64) bool {
	c.clientsMu.RLock()
	defer c.clientsMu.RUnlock()
	for _, client := range c.clients {
		if client.sid == sid {
			return true
		}
	}
	return false
}

func (c *Coordinator) Queue(client *Client) error {
	if c.IsQueued(client.sid) {
		return errors.New("duplicate")
	}
	c.clientsMu.Lock()
	c.clients.add(client)
	c.clientsMu.Unlock()
	cLog(client).Infof("Client queued successfully")
	return nil
}

func cLog(c *Client) *log.Entry {
	return log.WithFields(log.Fields{"sid": c.sid, "addr": c.ipAddr})
}

func (c *Coordinator) ClientConnected(client *Client) {
	// Client connected to the server. Remove them from the active queue
	c.clients.remove(client)
	cLog(client).Infof("Client connected successfully")
}

func (c *Coordinator) ClientDisconnected(client *Client) {
	// Client disconnected, slot opened.
	// Check for open servers matching the players options
	//
	cLog(client).Infof("Client disconnected from server")
}

func New() *Coordinator {
	return &Coordinator{
		clients:                 nil,
		connectionTimeAllowance: 60 * time.Second,
		clientsMu:               &sync.RWMutex{},
	}
}

type Filters struct {
	// "pl only", "24/7 2fort", etc.
	gameTypes []string
	regions   []string
	// Location
	lat float64
	lon float64
	// Geographic radius (km) from the client position
	maxDistance float64
}

type Client struct {
	// First queued
	started time.Time
	// Last ping/keep-alive
	update  time.Time
	sid     steamid.SID64
	ipAddr  string
	filters *Filters
}

func (client Client) expired() bool {
	return time.Since(client.update) > time.Second*30
}

func NewClient(sid steamid.SID64, ipaddr string, filters *Filters) *Client {
	return &Client{
		started: time.Now(),
		update:  time.Now(),
		sid:     sid,
		ipAddr:  ipaddr,
		filters: filters,
	}
}
