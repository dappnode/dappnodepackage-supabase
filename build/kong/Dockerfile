FROM kong/kong:3.9.1

COPY --chmod=644 assets/api/kong.yml /usr/local/kong/kong.template.yml
COPY --chmod=755 assets/api/kong-entrypoint.sh /usr/local/bin/kong-entrypoint.sh

ENV KONG_DATABASE="off" \
    KONG_DECLARATIVE_CONFIG="/usr/local/kong/kong.yml" \
    KONG_DNS_ORDER="LAST,A,CNAME" \
    KONG_DNS_NOT_FOUND_TTL="1" \
    KONG_PLUGINS="request-transformer,cors,key-auth,acl,basic-auth,request-termination,ip-restriction,post-function" \
    KONG_NGINX_PROXY_PROXY_BUFFER_SIZE="160k" \
    KONG_NGINX_PROXY_PROXY_BUFFERS="64 160k" \
    KONG_PROXY_ACCESS_LOG="/dev/stdout combined" \
    SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.c7yiVfwn6qj0VlxUS-JmmCrMWCu9Czx5IllcbqLRCaQ" \
    SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.n41Hb1KZ97vGnvMCHL-ibrCUSK9k_Y0a7C0PTFsp8rs" \
    SUPABASE_PUBLISHABLE_KEY="" \
    SUPABASE_SECRET_KEY="" \
    ANON_KEY_ASYMMETRIC="" \
    SERVICE_ROLE_KEY_ASYMMETRIC="" \
    DASHBOARD_USERNAME="supabase" \
    DASHBOARD_PASSWORD="change-this-dashboard-password"
