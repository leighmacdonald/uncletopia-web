package config

import (
	"fmt"
	"github.com/leighmacdonald/steamweb"
	"github.com/mitchellh/go-homedir"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"os"
	"strings"
)

var (
	cfgFile  string
	Full     FullConfig
	Hook     HookConfig
	HTTP     HTTPConfig
	Steam    SteamConfig
	Patreon  PatreonConfig
	Database DatabaseConfig
)

type FullConfig struct {
	Order []string `mapstructure:"order"`

	Patreon  PatreonConfig  `mapstructure:"patreon"`
	Database DatabaseConfig `mapstructure:"database"`
	HTTP     HTTPConfig     `mapstructure:"http"`
	Steam    SteamConfig    `mapstructure:"steam"`
	Hook     HookConfig
}

type HookConfig struct {
	DiscordAnnouncement string `mapstructure:"discord_announcement"`
}

type HTTPConfig struct {
	Listen     string `mapstructure:"listen_http"`
	TLS        bool   `mapstructure:"tls"`
	StaticPath string `mapstructure:"static_path"`
	Domain     string `mapstructure:"domain"`
	CookieKey  string `mapstructure:"cookie_key"`
}

type SteamConfig struct {
	Key string `mapstructure:"Key"`
}

type PatreonConfig struct {
	ClientID     string `mapstructure:"client_id"`
	ClientSecret string `mapstructure:"client_secret"`
	AccessToken  string `mapstructure:"access_token"`
	RefreshToken string `mapstructure:"refresh_token"`
}

type DatabaseConfig struct {
	DSN        string `mapstructure:"dsn"`
	LogQueries bool   `mapstructure:"log_queries"`
}

// Read reads in config file and ENV variables if set.
func Read() {
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find home directory.
		home, err := homedir.Dir()
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		// Search config in home directory with name "config" (without extension).
		viper.AddConfigPath("..")
		viper.AddConfigPath("../..")
		viper.AddConfigPath(home)
		viper.AddConfigPath(".")
		viper.SetEnvPrefix("ut")
		viper.SetConfigName("config")
		viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	}

	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	} else {
		log.Fatalf("Failed to read config file: %v", err)
	}
	c := FullConfig{}
	if err := viper.Unmarshal(&c); err != nil {
		log.Fatalf("Failed to unmarshal config: %v", err)
	}
	Full = c
	Patreon = Full.Patreon
	Steam = Full.Steam
	HTTP = Full.HTTP
	Hook = Full.Hook
	Database = Full.Database
	if err := steamweb.SetKey(Steam.Key); err != nil {
		log.Errorf("Failed to set steam api Key: %v", err)
	}
}
