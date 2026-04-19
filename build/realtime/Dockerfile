FROM supabase/realtime:v2.76.5

COPY --chmod=755 assets/secrets/with-secrets.sh /usr/local/bin/with-secrets.sh

ENV PORT="4000" \
    DB_HOST="db" \
    DB_PORT="5432" \
    DB_USER="supabase_admin" \
    DB_PASSWORD="change-this-postgres-password" \
    DB_NAME="postgres" \
    DB_AFTER_CONNECT_QUERY="SET search_path TO _realtime" \
    DB_ENC_KEY="supabaserealtime" \
    API_JWT_SECRET="change-this-jwt-secret-please-1234567890" \
    SECRET_KEY_BASE="UpNVntn3cDxHJpq99YMc1T1AQgQpc8kfYTuRgBiYa15BLrx8etQoXz3gZv1/u2oq" \
    METRICS_JWT_SECRET="change-this-jwt-secret-please-1234567890" \
    ERL_AFLAGS="-proto_dist inet_tcp" \
    DNS_NODES="''" \
    RLIMIT_NOFILE="10000" \
    APP_NAME="realtime" \
    SEED_SELF_HOST="true" \
    RUN_JANITOR="true" \
    DISABLE_HEALTHCHECK_LOGGING="true" \
    SUPABASE_SERVICE_NAME="realtime"

ENTRYPOINT ["/usr/local/bin/with-secrets.sh", "/usr/bin/tini", "-s", "-g", "--", "/app/run.sh"]
