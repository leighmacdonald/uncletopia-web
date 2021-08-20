package coordinator

import (
	"context"
	"testing"
)

func TestCoordinator_Queue(t *testing.T) {
	ctx := context.Background()
	gc := New()
	queuedClients := 0
	gc.registerOnQueueReady(func(client *Client) error {
		queuedClients++
		return nil
	})
	gc.start(ctx)

}
