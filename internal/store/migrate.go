package store

import (
	"context"
	"embed"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"io/fs"
	"regexp"
	"strconv"
	"strings"
	"time"
)

//go:embed migrations/*.sql
var sqlFiles embed.FS

// migrate performs the schema updates automatically from the apps current database state.
// schema files are embedded using go's embed feature of 1.16
// They are stored under internal/store/migrations or ./migrations relative to this file.
//
// sql files must match the following format, where the number prefix corresponds to
// the database version.
//
// 00001_create_something.sql
// 00002_create_another_thing.sql
// ...
// 00122_add_another_thing_column.sql
//
// 00000 is reserved for setting up the version table itself.
//
// Returns the number of successful migrations, -1 on error.
func migrate(db StorageInterface) (int, error) {
	c, cancel := context.WithTimeout(context.Background(), time.Minute*1)
	defer cancel()
	curVersion, errVer := db.Version(c)
	if errVer != nil {
		if errVer != ErrNoTable {
			return -1, errVer
		}
		log.Infof("No version table exists")
		curVersion = -1
	}
	rx, errR := regexp.Compile(`(\d{5})_(.+?)\.sql`)
	if errR != nil {
		log.Fatal(errR)
	}
	type mig struct {
		version int
		data    string
	}
	var migrationPaths []mig
	if errW := fs.WalkDir(sqlFiles, "migrations", func(path string, d fs.DirEntry, err error) error {
		if !strings.HasSuffix(d.Name(), ".sql") {
			return nil
		}
		fp := rx.FindStringSubmatch(path)
		if len(fp) < 3 {
			return nil
		}
		b, e := fs.ReadFile(sqlFiles, path)
		if e != nil {
			return e
		}
		ver, verErr := strconv.ParseInt(fp[1], 10, 64)
		if verErr != nil {
			return verErr
		}
		migrationPaths = append(migrationPaths, mig{version: int(ver), data: string(b)})
		return nil
	}); errW != nil {
		return -1, errW
	}
	execCount := 0
	// TODO use transaction
	for _, mp := range migrationPaths {
		if mp.version > curVersion {
			log.Infof("Exectuing migration version: %d", mp.version)
			if errE := db.Exec(c, mp.data); errE != nil {
				return -1, errors.Wrapf(errE, "Failed to perform migration")
			}
			if mp.version > 0 {
				if errE2 := db.Exec(c, `UPDATE _version SET version = version+1 where name = 'database'`); errE2 != nil {
					return -1, errors.Wrapf(errE2, "Failed to update version state")
				}
			}
			// execute
			execCount++
		}
	}
	return execCount, nil
}
