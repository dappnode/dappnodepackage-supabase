const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const configDir = process.env.SUPABASE_CONFIG_DIR || "/run/supabase-config";
const envFile = path.join(configDir, "supabase.env");
const dbDataDir = process.env.SUPABASE_DB_DATA_DIR || "/var/lib/postgresql/data";
const dataSendUrl =
  process.env.DAPPNODE_DATA_SEND_URL || "http://my.dappnode/data-send";

function randomBase64(bytes) {
  return crypto.randomBytes(bytes).toString("base64");
}

function randomBase64Url(bytes) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function randomHex(bytes) {
  return crypto.randomBytes(bytes).toString("hex");
}

function randomAlnum(length) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";

  while (output.length < length) {
    for (const byte of crypto.randomBytes(length)) {
      if (output.length >= length) break;
      output += alphabet[byte % alphabet.length];
    }
  }

  return output;
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signJwt(payload, secret) {
  const header = base64UrlJson({ alg: "HS256", typ: "JWT" });
  const body = base64UrlJson(payload);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function line(key, value) {
  return `export ${key}=${shellQuote(value)}`;
}

function parseGeneratedEnv(contents) {
  const values = {};

  for (const rawLine of contents.split("\n")) {
    const match = rawLine.match(/^export ([A-Z0-9_]+)='(.*)'$/);
    if (!match) continue;

    values[match[1]] = match[2].replace(/'\\''/g, "'");
  }

  return values;
}

function writeEnvFile(values, reason) {
  const contents = [
    "# Generated on first launch. Do not edit unless you know exactly what you are changing.",
    "# This file is persisted in the supabase-config volume and reused across package updates.",
    reason,
    ...Object.entries(values).map(([key, value]) => line(key, value)),
    "",
  ].join("\n");

  const tmpFile = `${envFile}.tmp`;
  fs.writeFileSync(tmpFile, contents, { mode: 0o644 });
  fs.renameSync(tmpFile, envFile);
}

function setupValue(name, options = {}) {
  const value = process.env[name] || "";

  if (options.required && !value) {
    throw new Error(`${name} must be provided by the DAppNode setup wizard`);
  }

  if (options.pattern && !options.pattern.test(value)) {
    throw new Error(options.message || `${name} has an invalid format`);
  }

  return value;
}

function packageValues(values) {
  return [
    ["Supabase URL", "http://supabase.public.dappnode:8000"],
    ["Supabase Anon Key", values.ANON_KEY],
    ["Supabase Service Role Key (server only)", values.SERVICE_ROLE_KEY],
    ["Supabase Dashboard Username", values.DASHBOARD_USERNAME],
    ["Supabase Dashboard Password", values.DASHBOARD_PASSWORD],
    ["Supabase S3 Access Key ID", values.S3_PROTOCOL_ACCESS_KEY_ID],
    ["Supabase S3 Secret Access Key", values.S3_PROTOCOL_ACCESS_KEY_SECRET],
  ];
}

function postPackageValue(key, data, attempt = 1) {
  return new Promise((resolve) => {
    const url = new URL(dataSendUrl);
    url.searchParams.set("key", key);
    url.searchParams.set("data", data || "");

    const client = url.protocol === "https:" ? https : http;
    const request = client.request(
      url,
      { method: "POST", timeout: 5000 },
      (response) => {
        response.resume();
        response.on("end", () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            console.log(`Published package value: ${key}`);
            resolve(true);
            return;
          }

          resolve(false);
        });
      }
    );

    request.on("timeout", () => request.destroy(new Error("timeout")));
    request.on("error", () => resolve(false));
    request.end();
  }).then(async (ok) => {
    if (ok) return true;

    if (attempt >= 5) {
      console.warn(`Failed to publish package value after retries: ${key}`);
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    return postPackageValue(key, data, attempt + 1);
  });
}

async function publishPackageValues(values) {
  if (process.env.SUPABASE_SKIP_DATA_SEND === "true") {
    console.log("Skipping DAppNode package value publishing");
    return;
  }

  await Promise.all(
    packageValues(values).map(([key, data]) => postPackageValue(key, data))
  );
}

function keepAliveIfRequested() {
  if (process.env.SUPABASE_SECRETS_KEEP_ALIVE === "true") {
    console.log("Keeping Supabase secrets service alive");
    setInterval(() => {}, 2 ** 31 - 1);
  }
}

async function main() {
  if (fs.existsSync(envFile) && fs.statSync(envFile).size > 0) {
    const existingValues = parseGeneratedEnv(fs.readFileSync(envFile, "utf8"));
    let repaired = false;

    if (
      !existingValues.DB_ENC_KEY ||
      Buffer.byteLength(existingValues.DB_ENC_KEY, "utf8") !== 16
    ) {
      existingValues.DB_ENC_KEY = randomAlnum(16);
      repaired = true;
      console.log("Repaired Supabase Realtime DB_ENC_KEY in existing secrets");
    }

    if (repaired) {
      writeEnvFile(
        existingValues,
        "# Existing credentials reused; repaired values with invalid formats."
      );
    }

    console.log(`Supabase secrets already exist at ${envFile}`);
    await publishPackageValues(existingValues);
    keepAliveIfRequested();
    return;
  }

  fs.mkdirSync(configDir, { recursive: true });

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = 4102444800; // 2100-01-01T00:00:00Z
  const jwtSecret = randomBase64Url(48);
  const anonKey = signJwt(
    {
      role: "anon",
      iss: "supabase-dappnode",
      iat: now,
      exp: expiresAt,
    },
    jwtSecret
  );
  const serviceRoleKey = signJwt(
    {
      role: "service_role",
      iss: "supabase-dappnode",
      iat: now,
      exp: expiresAt,
    },
    jwtSecret
  );

  const legacyValues = {
    POSTGRES_PASSWORD: "change-this-postgres-password",
    JWT_SECRET: "change-this-jwt-secret-please-1234567890",
    JWT_EXP: "3600",
    ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.c7yiVfwn6qj0VlxUS-JmmCrMWCu9Czx5IllcbqLRCaQ",
    SERVICE_ROLE_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.n41Hb1KZ97vGnvMCHL-ibrCUSK9k_Y0a7C0PTFsp8rs",
    SECRET_KEY_BASE:
      "UpNVntn3cDxHJpq99YMc1T1AQgQpc8kfYTuRgBiYa15BLrx8etQoXz3gZv1/u2oq",
    VAULT_ENC_KEY: "0123456789abcdef0123456789abcdef",
    PG_META_CRYPTO_KEY: "0123456789abcdef0123456789abcdef",
    LOGFLARE_PUBLIC_ACCESS_TOKEN: "change-this-logflare-public-token",
    LOGFLARE_PRIVATE_ACCESS_TOKEN: "change-this-logflare-private-token",
    S3_PROTOCOL_ACCESS_KEY_ID: "625729a08b95bf1b7ff351a663f3a23c",
    S3_PROTOCOL_ACCESS_KEY_SECRET:
      "850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907",
    DASHBOARD_USERNAME: "supabase",
    DASHBOARD_PASSWORD: "change-this-dashboard-password",
    DB_ENC_KEY: "supabaserealtime",
  };

  const hasExistingDb = fs.existsSync(path.join(dbDataDir, "PG_VERSION"));
  const setupPostgresPassword = hasExistingDb
    ? legacyValues.POSTGRES_PASSWORD
    : setupValue("POSTGRES_PASSWORD", {
        required: true,
        pattern: /^[A-Za-z0-9]{16,64}$/,
        message:
          "POSTGRES_PASSWORD must be 16 to 64 characters and contain only letters and numbers",
      });
  const setupDashboardPassword = hasExistingDb
    ? legacyValues.DASHBOARD_PASSWORD
    : setupValue("DASHBOARD_PASSWORD", {
        required: true,
        pattern: /^[A-Za-z0-9]{8,64}$/,
        message:
          "DASHBOARD_PASSWORD must be 8 to 64 characters and contain only letters and numbers",
      });

  const randomValues = {
    POSTGRES_PASSWORD: setupPostgresPassword,
    JWT_SECRET: jwtSecret,
    JWT_EXP: "3600",
    ANON_KEY: anonKey,
    SERVICE_ROLE_KEY: serviceRoleKey,
    SECRET_KEY_BASE: randomBase64(48),
    VAULT_ENC_KEY: randomHex(16),
    PG_META_CRYPTO_KEY: randomBase64(24),
    LOGFLARE_PUBLIC_ACCESS_TOKEN: randomBase64(24),
    LOGFLARE_PRIVATE_ACCESS_TOKEN: randomBase64(24),
    S3_PROTOCOL_ACCESS_KEY_ID: randomHex(16),
    S3_PROTOCOL_ACCESS_KEY_SECRET: randomHex(32),
    DASHBOARD_USERNAME: "supabase",
    DASHBOARD_PASSWORD: setupDashboardPassword,
    DB_ENC_KEY: randomAlnum(16),
  };

  const values = hasExistingDb ? legacyValues : randomValues;

  writeEnvFile(
    values,
    hasExistingDb
      ? "# Existing database volume detected: using legacy test credentials for upgrade compatibility."
      : "# Fresh database volume detected: using setup wizard and random generated credentials."
  );

  console.log(
    `Generated Supabase secrets at ${envFile} (${hasExistingDb ? "legacy upgrade compatibility" : "fresh setup wizard/random credentials"})`
  );
  await publishPackageValues(values);
  keepAliveIfRequested();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
