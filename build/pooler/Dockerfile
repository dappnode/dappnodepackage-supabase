FROM supabase/supavisor:2.7.4

RUN mkdir -p /etc/pooler

COPY assets/pooler/pooler.exs /etc/pooler/pooler.exs
COPY --chmod=755 assets/secrets/with-secrets.sh /usr/local/bin/with-secrets.sh

ENV PORT="4000" \
    POSTGRES_PORT="5432" \
    POSTGRES_DB="postgres" \
    POSTGRES_PASSWORD="change-this-postgres-password" \
    DATABASE_URL="ecto://supabase_admin:change-this-postgres-password@db:5432/_supabase" \
    CLUSTER_POSTGRES="true" \
    SECRET_KEY_BASE="UpNVntn3cDxHJpq99YMc1T1AQgQpc8kfYTuRgBiYa15BLrx8etQoXz3gZv1/u2oq" \
    VAULT_ENC_KEY="0123456789abcdef0123456789abcdef" \
    API_JWT_SECRET="change-this-jwt-secret-please-1234567890" \
    METRICS_JWT_SECRET="change-this-jwt-secret-please-1234567890" \
    REGION="local" \
    ERL_AFLAGS="-proto_dist inet_tcp" \
    POOLER_TENANT_ID="supabase-dappnode" \
    POOLER_DEFAULT_POOL_SIZE="20" \
    POOLER_MAX_CLIENT_CONN="100" \
    POOLER_POOL_MODE="transaction" \
    DB_POOL_SIZE="5" \
    SUPABASE_SERVICE_NAME="pooler"

ENTRYPOINT ["/usr/local/bin/with-secrets.sh", "/usr/bin/tini", "-s", "-g", "--", "/app/limits.sh"]
