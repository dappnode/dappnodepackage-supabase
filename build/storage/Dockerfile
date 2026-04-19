FROM supabase/storage-api:v1.48.26

COPY --chmod=755 assets/secrets/with-secrets.sh /usr/local/bin/with-secrets.sh

ENV ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.c7yiVfwn6qj0VlxUS-JmmCrMWCu9Czx5IllcbqLRCaQ" \
    SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.n41Hb1KZ97vGnvMCHL-ibrCUSK9k_Y0a7C0PTFsp8rs" \
    POSTGREST_URL="http://rest:3000" \
    AUTH_JWT_SECRET="change-this-jwt-secret-please-1234567890" \
    DATABASE_URL="postgres://supabase_storage_admin:change-this-postgres-password@db:5432/postgres" \
    STORAGE_PUBLIC_URL="http://supabase.public.dappnode:8000" \
    REQUEST_ALLOW_X_FORWARDED_PATH="true" \
    FILE_SIZE_LIMIT="52428800" \
    STORAGE_BACKEND="file" \
    GLOBAL_S3_BUCKET="stub" \
    FILE_STORAGE_BACKEND_PATH="/var/lib/storage" \
    TENANT_ID="stub" \
    REGION="stub" \
    ENABLE_IMAGE_TRANSFORMATION="true" \
    IMGPROXY_URL="http://imgproxy:5001" \
    S3_PROTOCOL_ACCESS_KEY_ID="625729a08b95bf1b7ff351a663f3a23c" \
    S3_PROTOCOL_ACCESS_KEY_SECRET="850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907" \
    SUPABASE_SERVICE_NAME="storage"

ENTRYPOINT ["/usr/local/bin/with-secrets.sh", "docker-entrypoint.sh"]
