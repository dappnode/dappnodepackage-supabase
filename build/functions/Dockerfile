FROM supabase/edge-runtime:v1.71.2

COPY assets/functions/ /home/deno/functions/
COPY --chmod=755 assets/secrets/with-secrets.sh /usr/local/bin/with-secrets.sh

ENV JWT_SECRET="change-this-jwt-secret-please-1234567890" \
    SUPABASE_URL="http://kong:8000" \
    SUPABASE_PUBLIC_URL="http://supabase.public.dappnode:8000" \
    SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.c7yiVfwn6qj0VlxUS-JmmCrMWCu9Czx5IllcbqLRCaQ" \
    SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.n41Hb1KZ97vGnvMCHL-ibrCUSK9k_Y0a7C0PTFsp8rs" \
    SUPABASE_PUBLISHABLE_KEYS="{\"default\":\"\"}" \
    SUPABASE_SECRET_KEYS="{\"default\":\"\"}" \
    SUPABASE_DB_URL="postgresql://postgres:change-this-postgres-password@db:5432/postgres" \
    VERIFY_JWT="false" \
    SUPABASE_SERVICE_NAME="functions"

ENTRYPOINT ["/usr/local/bin/with-secrets.sh", "edge-runtime"]
