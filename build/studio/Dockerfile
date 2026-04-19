FROM supabase/studio:2026.04.08-sha-205cbe7

COPY assets/snippets/. /app/snippets/
COPY assets/functions/ /app/edge-functions/
COPY --chmod=755 assets/secrets/with-secrets.sh /usr/local/bin/with-secrets.sh

ENV HOSTNAME="::" \
    STUDIO_PG_META_URL="http://meta:8080" \
    POSTGRES_PORT="5432" \
    POSTGRES_HOST="db" \
    POSTGRES_DB="postgres" \
    POSTGRES_PASSWORD="change-this-postgres-password" \
    PG_META_CRYPTO_KEY="0123456789abcdef0123456789abcdef" \
    PGRST_DB_SCHEMAS="public,storage,graphql_public" \
    PGRST_DB_MAX_ROWS="1000" \
    PGRST_DB_EXTRA_SEARCH_PATH="public" \
    DEFAULT_ORGANIZATION_NAME="Default Organization" \
    DEFAULT_PROJECT_NAME="Default Project" \
    OPENAI_API_KEY="" \
    SUPABASE_URL="http://kong:8000" \
    SUPABASE_PUBLIC_URL="http://supabase.public.dappnode:8000" \
    SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.c7yiVfwn6qj0VlxUS-JmmCrMWCu9Czx5IllcbqLRCaQ" \
    SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.n41Hb1KZ97vGnvMCHL-ibrCUSK9k_Y0a7C0PTFsp8rs" \
    AUTH_JWT_SECRET="change-this-jwt-secret-please-1234567890" \
    LOGFLARE_API_KEY="change-this-logflare-public-token" \
    LOGFLARE_PUBLIC_ACCESS_TOKEN="change-this-logflare-public-token" \
    LOGFLARE_PRIVATE_ACCESS_TOKEN="change-this-logflare-private-token" \
    LOGFLARE_URL="http://analytics:4000" \
    NEXT_PUBLIC_ENABLE_LOGS="false" \
    NEXT_ANALYTICS_BACKEND_PROVIDER="postgres" \
    SNIPPETS_MANAGEMENT_FOLDER="/app/snippets" \
    EDGE_FUNCTIONS_MANAGEMENT_FOLDER="/app/edge-functions" \
    SUPABASE_SERVICE_NAME="studio"

ENTRYPOINT ["/usr/local/bin/with-secrets.sh", "docker-entrypoint.sh"]
