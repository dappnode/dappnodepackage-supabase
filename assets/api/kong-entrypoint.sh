#!/bin/bash
# Custom entrypoint for Kong that builds Lua expressions for request-transformer
# and performs environment variable substitution in the declarative config.

CONFIG_FILE="${SUPABASE_CONFIG_FILE:-/run/supabase-config/supabase.env}"
TIMEOUT="${SUPABASE_CONFIG_TIMEOUT:-300}"
elapsed=0

while [ ! -s "$CONFIG_FILE" ]; do
    if [ "$elapsed" -ge "$TIMEOUT" ]; then
        echo "Timed out waiting for Supabase secrets at $CONFIG_FILE" >&2
        exit 1
    fi

    sleep 1
    elapsed=$((elapsed + 1))
done

set -a
# shellcheck disable=SC1090
. "$CONFIG_FILE"
set +a

export SUPABASE_ANON_KEY="$ANON_KEY"
export SUPABASE_SERVICE_KEY="$SERVICE_ROLE_KEY"

# Build Lua expressions for translating opaque API keys to asymmetric JWTs.
# When opaque keys are not configured (empty env vars), expressions fall through
# to legacy-only behavior - just passing apikey as-is.
#
# Full expression logic (when opaque keys are configured):
#   1. If Authorization header exists and is NOT an sb_ key -> pass through (user session JWT)
#   2. If apikey matches secret key -> set service_role asymmetric JWT internal "API key"
#   3. If apikey matches publishable key -> set anon asymmetric JWT internal "API key"
#   4. Fallback: pass apikey as-is (legacy HS256 JWT)

if [ -n "$SUPABASE_SECRET_KEY" ] && [ -n "$SUPABASE_PUBLISHABLE_KEY" ]; then
    # Opaque keys configured -> full translation expressions
    export LUA_AUTH_EXPR="\$((headers.authorization ~= nil and headers.authorization:sub(1, 10) ~= 'Bearer sb_' and headers.authorization) or (headers.apikey == '$SUPABASE_SECRET_KEY' and 'Bearer $SERVICE_ROLE_KEY_ASYMMETRIC') or (headers.apikey == '$SUPABASE_PUBLISHABLE_KEY' and 'Bearer $ANON_KEY_ASYMMETRIC') or (headers.apikey and 'Bearer ' .. headers.apikey))"

    # Realtime WebSocket: reads from query_params.apikey (supabase-js sends apikey
    # via query string), outputs to x-api-key header which Realtime checks first.
    export LUA_RT_WS_EXPR="\$((query_params.apikey == '$SUPABASE_SECRET_KEY' and '$SERVICE_ROLE_KEY_ASYMMETRIC') or (query_params.apikey == '$SUPABASE_PUBLISHABLE_KEY' and '$ANON_KEY_ASYMMETRIC') or query_params.apikey)"
else
    # Legacy API keys, not sb_ API keys -> send a Bearer token to upstream services.
    export LUA_AUTH_EXPR="\$((headers.authorization ~= nil and headers.authorization:sub(1, 10) ~= 'Bearer sb_' and headers.authorization) or (headers.apikey and 'Bearer ' .. headers.apikey))"
    export LUA_RT_WS_EXPR="\$(query_params.apikey)"
fi

# Substitute environment variables in the Kong declarative config.
# Uses awk instead of eval/echo to preserve YAML quoting (eval strips double
# quotes, breaking "Header: value" patterns that YAML parses as mappings).
awk '{
  result = ""
  rest = $0
  while (match(rest, /\$[A-Za-z_][A-Za-z_0-9]*/)) {
    varname = substr(rest, RSTART + 1, RLENGTH - 1)
    if (varname in ENVIRON) {
      result = result substr(rest, 1, RSTART - 1) ENVIRON[varname]
    } else {
      result = result substr(rest, 1, RSTART + RLENGTH - 1)
    }
    rest = substr(rest, RSTART + RLENGTH)
  }
  print result rest
}' /usr/local/kong/kong.template.yml > "$KONG_DECLARATIVE_CONFIG"

# Remove empty key-auth credentials (unconfigured opaque keys)
sed -i '/^[[:space:]]*- key:[[:space:]]*$/d' "$KONG_DECLARATIVE_CONFIG"

exec /entrypoint.sh kong docker-start
