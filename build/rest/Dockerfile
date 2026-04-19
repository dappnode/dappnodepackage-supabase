FROM postgrest/postgrest:v14.8

COPY --chmod=755 assets/secrets/with-secrets.sh /usr/local/bin/with-secrets.sh

ENV PGRST_DB_URI="postgres://authenticator:change-this-postgres-password@db:5432/postgres" \
    PGRST_DB_SCHEMAS="public,storage,graphql_public" \
    PGRST_DB_MAX_ROWS="1000" \
    PGRST_DB_EXTRA_SEARCH_PATH="public" \
    PGRST_DB_ANON_ROLE="anon" \
    PGRST_JWT_SECRET="change-this-jwt-secret-please-1234567890" \
    PGRST_DB_USE_LEGACY_GUCS="false" \
    PGRST_APP_SETTINGS_JWT_SECRET="change-this-jwt-secret-please-1234567890" \
    PGRST_APP_SETTINGS_JWT_EXP="3600" \
    SUPABASE_SERVICE_NAME="rest"

ENTRYPOINT ["/usr/local/bin/with-secrets.sh"]
