FROM supabase/studio:2026.04.08-sha-205cbe7

COPY --chmod=755 assets/secrets/generate-secrets.js /usr/local/bin/generate-secrets.js

HEALTHCHECK NONE

ENTRYPOINT ["node", "/usr/local/bin/generate-secrets.js"]
