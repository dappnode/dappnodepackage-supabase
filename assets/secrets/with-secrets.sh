#!/bin/sh
set -eu

CONFIG_FILE="${SUPABASE_CONFIG_FILE:-/run/supabase-config/supabase.env}"
TIMEOUT="${SUPABASE_CONFIG_TIMEOUT:-300}"

elapsed=0
while [ ! -s "$CONFIG_FILE" ]; do
    if [ "$elapsed" -ge "$TIMEOUT" ]; then
        echo "Timed out waiting for Supabase secrets at $CONFIG_FILE" >&2
        exit 1
    fi

    sleep 1
    elapsed=$((elapsed + 1))
done

set -a
# shellcheck disable=SC1090
. "$CONFIG_FILE"
set +a

export PGPASSWORD="$POSTGRES_PASSWORD"
export SUPABASE_ANON_KEY="$ANON_KEY"
export SUPABASE_SERVICE_KEY="$SERVICE_ROLE_KEY"
export SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
export AUTH_JWT_SECRET="$JWT_SECRET"
export GOTRUE_JWT_SECRET="$JWT_SECRET"
export PGRST_JWT_SECRET="$JWT_SECRET"
export PGRST_APP_SETTINGS_JWT_SECRET="$JWT_SECRET"
export API_JWT_SECRET="$JWT_SECRET"
export METRICS_JWT_SECRET="$JWT_SECRET"
export LOGFLARE_API_KEY="$LOGFLARE_PUBLIC_ACCESS_TOKEN"

case "${SUPABASE_SERVICE_NAME:-}" in
    analytics)
        export DB_PASSWORD="$POSTGRES_PASSWORD"
        export POSTGRES_BACKEND_URL="postgresql://supabase_admin:${POSTGRES_PASSWORD}@db:5432/_supabase"
        ;;
    auth)
        export GOTRUE_DB_DATABASE_URL="postgres://supabase_auth_admin:${POSTGRES_PASSWORD}@db:5432/postgres"
        ;;
    db)
        ;;
    functions)
        export SUPABASE_DB_URL="postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/postgres"
        ;;
    meta)
        export PG_META_DB_PASSWORD="$POSTGRES_PASSWORD"
        export CRYPTO_KEY="$PG_META_CRYPTO_KEY"
        ;;
    pooler)
        export DATABASE_URL="ecto://supabase_admin:${POSTGRES_PASSWORD}@db:5432/_supabase"
        ;;
    realtime)
        export DB_PASSWORD="$POSTGRES_PASSWORD"
        ;;
    rest)
        export PGRST_DB_URI="postgres://authenticator:${POSTGRES_PASSWORD}@db:5432/postgres"
        ;;
    storage)
        export DATABASE_URL="postgres://supabase_storage_admin:${POSTGRES_PASSWORD}@db:5432/postgres"
        export SERVICE_KEY="$SERVICE_ROLE_KEY"
        ;;
    studio)
        export AUTH_JWT_SECRET="$JWT_SECRET"
        ;;
esac

exec "$@"
