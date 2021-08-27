package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/leighmacdonald/golib"
	"github.com/leighmacdonald/uncletopia-web/internal/app"
	"github.com/leighmacdonald/uncletopia-web/internal/config"
	"github.com/leighmacdonald/uncletopia-web/internal/store"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"io/ioutil"
	"os"
	"time"
)

var (
	seedFilePath string
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "uncletopia-web",
	Short: "",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		application, err := app.New()
		if err != nil {
			log.Fatalf("Error initializing application: %v", err)
		}
		application.Start()
	},
}

var seedCmd = &cobra.Command{
	Use:   "seed",
	Short: "seed data",
	Long:  `seed data from the seed.json file`,
	Run: func(cmd *cobra.Command, args []string) {
		type seedFile struct {
			Person  []store.Person `json:"person"`
			News    []store.News   `json:"news"`
			Servers []store.Server `json:"servers"`
		}
		s, err := store.New(config.Database.DSN)
		if err != nil {
			log.Fatalf("Error initializing application: %v", err)
		}
		if !golib.Exists(seedFilePath) {
			log.Fatalf("Seed file path does not exist: %s", seedFilePath)
		}
		b, errRead := ioutil.ReadFile(seedFilePath)
		if errRead != nil {
			log.Fatalf("Failed to read seed file: %s (%v)", seedFilePath, errRead)
		}
		var seedData seedFile
		if errDecode := json.Unmarshal(b, &seedData); errDecode != nil {
			log.Fatalf("Failed to decode seed file: %v", errDecode)
		}
		for _, server := range seedData.Servers {
			if errAdd := s.ServerSave(context.Background(), &server); err != nil {
				log.Fatalf("Error adding seed server (%s): %v", server.NameShort, errAdd)
			}
		}

		for _, p := range seedData.Person {
			np := store.NewPerson(p.SteamID)
			if err := s.PersonSave(context.Background(), &np); err != nil {
				log.Errorf("Failed to save person: %v", err)
			}
		}

		for _, n := range seedData.News {
			n.CreatedOn = time.Now()
			n.UpdatedOn = time.Now()
			n.PublishOn = time.Now()
			if err := s.NewsSave(context.Background(), &n); err != nil {
				log.Errorf("Failed to save news: %v", err)
			}
		}
		log.Infof("Added server: %d", len(seedData.Servers))
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(config.Read)

	rootCmd.AddCommand(seedCmd)

	seedCmd.PersistentFlags().StringVarP(&seedFilePath, "seed", "s", "seed.json", "Database seed file location")
}
