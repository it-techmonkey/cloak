// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require("@supabase/supabase-js");

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

async function findUserByEmail(supabase, email) {
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find((item) => item.email?.toLowerCase() === normalizedEmail);

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      return null;
    }
  }

  return null;
}

async function main() {
  const env = readEnvFile(".env.local");
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = env.SUPABASE_SECRET_KEY;
  const email = env.PLATFORM_ADMIN_EMAIL;
  const password = env.PLATFORM_ADMIN_PASSWORD;
  const fullName = env.PLATFORM_ADMIN_NAME || "Platform Admin";
  const phone = env.PLATFORM_ADMIN_PHONE || null;

  if (!url || !secretKey) {
    console.error("Supabase URL or secret key is missing in .env.local.");
    process.exit(1);
  }

  if (!email || !password) {
    console.error("PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD are required in .env.local.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("PLATFORM_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const supabase = createClient(url, secretKey, {
    auth: {
      persistSession: false,
    },
  });

  let user = await findUserByEmail(supabase, email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      throw error;
    }

    user = data.user;
  }

  if (!user) {
    throw new Error("Could not create or locate platform admin user.");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    email,
    full_name: fullName,
    id: user.id,
    phone,
    role: "platform_admin",
  });

  if (profileError) {
    throw profileError;
  }

  console.log(`Platform admin ready: ${email}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
