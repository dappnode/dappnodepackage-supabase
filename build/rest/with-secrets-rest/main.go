package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"syscall"
	"time"
)

const (
	defaultConfigFile = "/run/supabase-config/supabase.env"
	defaultTimeout    = 300 * time.Second
)

func main() {
	if len(os.Args) > 1 && os.Args[1] == "healthcheck" {
		if err := healthcheck(); err != nil {
			fmt.Fprintf(os.Stderr, "Rest healthcheck failed: %v\n", err)
			os.Exit(1)
		}
		return
	}

	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "Rest launcher failed: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	configFile := getenvDefault("SUPABASE_CONFIG_FILE", defaultConfigFile)
	timeout := configTimeout()

	if err := waitForConfig(configFile, timeout); err != nil {
		return err
	}

	values, err := parseEnvFile(configFile)
	if err != nil {
		return err
	}

	postgresPassword, err := required(values, "POSTGRES_PASSWORD")
	if err != nil {
		return err
	}

	jwtSecret, err := required(values, "JWT_SECRET")
	if err != nil {
		return err
	}

	jwtExp := values["JWT_EXP"]
	if jwtExp == "" {
		jwtExp = "3600"
	}

	os.Setenv("PGRST_DB_URI", "postgres://authenticator:"+postgresPassword+"@db:5432/postgres")
	os.Setenv("PGRST_JWT_SECRET", jwtSecret)
	os.Setenv("PGRST_APP_SETTINGS_JWT_SECRET", jwtSecret)
	os.Setenv("PGRST_APP_SETTINGS_JWT_EXP", jwtExp)

	args := os.Args[1:]
	if len(args) == 0 {
		args = []string{"postgrest"}
	}

	binary, err := exec.LookPath(args[0])
	if err != nil {
		return fmt.Errorf("find %s: %w", args[0], err)
	}

	return syscall.Exec(binary, args, os.Environ())
}

func healthcheck() error {
	ctx, cancel := context.WithTimeout(context.Background(), 4*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "http://127.0.0.1:3000/", nil)
	if err != nil {
		return err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	io.Copy(io.Discard, res.Body)

	if res.StatusCode >= 500 {
		return fmt.Errorf("unexpected HTTP status %s", res.Status)
	}

	return nil
}

func waitForConfig(path string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)

	for {
		info, err := os.Stat(path)
		if err == nil && info.Size() > 0 {
			return nil
		}

		if time.Now().After(deadline) {
			return fmt.Errorf("timed out waiting for Supabase secrets at %s", path)
		}

		time.Sleep(time.Second)
	}
}

func parseEnvFile(path string) (map[string]string, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	values := map[string]string{}
	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") || !strings.HasPrefix(line, "export ") {
			continue
		}

		keyValue := strings.TrimPrefix(line, "export ")
		parts := strings.SplitN(keyValue, "=", 2)
		if len(parts) != 2 {
			continue
		}

		values[parts[0]] = unquoteShellValue(parts[1])
	}

	return values, scanner.Err()
}

func unquoteShellValue(value string) string {
	if len(value) >= 2 && value[0] == '\'' && value[len(value)-1] == '\'' {
		value = value[1 : len(value)-1]
	}

	return strings.ReplaceAll(value, "'\\''", "'")
}

func required(values map[string]string, key string) (string, error) {
	value := values[key]
	if value == "" {
		return "", fmt.Errorf("%s is missing from Supabase secrets", key)
	}

	return value, nil
}

func configTimeout() time.Duration {
	raw := os.Getenv("SUPABASE_CONFIG_TIMEOUT")
	if raw == "" {
		return defaultTimeout
	}

	seconds, err := strconv.Atoi(raw)
	if err != nil || seconds < 1 {
		return defaultTimeout
	}

	return time.Duration(seconds) * time.Second
}

func getenvDefault(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
