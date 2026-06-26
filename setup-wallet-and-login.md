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
Google Wallet issuer account and service account credentials from Google Cloud.

### Step 1 — Create a Google Wallet issuer account

1. Go to the [Google Wallet Console](https://pay.google.com/business/console).
2. Accept the terms of service (Wallet T&Cs).
3. Complete your **Business Profile** with:
   - Public business name (e.g. "Cloak QR")
   - Merchant category code (MCC): `7299` (miscellaneous personal services)
   - Business website and support URL
   - Legal entity info if required
4. Your **Issuer ID** is the long number shown on the dashboard
   (e.g. `3388000000022xxxxxx`).

```env
GOOGLE_WALLET_ISSUER_ID=3388000000022xxxxxx
```

### Step 2 — Enable the Google Wallet API and create a service account

You'll need [Google Cloud Console](https://console.cloud.google.com) for this step.

> **Important:** If your Google Cloud account is part of an **organisation**, the
> org policy `iam.disableServiceAccountKeyCreation` may block JSON key creation.
> In that case, **create a new Google Cloud project using a personal Google account**
> (not your org account) at [console.cloud.google.com](https://console.cloud.google.com).
> Personal accounts don't have this org restriction.

1. Create or select a Google Cloud project (**personal account recommended**).
2. Go to **APIs & Services → Library**, search for **Google Wallet API**, and enable it.
3. Go to **IAM & Admin → Service Accounts → Create Service Account**:
   - Name: `cloak-wallet-backend`
   - Click through the role steps (no special roles needed)
4. Open the service account, go to the **Keys** tab → **Add key → Create new key → JSON**.
5. Download the JSON file. From it, extract:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

### Step 3 — Grant the service account access in Google Wallet Console

1. Go back to the [Google Wallet Console](https://pay.google.com/business/console).
2. Navigate to **Users** (in the left sidebar).
3. Click **Add user** and paste the service account email from Step 2.
4. Grant it **Admin** access.

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=wallet@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----"
```

The Google route already handles `\n`-escaped keys, so the literal `\n` form
works here without any extra steps.

### Step 4 — Create the pass class (one-time, required)

> This is the most common reason Google Wallet saves silently fail.

The backend creates passes referencing a class with ID `cloak_ticket`
(`${issuerId}.cloak_ticket`) but does **not** create it automatically. You must
create this `GenericClass` once before any guest can save a pass.

**Option A — Google Wallet Console (recommended)**

1. Go to the [Google Wallet Console](https://pay.google.com/business/console).
2. Go to **Pass classes** in the left sidebar.
3. Click **+ Create pass class** and select **Generic**.
4. Fill in:
   - **Class ID**: `cloak_ticket`
   - **Issuer name**: `Cloak` or your business name
5. Save. The full class ID will be `YOUR_ISSUER_ID.cloak_ticket`.

**Option B — API call (if you prefer the CLI)**

```bash
curl -X POST \
  "https://walletobjects.googleapis.com/walletobjects/v1/genericClass" \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "YOUR_ISSUER_ID.cloak_ticket",
    "issuerName": "Cloak",
    "reviewStatus": "UNDER_REVIEW"
  }'
```

### Step 5 — Request publishing access (demo mode → production)

In **demo mode**, you can save passes but they won't display to real users on
`pay.google.com`. When ready to go live:

1. In the [Google Wallet Console](https://pay.google.com/business/console),
   go to **Manage → Google Wallet API**.
2. Click the **Validate** tab.
3. Click **Request publishing access**.
4. Describe your use case (see the guide at the top of this session for the text).
5. Google reviews in 2–5 business days and either approves or asks questions.
6. Once approved, your passes are live on `pay.google.com` — **you cannot go
   back to demo mode**.

### Testing Google Wallet

**In demo mode:**
- The "Add to Google Wallet" button appears on a ticket page only when all three Google vars are set.
- Clicking it opens a preview; you can save to a test wallet or see the pass details.
- You can test extensively in demo before requesting publishing access.

**If you get errors:**
- **404 or "class not found"**: The pass class `cloak_ticket` was not created (Step 4 above).
- **Auth error**: The service account email was not added to Users in the Google Wallet Console (Step 3).
- **500 error**: Check that the service account key (private_key) has no extra escaping — it should be a raw PEM string or `\n`-escaped.

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
