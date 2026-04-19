FROM supabase/postgres:15.8.1.085

RUN mkdir -p /docker-entrypoint-initdb.d/migrations /docker-entrypoint-initdb.d/init-scripts

COPY assets/db/realtime.sql /docker-entrypoint-initdb.d/migrations/99-realtime.sql
COPY assets/db/webhooks.sql /docker-entrypoint-initdb.d/init-scripts/98-webhooks.sql
COPY assets/db/roles.sql /docker-entrypoint-initdb.d/init-scripts/99-roles.sql
COPY assets/db/jwt.sql /docker-entrypoint-initdb.d/init-scripts/99-jwt.sql
COPY assets/db/_supabase.sql /docker-entrypoint-initdb.d/migrations/97-_supabase.sql
COPY assets/db/logs.sql /docker-entrypoint-initdb.d/migrations/99-logs.sql
COPY assets/db/pooler.sql /docker-entrypoint-initdb.d/migrations/99-pooler.sql
COPY --chmod=755 assets/secrets/with-secrets.sh /usr/local/bin/with-secrets.sh

ENV POSTGRES_HOST="/var/run/postgresql" \
    PGPORT="5432" \
    POSTGRES_PORT="5432" \
    PGPASSWORD="change-this-postgres-password" \
    POSTGRES_PASSWORD="change-this-postgres-password" \
    PGDATABASE="postgres" \
    POSTGRES_DB="postgres" \
    JWT_SECRET="change-this-jwt-secret-please-1234567890" \
    JWT_EXP="3600" \
    SUPABASE_SERVICE_NAME="db"

ENTRYPOINT ["/usr/local/bin/with-secrets.sh", "docker-entrypoint.sh"]
