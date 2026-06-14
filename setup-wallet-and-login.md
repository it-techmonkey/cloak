# Wallet & Login Setup Guide

All secrets go in `.env.local`. The app auto-detects what is configured — wallet
buttons only appear when the relevant env vars are present, so you can set each
feature up independently without breaking anything else.

---

## Part 1 — Login (Supabase Auth)

Login is the foundation. The app supports two sign-in methods:

1. **Email + password** — works as soon as the Supabase keys are set.
2. **OAuth (Google / Apple sign-in)** — optional, requires extra provider config in Supabase.

### 1a. Core Supabase keys

Go to your [Supabase dashboard](https://supabase.com/dashboard) → your project →
**Project Settings → API**.

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_DB_URL=postgresql://...
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | "publishable" / anon key |
| `SUPABASE_SECRET_KEY` | "secret" / service_role key — **server only, never expose publicly** |
| `SUPABASE_DB_URL` | Settings → Database → Connection string (used for running migrations) |

> The secret key is used by server actions to bypass RLS. It is never
> prefixed `NEXT_PUBLIC_` and must never appear in client-side code.

### 1b. Configure the auth callback URL

The OAuth and magic-link flow returns users to `/auth/callback`. Set these in
Supabase → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (dev) or your production domain
- **Redirect URLs**: add both:
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback`

### 1c. Platform admin account

These seed the first admin user:

```env
PLATFORM_ADMIN_EMAIL=you@company.com
PLATFORM_ADMIN_PASSWORD=<strong-password>
PLATFORM_ADMIN_NAME=Your Name
PLATFORM_ADMIN_PHONE=+44...
```

### 1d. OAuth login providers (optional)

This is "Sign in with Google/Apple" on the login modal — separate from Google/Apple Wallet.

**Google OAuth login**

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add Supabase's callback URL to **Authorized redirect URIs** — find it in Supabase → Authentication → Providers → Google.
4. Paste the Client ID and Secret into Supabase.

**Apple OAuth login**

1. Requires an Apple Developer account.
2. Create a **Service ID** in Apple Developer → Identifiers.
3. Enable "Sign in with Apple", add your domain and the Supabase callback URL.
4. Create a **Sign in with Apple key** and paste the details into Supabase → Authentication → Providers → Apple.

If you skip OAuth login, the Google/Apple sign-in buttons will error when clicked
but email + password continues to work.

---

## Part 2 — Apple Wallet

Generates signed `.pkpass` files. Requires an **Apple Developer Program
membership ($99/yr)**.

You need three certificates converted to PEM format.

### Step 1 — Create a Pass Type ID

1. Go to [Apple Developer](https://developer.apple.com/account) → Certificates,
   IDs & Profiles → Identifiers → **+** → Pass Type IDs.
2. Create an identifier such as `pass.com.yourcompany.cloak`.

```env
APPLE_PASS_TYPE_ID=pass.com.yourcompany.cloak
```

### Step 2 — Find your Team ID

Your 10-character Team ID is shown in the top-right of the Apple Developer
membership page.

```env
APPLE_TEAM_ID=ABCDE12345
```

### Step 3 — Generate the pass signing certificate

1. On the Pass Type ID page, click **Create Certificate**.
2. Generate a Certificate Signing Request (CSR) using Keychain Access on Mac
   (or `openssl`), upload it, and download `pass.cer`.
3. Convert to PEM:

```bash
openssl x509 -inform der -in pass.cer -out pass-cert.pem
```

The contents of `pass-cert.pem` go into:

```env
APPLE_PASS_CERT_PEM="-----BEGIN CERTIFICATE-----\nMII...\n-----END CERTIFICATE-----"
```

### Step 4 — Export the private key

If you used Keychain Access, export as `.p12` then convert:

```bash
openssl pkcs12 -in Certificates.p12 -nocerts -nodes -out pass-key.pem
```

```env
APPLE_PASS_KEY_PEM="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----"
```

### Step 5 — Download the WWDR certificate

1. Download the **Apple Worldwide Developer Relations — G4** certificate from
   [https://www.apple.com/certificateauthority/](https://www.apple.com/certificateauthority/).
2. Convert to PEM:

```bash
openssl x509 -inform der -in AppleWWDRCAG4.cer -out wwdr.pem
```

```env
APPLE_WWDR_PEM="-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----"
```

### Storing PEMs in .env.local

PEM blocks are multi-line. Use `\n` for line breaks and wrap the value in
double quotes:

```env
APPLE_PASS_CERT_PEM="-----BEGIN CERTIFICATE-----\nMII...\n-----END CERTIFICATE-----"
APPLE_PASS_KEY_PEM="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----"
APPLE_WWDR_PEM="-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----"
```

> **Known gotcha:** `passkit-generator` requires real newlines in the PEM
> strings, not the literal two characters `\n`. If pass generation throws a
> certificate error, the Apple route needs the same `replace(/\\n/g, "\n")`
> transform that the Google route already applies to its private key. Raise
> this and it can be patched in one line.

### Verifying Apple Wallet

- The "Add to Apple Wallet" button appears on a ticket page only when all five
  Apple vars are set.
- Test by opening `/api/wallet/apple?code=CLK-YYYYMMDD-XXXXXX` — it should
  download a `.pkpass` file.
- A `503` means the vars are missing or incomplete.
- A `500` means a certificate error (most likely the newline issue above).

---

## Part 3 — Google Wallet

Generates a signed JWT "Save to Wallet" link. Free to use, but requires a
Google Wallet issuer account.

### Step 1 — Get an Issuer ID

1. Go to the [Google Wallet Console](https://pay.google.com/business/console).
2. Accept the terms of service.
3. Your **Issuer ID** is the long number shown on the dashboard
   (e.g. `3388000000022xxxxxx`).

```env
GOOGLE_WALLET_ISSUER_ID=3388000000022xxxxxx
```

### Step 2 — Enable the API and create a service account

1. In [Google Cloud Console](https://console.cloud.google.com), enable the
   **Google Wallet API**.
2. Go to IAM & Admin → Service Accounts → **Create Service Account**.
3. Create a JSON key for that account and download it.
4. From the JSON file:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
5. In the **Google Wallet Console → Users**, grant that service account email
   access to your issuer account.

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=wallet@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----"
```

The Google route already handles `\n`-escaped keys, so the literal `\n` form
works here without any extra steps.

### Step 3 — Create the pass class (one-time, required)

> This is the most common reason Google Wallet saves silently fail.

The route references a class with ID `cloak_ticket`
(`${issuerId}.cloak_ticket`) but does **not** create it automatically. You must
create this `GenericClass` once before any guest can save a pass.

**Option A — Google Wallet Console**

Go to Google Wallet Console → Pass classes → Create a new **Generic** class
with ID `cloak_ticket`.

**Option B — API call (one-time)**

```bash
curl -X POST \
  "https://walletobjects.googleapis.com/walletobjects/v1/genericClass" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "YOUR_ISSUER_ID.cloak_ticket",
    "issuerName": "Cloak",
    "reviewStatus": "UNDER_REVIEW"
  }'
```

### Verifying Google Wallet

- The "Add to Google Wallet" button appears on a ticket page only when all
  three Google vars are set.
- Clicking it should redirect to `pay.google.com/gp/v/save/...`.
- If the redirect returns a 404 or "class not found" error, the pass class was
  not created (Step 3 above).

---

## Summary — all env vars

```env
# ── Supabase (required for all login) ─────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_DB_URL=postgresql://...

# ── Platform admin seed ────────────────────────────────────────────────────────
PLATFORM_ADMIN_EMAIL=you@company.com
PLATFORM_ADMIN_PASSWORD=
PLATFORM_ADMIN_NAME=
PLATFORM_ADMIN_PHONE=

# ── Apple Wallet (optional) ────────────────────────────────────────────────────
APPLE_PASS_TYPE_ID=pass.com.yourcompany.cloak
APPLE_TEAM_ID=ABCDE12345
APPLE_PASS_CERT_PEM="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
APPLE_PASS_KEY_PEM="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APPLE_WWDR_PEM="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"

# ── Google Wallet (optional) ───────────────────────────────────────────────────
GOOGLE_WALLET_ISSUER_ID=3388000000022xxxxxx
GOOGLE_SERVICE_ACCOUNT_EMAIL=wallet@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

## Setup order

1. **Supabase keys** — email/password login works immediately.
2. **Auth callback URLs in Supabase** — required for OAuth login and post-login
   redirects to work.
3. **Google Wallet** — easier to set up (free, no certs), but don't forget to
   create the pass class.
4. **Apple Wallet** — requires the paid Apple Developer account and three
   certificates.
