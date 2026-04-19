FROM supabase/postgres-meta:v0.96.3

COPY --chmod=755 assets/secrets/with-secrets.sh /usr/local/bin/with-secrets.sh

ENV PG_META_PORT="8080" \
    PG_META_DB_HOST="db" \
    PG_META_DB_PORT="5432" \
    PG_META_DB_NAME="postgres" \
    PG_META_DB_USER="supabase_admin" \
    PG_META_DB_PASSWORD="change-this-postgres-password" \
    CRYPTO_KEY="0123456789abcdef0123456789abcdef" \
    SUPABASE_SERVICE_NAME="meta"

ENTRYPOINT ["/usr/local/bin/with-secrets.sh", "docker-entrypoint.sh"]
