// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawn } = require("child_process");

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

const env = readEnvFile(".env.local");
const dbUrl = env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error("SUPABASE_DB_URL is missing in .env.local.");
  process.exit(1);
}

const command = process.platform === "win32" ? "cmd" : "npx";
const args =
  process.platform === "win32"
    ? ["/c", "npx", "supabase", "db", "push", "--db-url", dbUrl, "--yes"]
    : ["supabase", "db", "push", "--db-url", dbUrl, "--yes"];

const child = spawn(command, args, {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
