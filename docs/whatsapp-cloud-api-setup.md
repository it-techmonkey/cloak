# WhatsApp Cloud API — Complete Setup Guide

This guide takes you from zero to sending WhatsApp messages from Cloak.
No prior Meta or WhatsApp Business experience needed.

---

## What You Will End Up With

- A WhatsApp Business Account (WABA) owned by TechMonkeys
- A phone number that sends messages as "Cloak" (or your brand name)
- A permanent access token to call the WhatsApp Cloud API
- The ability to send ticket confirmations, collection reminders, etc.

---

## How It Works (Plain English)

```
Your Server  ──POST──▶  Meta Cloud API  ──▶  WhatsApp App on user's phone
                (free, hosted by Meta)
```

Meta hosts the WhatsApp infrastructure. You just make a REST API call from
your Next.js server. No SDK needed — it's a plain `fetch()`.

The phone number that messages come FROM is a virtual number provided by Meta
(or you can port your own). Users see it like any other WhatsApp contact.

---

## Pricing

| Volume | Cost |
|---|---|
| First 1,000 conversations/month | **Free** |
| After 1,000 (marketing messages) | ~$0.025–$0.06 each |
| After 1,000 (utility/transactional) | ~$0.008–$0.015 each |

A "conversation" = 24-hour window, not per message. Ticket confirmations
count as **utility** messages — the cheapest tier.

---

## Prerequisites

- A Facebook account (personal is fine, you'll create a Business account)
- A phone number that is **NOT** already registered on WhatsApp
  (can be a spare SIM, a VoIP number like Google Voice, or a new number)
- A business name (e.g. "Cloak" or "TechMonkeys")

> **Important about the phone number:**
> The number you use for the API cannot be used in the WhatsApp app on a phone
> at the same time. If you want to keep using a number personally, get a
> dedicated one. A cheap VoIP number from Twilio (~$1/month) or a spare SIM works fine.

---

## Step 1 — Create a Meta Business Account

1. Go to **business.facebook.com**
2. Click **Create Account**
3. Fill in:
   - Business name: `TechMonkeys` (or `Cloak`)
   - Your name and email
4. Verify your email when Meta sends the confirmation link
5. You now have a Meta Business Account (MBA)

---

## Step 2 — Create a Meta Developer Account & App

1. Go to **developers.facebook.com**
2. Click **Get Started** (top right) — log in with the same Facebook account
3. Accept the developer terms
4. Click **Create App** (top right of the dashboard)
5. Choose **Business** as the app type → click Next
6. Fill in:
   - App name: `Cloak API` (anything you like)
   - App contact email: your email
   - Business Account: select the TechMonkeys account you just created
7. Click **Create App**

You now have a Meta App. Think of it as the "credentials container" for your API calls.

---

## Step 3 — Add WhatsApp to Your App

1. Inside your new app's dashboard, scroll down to find **WhatsApp** in the product list
2. Click **Set Up** next to WhatsApp
3. You'll see the **WhatsApp Getting Started** page
4. Under **Step 1: Select a business account**, choose TechMonkeys
5. Meta auto-creates a **WhatsApp Business Account (WABA)** for you — accept it

---

## Step 4 — Get Your Test Phone Number & Temporary Token

On the WhatsApp Getting Started page you'll now see:

### The Test Number
Meta gives you a **free test phone number** immediately — no setup needed.
It looks like: `+1 555 XXX XXXX`

You can use this to send up to **5 test messages/day** to numbers you explicitly
add as testers. Fine for development.

### The Temporary Access Token
You'll see a long string starting with `EAA...` — this is your **temporary access token**.
It expires in ~24 hours. Copy it for now; you'll replace it with a permanent one in Step 7.

### Your Phone Number ID
Below the token you'll see a **Phone Number ID** — a long number like `12345678901234`.
Copy this too. This is NOT your actual phone number — it's Meta's internal ID for it.

### Your WhatsApp Business Account ID
Also visible on this page — another long number. Copy it.

---

## Step 5 — Add a Test Recipient

Before you can send to any number in development, Meta requires you to add it as a tester:

1. On the Getting Started page, under **Step 2: Send messages with the API**
2. Find the **"To" phone number** dropdown
3. Click **Manage phone number list**
4. Add the WhatsApp number you want to test with (must be a real WhatsApp account)
5. That number will receive a WhatsApp message to confirm — approve it

Now you can send test messages to that number.

---

## Step 6 — Send Your First Test Message (API Test)

Before touching any code, confirm the API works using curl or Postman.

Replace the placeholders with your values from Step 4:

```bash
curl -X POST \
  "https://graph.facebook.com/v19.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_TEMPORARY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "447911123456",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": { "code": "en_US" }
    }
  }'
```

> **Note:** `to` must include the country code with no `+` or spaces.
> UK number `07911 123456` becomes `447911123456`.

If it works, you'll get a response like:
```json
{ "messages": [{ "id": "wamid.xxx" }] }
```
And the test number receives a "Hello World" WhatsApp message from Meta.

---

## Step 7 — Get a Permanent Access Token

The temporary token expires. Here's how to get one that doesn't:

### 7a — Create a System User

1. Go to **business.facebook.com/settings**
2. In the left sidebar: **Users → System Users**
3. Click **Add** → name it `cloak-api` → role: **Admin**
4. Click **Create System User**

### 7b — Assign the App to the System User

1. Still on the System User page, click **Add Assets**
2. Choose **Apps** → select your `Cloak API` app
3. Toggle **Full Control** → click **Save Changes**

### 7c — Generate the Token

1. Click **Generate New Token** on the system user
2. Select your app: `Cloak API`
3. Set expiry: **Never**
4. Under permissions, enable:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
5. Click **Generate Token**
6. **Copy it immediately** — Meta only shows it once

This is your permanent `WHATSAPP_ACCESS_TOKEN`. Store it safely.

---

## Step 8 — Get a Real Phone Number (for Production)

The Meta test number only works for whitelisted testers. For production you need a real number.

### Option A — Use a number you own
1. In your app dashboard → WhatsApp → **Phone Numbers**
2. Click **Add Phone Number**
3. Enter the number, choose SMS or voice for verification
4. Enter the OTP Meta sends to that number
5. Done — that number is now your WhatsApp sender

### Option B — Buy a cheap VoIP number (recommended for dedicated use)
Good providers that work for WhatsApp verification:
- **Twilio** — $1/month, buy a number at twilio.com/console
- **Vonage** — similar pricing
- **Google Voice** — free (US only)

Buy the number, then follow Option A above using it.

> After adding, go to **Phone Numbers** in the WhatsApp dashboard and copy the
> **Phone Number ID** for your new number (different from the test number ID).

---

## Step 9 — Create Message Templates

WhatsApp only allows you to send **pre-approved templates** to users who haven't
messaged you first in the last 24 hours. For ticket notifications, you need templates.

### Create a Ticket Confirmation Template

1. In your app dashboard → WhatsApp → **Message Templates**
2. Click **Create Template**
3. Fill in:
   - **Category**: `UTILITY` (for transactional messages — cheapest tier)
   - **Name**: `ticket_confirmation` (lowercase, underscores only)
   - **Language**: English (UK) or English (US)
4. Build the template body. Example:

```
Your Cloak ticket is ready! 🎉

Venue: {{1}}
Items: {{2}}
Ticket ID: {{3}}

Show this ID at the cloakroom to collect your items.
Valid until: {{4}}
```

`{{1}}`, `{{2}}` etc. are variables you fill in at send time.

5. Add a **header** (optional): `Cloak Cloakroom Ticket`
6. Add a **footer** (optional): `Reply HELP for support`
7. Click **Submit**

Meta reviews templates — usually approved within a few minutes for utility templates,
up to 24 hours in rare cases.

### Other Templates to Create

| Name | Use |
|---|---|
| `ticket_confirmation` | Sent when a ticket is activated |
| `collection_reminder` | Sent 30 min before venue closes |
| `ticket_collected` | Sent when items are collected |

---

## Step 10 — Add Environment Variables to Cloak

Add these to your `.env.local` and to Vercel environment variables:

```env
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx   # permanent token from Step 7
WHATSAPP_PHONE_NUMBER_ID=12345678901234  # Phone Number ID from Step 4 or 8
WHATSAPP_BUSINESS_ACCOUNT_ID=98765432109876  # WABA ID from Step 4
```

---

## Step 11 — Set Up a Webhook (for Delivery Receipts / Inbound Messages)

Optional but recommended — lets you know when messages are delivered or read,
and receive replies.

### 11a — Create the webhook route in Cloak

You'll add this to the codebase when implementing. The endpoint needs to:
1. Respond to a `GET` request with a verification challenge (one-time setup)
2. Receive `POST` requests with message events

### 11b — Register the webhook in Meta

1. App dashboard → WhatsApp → **Configuration**
2. Under **Webhook**, click **Edit**
3. **Callback URL**: `https://your-vercel-domain.vercel.app/api/whatsapp/webhook`
4. **Verify Token**: any string you choose (e.g. `cloak_webhook_2024`) — save this as `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in your env
5. Click **Verify and Save**
6. Subscribe to: `messages` (gives you sent/delivered/read status + inbound messages)

---

## Step 12 — Go Live (Remove Test Restrictions)

When you're ready for real users (not just whitelisted testers):

1. App dashboard → top right → **App Mode: Development** → switch to **Live**
2. Meta may ask you to verify your business — submit:
   - Business registration documents or
   - A utility bill / bank statement with business name and address
3. Verification takes 1–5 business days
4. Once live, you can message any WhatsApp user worldwide (within Meta's policies)

---

## Quick Reference — Key IDs to Save

| Variable | Where to Find It | Example Format |
|---|---|---|
| `WHATSAPP_ACCESS_TOKEN` | System User → Generate Token | `EAAxxxxx...` |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp → Getting Started or Phone Numbers | `12345678901234` |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp → Getting Started | `98765432109876` |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | You choose this string | `cloak_webhook_2024` |

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Using a number already on WhatsApp app | Use a fresh number or unregister it from WhatsApp first |
| Sending a free-form message to a new user | Must use a template — free-form only works within 24hr of user messaging you |
| Token expires | Use System User permanent token, not the temporary one on Getting Started page |
| `to` field has `+` or spaces | Strip them: `+44 7911 123456` → `447911123456` |
| Template rejected | Change category to UTILITY, remove promotional language |
| Phone Number ID vs phone number | The API uses the ID (long number), not the actual phone number |

---

## What to Tell Me When You're Ready to Integrate

Once you have the three env vars (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, template name), just say:

> "Integrate WhatsApp — send ticket confirmation on activation"

And I'll add the API call into the ticket activation flow in Cloak.
