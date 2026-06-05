// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");

function readEnvFile(path) {
  const env = {};
  const text = fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);

    if (match) {
      env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
  }

  return env;
}

async function main() {
  const env = readEnvFile(".env.local");
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
  ];
  const migrationKeys = ["SUPABASE_DB_URL", "SUPABASE_DB_PASSWORD"];

  for (const key of required) {
    console.log(`${key}: ${env[key] ? "set" : "missing"}`);
  }

  for (const key of migrationKeys) {
    console.log(`${key}: ${env[key] ? "set" : "missing"}`);
  }

  if (required.some((key) => !env[key])) {
    const presentKeys = Object.keys(env);
    console.log(`ENV_KEYS_FOUND: ${presentKeys.length ? presentKeys.join(", ") : "none"}`);
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    process.exit(2);
  }

  const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(`SUPABASE_HOST: ${url.host}`);

  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
    headers: {
      apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  console.log(`AUTH_SETTINGS_STATUS: ${response.status}`);

  if (!response.ok) {
    process.exit(3);
  }
}

main().catch((error) => {
  console.log(`AUTH_SETTINGS_ERROR: ${error.name}`);
  process.exit(4);
});
