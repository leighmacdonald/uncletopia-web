package web

import (
	"fmt"
	"github.com/leighmacdonald/rcon"
	"github.com/leighmacdonald/steamid/v2/extra"
	"github.com/leighmacdonald/uncletopia-web/internal/store"
	"github.com/pkg/errors"
)

func connect(server *store.Server) (*rcon.RemoteConsole, error) {
	return rcon.Dial(fmt.Sprintf("%s:%d", server.Host, server.Port), server.Pass)
}

func queryExec(server *store.Server, command string) (string, error) {
	rc, err := connect(server)
	if err != nil {
		return "", errors.Wrapf(err, "Could not dial remote servers: %v", err)
	}
	_, err = rc.Write(command)
	if err != nil {
		return "", errors.Wrapf(err, "Could not write request: %v", err)
	}
	resp, _, err := rc.Read()
	if err != nil {
		return "", errors.Wrapf(err, "Could not read response: %v", err)
	}
	return resp, err
}

func queryStatus(server *store.Server) (extra.Status, error) {
	resp, err := queryExec(server, "status")
	if err != nil {
		return extra.Status{}, errors.Wrapf(err, "Could not execute command")
	}
	return extra.ParseStatus(resp, true)
}
