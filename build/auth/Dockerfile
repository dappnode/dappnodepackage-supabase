FROM supabase/gotrue:v2.186.0

COPY --chmod=755 assets/secrets/with-secrets.sh /usr/local/bin/with-secrets.sh

ENV GOTRUE_API_HOST="0.0.0.0" \
    GOTRUE_API_PORT="9999" \
    API_EXTERNAL_URL="http://supabase.public.dappnode:8000" \
    GOTRUE_DB_DRIVER="postgres" \
    GOTRUE_DB_DATABASE_URL="postgres://supabase_auth_admin:change-this-postgres-password@db:5432/postgres" \
    GOTRUE_SITE_URL="http://supabase.public.dappnode:8000" \
    GOTRUE_URI_ALLOW_LIST="" \
    GOTRUE_DISABLE_SIGNUP="false" \
    GOTRUE_JWT_ADMIN_ROLES="service_role" \
    GOTRUE_JWT_AUD="authenticated" \
    GOTRUE_JWT_DEFAULT_GROUP_NAME="authenticated" \
    GOTRUE_JWT_EXP="3600" \
    GOTRUE_JWT_SECRET="change-this-jwt-secret-please-1234567890" \
    GOTRUE_EXTERNAL_EMAIL_ENABLED="true" \
    GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED="false" \
    GOTRUE_MAILER_AUTOCONFIRM="false" \
    GOTRUE_SMTP_ADMIN_EMAIL="admin@example.com" \
    GOTRUE_SMTP_HOST="supabase-mail" \
    GOTRUE_SMTP_PORT="2500" \
    GOTRUE_SMTP_USER="fake_mail_user" \
    GOTRUE_SMTP_PASS="fake_mail_password" \
    GOTRUE_SMTP_SENDER_NAME="fake_sender" \
    GOTRUE_MAILER_URLPATHS_INVITE="/auth/v1/verify" \
    GOTRUE_MAILER_URLPATHS_CONFIRMATION="/auth/v1/verify" \
    GOTRUE_MAILER_URLPATHS_RECOVERY="/auth/v1/verify" \
    GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE="/auth/v1/verify" \
    GOTRUE_EXTERNAL_PHONE_ENABLED="true" \
    GOTRUE_SMS_AUTOCONFIRM="true" \
    SUPABASE_SERVICE_NAME="auth"

ENTRYPOINT ["/usr/local/bin/with-secrets.sh"]
