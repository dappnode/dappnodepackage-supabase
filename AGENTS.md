# Codex Handoff: Supabase DAppNode Package

This repository contains a DAppNode package for the upstream Supabase self-hosted Docker stack.
Codex should read this file first when continuing work on this package.

## Current State

- Package name: `supabase.public.dappnode.eth`
- Current test version: `0.1.6`
- Current test architecture: `linux/amd64` only
- Latest uploaded test CID: `/ipfs/QmNdBKG3gKactGT16XfyGNxFrN5GUd6cs2ZD89kaVbt62s`
- Latest installer URL: `http://my.dappnode/installer/public/%2Fipfs%2FQmNdBKG3gKactGT16XfyGNxFrN5GUd6cs2ZD89kaVbt62s`
- Install worked on a clean DAppNode after old Supabase volumes were removed.
- Supabase Studio UI is reachable through Kong at `http://supabase.public.dappnode:8000`.
- Current live issue: `Rest` container restarts with `exec /usr/local/bin/with-secrets.sh: no such file or directory`.

## Important User Preference

For first test builds, always ask which architecture the test DAppNode needs and build only that architecture.
Do not build multi-arch for early testing. Multi-arch is only for after the package has been tested and works.

For the current test DAppNode, use `linux/amd64` unless the user says otherwise.

## DAppNode Build And Upload Commands

Use a Docker config without credential helpers to avoid local credential-store problems:

```bash
env DOCKER_CONFIG=/tmp/docker-config-no-cred npx @dappnode/dappnodesdk build --provider http://172.33.0.10:5001 --timeout 180min --verbose
```

Older provider used during testing:

```bash
env DOCKER_CONFIG=/tmp/docker-config-no-cred npx @dappnode/dappnodesdk build --provider http://172.33.0.3:5001 --timeout 180min --verbose
```

The provider may occasionally fail during upload with `write EPIPE`. If the build itself completed and only upload failed, retry once before changing code.

Useful validation:

```bash
npx @dappnode/dappnodesdk validate
docker compose config --quiet
```

Local compose smoke test pattern:

```bash
env DOCKER_CONFIG=/tmp/docker-config-no-cred docker compose --project-name supabase-debug up --detach
env DOCKER_CONFIG=/tmp/docker-config-no-cred docker compose --project-name supabase-debug ps
env DOCKER_CONFIG=/tmp/docker-config-no-cred docker compose --project-name supabase-debug down --volumes
```

Be careful with `down --volumes`: only use it for local throwaway debug projects.

## DAppNode Packaging Practices And Lessons

- Keep persistent data in named volumes so updates do not wipe databases.
- Current persistent volumes:
  - `config` for generated Supabase secrets at `/run/supabase-config`
  - `db-data` for Postgres data at `/var/lib/postgresql/data`
  - `db-config` for Postgres custom config
  - `storage` for object storage
  - `functions` for edge functions
  - `snippets` for Studio snippets
  - `deno-cache` for Edge Runtime cache
- DAppNode install rollback may leave enough state around to confuse later tests. When debugging first install behavior, test with all old Supabase volumes removed.
- Do not rely on bind mounts from the upstream Supabase compose; DAppNode packages need config baked into images or stored in package volumes.
- Non-core DAppNode packages should not depend on mounting the Docker socket. This package disables the optional upstream Vector log collector for that reason.
- DAppNode package sent values are typically sent from inside the package with:

```text
POST http://my.dappnode/data-send?key=<urlencoded key>&data=<urlencoded value>
```

- Package sent values must be URL-encoded. JWTs, base64 strings, and generated passwords may contain characters that break raw query params.
- Prefer publishing package sent values from the service that owns/generates the values. For this package, that should be the `secrets` service, not Kong.
- For values the user must know or choose, prefer `setup-wizard.yml` over random generation.
- The DAppNode setup wizard runs before package install and only injects environment variables. It cannot fetch generated runtime values.
- The DAppNode Info tab can display "Key and Package Sent Values" after install, using the `data-send` pattern.

## References

Supabase upstream:

- Repository: `https://github.com/supabase/supabase`
- Upstream Docker stack: `https://github.com/supabase/supabase/tree/master/docker`
- Upstream `.env.example`: `https://raw.githubusercontent.com/supabase/supabase/master/docker/.env.example`
- Self-hosting docs: `https://supabase.com/docs/guides/hosting/docker`

DAppNode package / setup wizard reference:

- Obol package repository: `https://github.com/dappnode/DAppNodePackage-obol-generic`
- Setup wizard reference: `https://raw.githubusercontent.com/dappnode/DAppNodePackage-obol-generic/main/setup-wizard.yml`
- Obol package metadata reference: `https://raw.githubusercontent.com/dappnode/DAppNodePackage-obol-generic/main/dappnode_package.json`
- Obol compose reference: `https://raw.githubusercontent.com/dappnode/DAppNodePackage-obol-generic/main/docker-compose.yml`
- Obol getting started reference: `https://raw.githubusercontent.com/dappnode/DAppNodePackage-obol-generic/main/getting-started.md`
- Obol package sent values pattern was previously inspected in its cluster scripts. Re-check the Obol repo if the DAppNode `data-send` behavior needs confirmation.

## Current Architecture

The package uses a generated config file:

```text
/run/supabase-config/supabase.env
```

Generated by:

```text
assets/secrets/generate-secrets.js
```

Consumed by:

```text
assets/secrets/with-secrets.sh
```

Most services wrap their upstream image with `with-secrets.sh`, which waits for `supabase.env`, sources it, exports service-specific env vars, and execs the upstream service.

This works only in images that include `/bin/sh`.

## Known Bugs For Next Version

### 1. Rest Restarts Because PostgREST Image Has No Shell

Symptom on DAppNode:

```text
exec /usr/local/bin/with-secrets.sh: no such file or directory
```

Root cause:

- `build/rest/Dockerfile` copies `assets/secrets/with-secrets.sh`.
- The script starts with `#!/bin/sh`.
- `postgrest/postgrest:v14.8` has no `/bin/sh`.
- Docker's error is misleading: the wrapper script may exist, but its interpreter does not.

This was reproduced locally:

```bash
env DOCKER_CONFIG=/tmp/docker-config-no-cred docker run --rm --entrypoint /usr/local/bin/with-secrets.sh rest.supabase.public.dappnode.eth:0.1.6
```

It fails with:

```text
exec /usr/local/bin/with-secrets.sh: no such file or directory
```

And:

```bash
env DOCKER_CONFIG=/tmp/docker-config-no-cred docker run --rm --entrypoint /bin/sh rest.supabase.public.dappnode.eth:0.1.6 -lc 'ls'
```

fails with:

```text
exec: "/bin/sh": stat /bin/sh: no such file or directory
```

### 2. Dashboard Password Must Come From Setup Wizard

Current behavior:

- Fresh installs generate `DASHBOARD_PASSWORD` randomly in `generate-secrets.js`.
- This is bad UX because the user cannot know it if Info tab publishing fails.

Required next behavior:

- Add `setup-wizard.yml`.
- Ask user for `DASHBOARD_PASSWORD`.
- Ask user for `POSTGRES_PASSWORD`.
- Persist these values into `supabase.env`.
- Do not randomly generate dashboard password when wizard value is provided.

Password guidance:

- `POSTGRES_PASSWORD` should be letters and numbers only to avoid URL-encoding issues in DB connection strings.
- `DASHBOARD_PASSWORD` can be user-selected, but keep validation/guidance simple for first iteration.

### 3. Generated Credentials Are Not Shown In Info Tab

Current behavior:

- `assets/api/kong-entrypoint.sh` posts package sent values to `http://my.dappnode/data-send`.
- The Info tab did not show them in `0.1.6`.
- The post is silent and raw query strings are not URL-encoded.

Required next behavior:

- Move value publishing to `secrets` service after `generate-secrets.js` generates or reuses `supabase.env`.
- Use JavaScript `encodeURIComponent` for keys and values.
- Log success or failure for each published key so DAppNode logs show what happened.
- Keep retry behavior because DAppNode UI/API may not be immediately reachable.

Values to publish:

- `Supabase URL`
- `Supabase Anon Key`
- `Supabase Service Role Key (server only)`
- `Supabase Dashboard Username`
- `Supabase Dashboard Password`
- `Supabase S3 Access Key ID`
- `Supabase S3 Secret Access Key`

### 4. Analytics Startup Should Be More Forgiving

`analytics` is Logflare and can take time on DAppNode. Current healthcheck has no `start_period`.

Even though the latest install problem was old DB volumes, add a startup grace period and/or more retries so install does not fail on slow hardware.

### 5. Rest Needs A Healthcheck

Rest currently has no container healthcheck. Add a healthcheck that proves PostgREST is reachable.

Also add an end-to-end smoke test through Kong:

```bash
curl -i -sS \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <ANON_KEY>" \
  http://localhost:8000/rest/v1/
```

Expected result for a working empty DB is `HTTP/1.1 200 OK`.

## Planned Shell-Free Rest Fix

Rest is PostgREST. It needs these values from `supabase.env`:

```text
POSTGRES_PASSWORD
JWT_SECRET
JWT_EXP
```

These become:

```text
PGRST_DB_URI=postgres://authenticator:<POSTGRES_PASSWORD>@db:5432/postgres
PGRST_JWT_SECRET=<JWT_SECRET>
PGRST_APP_SETTINGS_JWT_SECRET=<JWT_SECRET>
PGRST_APP_SETTINGS_JWT_EXP=<JWT_EXP>
```

It also uses static config:

```text
PGRST_DB_SCHEMAS=public,storage,graphql_public
PGRST_DB_MAX_ROWS=1000
PGRST_DB_EXTRA_SEARCH_PATH=public
PGRST_DB_ANON_ROLE=anon
PGRST_DB_USE_LEGACY_GUCS=false
```

Implement a tiny static launcher binary for Rest instead of a shell script:

1. Wait until `/run/supabase-config/supabase.env` exists.
2. Parse lines like `export KEY='value'`.
3. Set PostgREST env vars listed above.
4. Execute PostgREST directly, replacing itself.

Preferred language: Go.

Example build approach:

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o with-secrets-rest ./build/rest/with-secrets-rest
```

Then copy the static binary into the Rest image and set:

```dockerfile
ENTRYPOINT ["/usr/local/bin/with-secrets-rest"]
CMD ["postgrest"]
```

Do not use `/bin/sh` in the Rest image.

For first implementation, keep scope tight and use the binary only for Rest. Later, consider replacing `with-secrets.sh` for all services with one shared binary launcher to avoid base-image surprises.

## Setup Wizard Plan

Add `setup-wizard.yml` at repo root.

Minimum fields:

- `DASHBOARD_PASSWORD`
- `POSTGRES_PASSWORD`

Then update `secrets` service in `docker-compose.yml` to receive the wizard-injected env vars, and update `generate-secrets.js` to prefer incoming env values over generated defaults.

Important:

- Setup wizard cannot fetch or display generated values before install.
- Generated values that users need after install should be displayed through package sent values in the Info tab.

## Suggested Implementation Order

1. Add `setup-wizard.yml` for dashboard and Postgres passwords.
2. Update `docker-compose.yml` `secrets.environment` to pass wizard values into the secrets generator.
3. Update `assets/secrets/generate-secrets.js`:
   - accept wizard-provided `DASHBOARD_PASSWORD`
   - accept wizard-provided `POSTGRES_PASSWORD`
   - preserve old values if `supabase.env` already exists
   - publish package sent values with URL encoding and visible logs
4. Add static Go Rest launcher:
   - new source under `build/rest/with-secrets-rest/` or `assets/secrets/with-secrets-rest/`
   - multi-stage build in `build/rest/Dockerfile`
   - no shell dependency
5. Add Rest healthcheck.
6. Add analytics `start_period` and/or more retries.
7. Bump version to `0.1.7`.
8. Validate:
   - `docker compose config --quiet`
   - `npx @dappnode/dappnodesdk validate`
9. Build amd64-only test package, upload to the user's specified IPFS provider, and report CID.
10. Only after the user confirms it works, discuss multi-arch.

## Verification Checklist For Next Codex

Before upload:

- Confirm target test architecture with user if not already specified.
- Confirm target IPFS provider with user if not already specified.
- Confirm clean install vs update test.
- Verify Rest image directly:

```bash
env DOCKER_CONFIG=/tmp/docker-config-no-cred docker run --rm --entrypoint /usr/local/bin/with-secrets-rest rest.supabase.public.dappnode.eth:<version>
```

Expected direct run without config file should wait or timeout with a clear message, not `no such file or directory`.

- Verify local compose stack:
  - `db` healthy
  - `secrets` running
  - `analytics` healthy
  - `auth` healthy
  - `rest` running/healthy
  - `realtime` healthy
  - `storage` healthy
  - `studio` healthy
  - `kong` healthy

- Verify API smoke:

```bash
curl -i -sS http://localhost:8000/auth/v1/health
curl -i -sS -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>" http://localhost:8000/rest/v1/
```

- Verify Info tab publisher logs from `secrets` service show successful publication.

## Current Files Of Interest

- `docker-compose.yml`
- `dappnode_package.json`
- `assets/secrets/generate-secrets.js`
- `assets/secrets/with-secrets.sh`
- `assets/api/kong-entrypoint.sh`
- `build/rest/Dockerfile`
- `build/secrets/Dockerfile`
- `build/kong/Dockerfile`
- `README.md`

## Do Not Forget

- Do not build multi-arch for test iterations.
- Do not silently swallow package sent value publishing errors in the next version.
- Do not randomize dashboard password once setup wizard provides it.
- Do not break existing persisted volumes on package update.
- Do not remove generated secrets if `supabase.env` already exists.
- Do not rely on `/bin/sh` in the PostgREST image.
