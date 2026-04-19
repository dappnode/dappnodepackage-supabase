FROM --platform=$BUILDPLATFORM golang:1.26-alpine AS rest-launcher-builder

ARG TARGETOS
ARG TARGETARCH

WORKDIR /src
COPY build/rest/with-secrets-rest/go.mod build/rest/with-secrets-rest/main.go ./
RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64} \
    go build -trimpath -ldflags="-s -w" -o /with-secrets-rest .

FROM postgrest/postgrest:v14.8

COPY --from=rest-launcher-builder /with-secrets-rest /usr/local/bin/with-secrets-rest

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

ENTRYPOINT ["/usr/local/bin/with-secrets-rest"]
CMD ["postgrest"]
