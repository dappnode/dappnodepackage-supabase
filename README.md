# Supabase DAppNode Package

This package wraps the official Supabase self-hosted Docker stack for DAppNode.

Included services:

- Supabase Studio
- Kong API gateway
- Auth
- PostgREST
- Realtime
- Storage
- imgproxy
- postgres-meta
- Edge Functions
- Analytics
- Postgres
- Supavisor

Access:

- Studio and API gateway: `http://supabase.public.dappnode:8000`
- Auth: `http://supabase.public.dappnode:8000/auth/v1`
- REST: `http://supabase.public.dappnode:8000/rest/v1`
- GraphQL: `http://supabase.public.dappnode:8000/graphql/v1`
- Storage: `http://supabase.public.dappnode:8000/storage/v1`
- Functions: `http://supabase.public.dappnode:8000/functions/v1`

Important package-specific notes:

- This package is based on the upstream `supabase/supabase` `docker/` stack checked out from commit `a9fdb09c`.
- Supabase's upstream compose uses bind mounts for config files. DAppNode rejects those for non-core packages, so this package bakes the required config into wrapper images and uses named volumes for persisted data.
- The optional `vector` service is intentionally omitted because it requires mounting the Docker socket, which is not allowed for regular DAppNode packages. Studio logs are therefore disabled by default.
- The setup wizard asks for the Postgres password and Supabase Studio password during install.
- Supabase API keys and internal encryption secrets are generated on first launch and persisted in the `config` volume.
- User-facing credentials are displayed in the DAppNode Info tab under `Key and Package Sent Values`.
- If an existing database volume is detected during an upgrade from an earlier test build, the package preserves the previous test credentials instead of generating new random credentials that would not match the initialized database.

Persisted data:

- Generated Supabase configuration and credentials
- Postgres data
- Storage objects
- Edge Functions source
- Studio SQL snippets

Useful upstream references:

- Supabase self-hosting docs: <https://supabase.com/docs/guides/hosting/docker>
- Upstream docker stack: <https://github.com/supabase/supabase/tree/master/docker>

Generated credentials shown in DAppNode Info:

- `Supabase URL`
- `Supabase Anon Key`
- `Supabase Service Role Key (server only)`
- `Supabase Dashboard Username`
- `Supabase Dashboard Password`
- `Supabase S3 Access Key ID`
- `Supabase S3 Secret Access Key`

Setup wizard credentials:

- `POSTGRES_PASSWORD`: 16 to 64 letters and numbers only
- `DASHBOARD_PASSWORD`: 8 to 64 letters and numbers only

For example:

```bash
curl -i \
  -H "apikey: <Supabase Anon Key>" \
  http://supabase.public.dappnode:8000/rest/v1/
```

Future improvements:

- Add optional package config controls for users who want to rotate credentials deliberately.
- Add a first-run note in package info explaining that `/auth/v1/health`, `/rest/v1`, and the gateway root can return `401` until an `apikey` header is sent.
- Add a safe credential rotation flow that also updates existing Postgres role passwords and JWT database settings.
