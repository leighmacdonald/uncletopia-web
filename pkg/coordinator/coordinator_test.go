package coordinator

import (
	"context"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestCoordinator_Queue(t *testing.T) {
	ctx := context.Background()
	defer ctx.Done()
	gc := New()
	queuedClients := 0
	gc.registerOnQueueReady(func(client *Client) error {
		queuedClients++
		return nil
	})

	go gc.start(ctx)

	clients := ClientCollection{
		NewClient(1000, "10.0.0.1", &Filters{
			regions:     []string{"us-west", "us-central"},
			maxDistance: 500,
		}),
		NewClient(1001, "10.0.0.2", &Filters{
			regions:     []string{"us-west"},
			maxDistance: 1500,
		}),
		NewClient(1002, "10.0.0.3", &Filters{
			regions:     []string{"eu"},
			maxDistance: 3000,
		}),
		NewClient(1003, "10.0.0.4", &Filters{
			regions:     []string{"au"},
			maxDistance: 5000,
		}),
	}
	for _, client := range clients {
		require.NoError(t, gc.Queue(client), "Failed to queue client")
	}
	require.Equal(t, len(clients), gc.queueSize())
}
