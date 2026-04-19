FROM supabase/logflare:1.36.1

COPY --chmod=755 assets/secrets/with-secrets.sh /usr/local/bin/with-secrets.sh

ENV LOGFLARE_NODE_HOST="127.0.0.1" \
    DB_USERNAME="supabase_admin" \
    DB_DATABASE="_supabase" \
    DB_HOSTNAME="db" \
    DB_PORT="5432" \
    DB_PASSWORD="change-this-postgres-password" \
    DB_SCHEMA="_analytics" \
    LOGFLARE_PUBLIC_ACCESS_TOKEN="change-this-logflare-public-token" \
    LOGFLARE_PRIVATE_ACCESS_TOKEN="change-this-logflare-private-token" \
    LOGFLARE_SINGLE_TENANT="true" \
    LOGFLARE_SUPABASE_MODE="true" \
    POSTGRES_BACKEND_URL="postgresql://supabase_admin:change-this-postgres-password@db:5432/_supabase" \
    POSTGRES_BACKEND_SCHEMA="_analytics" \
    LOGFLARE_FEATURE_FLAG_OVERRIDE="multibackend=true" \
    SUPABASE_SERVICE_NAME="analytics"

ENTRYPOINT ["/usr/local/bin/with-secrets.sh"]
