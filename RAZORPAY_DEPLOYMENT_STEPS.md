# Razorpay Payment Integration — Deployment Steps

## Files Created

| File | Purpose |
|------|---------|
| `supabase/functions/create-order/index.ts` | Edge Function: creates Razorpay order via API |
| `supabase/functions/verify-payment/index.ts` | Edge Function: verifies HMAC-SHA256 signature, saves to DB |
| `supabase/functions/razorpay-webhook/index.ts` | Edge Function: handles Razorpay webhooks with idempotency |
| `sql/payments_table.sql` | SQL to create the `payments` table |
| `.gitignore` | Prevents secrets from being pushed to GitHub |
| `.env.example` | Template of required env vars (safe to commit) |

## Files Modified

| File | Change |
|------|--------|
| `js/razorpay.js` | Rewritten: calls Edge Functions for order creation + verification |
| `js/config.js` | Replaced `razorpayKey` with `razorpayKeyId` + added `supabaseFunctionUrl` |

---

## Step 1: Create the payments table in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `sql/payments_table.sql` and copy the contents
3. Paste into SQL Editor and run

---

## Step 2: Set Edge Function secrets

In **Supabase Dashboard** → **Settings** → **Edge Functions**, add these secrets:

| Secret Name | Value | Where to Get It |
|-------------|-------|-----------------|
| `RAZORPAY_KEY_ID` | `rzp_live_...` or `rzp_test_...` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | your key secret | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | your webhook secret | Razorpay Dashboard → Settings → Webhooks |
| `SUPABASE_URL` | `https://rbwrvrwuxndzcstzurdk.supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_SECRET_KEY` | your `secret` key | Supabase Dashboard → Settings → API |

---

## Step 3: Deploy Edge Functions

In **Supabase Dashboard** → **Edge Functions**, create three functions:

### Function 1: `create-order`
- Name: `create-order`
- Paste contents of `supabase/functions/create-order/index.ts`
- Deploy

### Function 2: `verify-payment`
- Name: `verify-payment`
- Paste contents of `supabase/functions/verify-payment/index.ts`
- Deploy

### Function 3: `razorpay-webhook`
- Name: `razorpay-webhook`
- Paste contents of `supabase/functions/razorpay-webhook/index.ts`
- Deploy

---

## Step 4: Update frontend config

In `js/config.js`, replace the placeholder:

```js
razorpayKeyId: 'rzp_live_YOUR_RAZORPAY_KEY_ID',
```

with your actual Razorpay Key ID:

```js
razorpayKeyId: 'rzp_live_xxxxxxxxxxxx',
```

---

## Step 5: Set up Razorpay Webhook

1. Go to **Razorpay Dashboard** → **Settings** → **Webhooks**
2. Click **Add New Webhook**
3. **Webhook URL**: `https://rbwrvrwuxndzcstzurdk.supabase.co/functions/v1/razorpay-webhook`
4. **Events**: Select `payment.captured`
5. **Secret**: Generate a strong secret and copy it
6. Save the webhook
7. Add the secret as `RAZORPAY_WEBHOOK_SECRET` in Supabase Edge Function secrets (Step 2)

---

## Step 6: Create local `.env.local` (optional, for reference)

```bash
cp .env.example .env.local
```

Then fill in your real values. This file is gitignored.

---

## Step 7: Verify everything works

### Test the create-order function:
```bash
curl -X POST https://rbwrvrwuxndzcstzurdk.supabase.co/functions/v1/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000}'
```

Expected response:
```json
{ "order_id": "order_xxxxxxxxx", "amount": 50000, "currency": "INR" }
```

### Test the verify-payment function (with a fake signature — will fail):
```bash
curl -X POST https://rbwrvrwuxndzcstzurdk.supabase.co/functions/v1/verify-payment \
  -H "Content-Type: application/json" \
  -d '{"razorpay_payment_id":"pay_test","razorpay_order_id":"order_test","razorpay_signature":"invalid"}'
```

Expected response:
```json
{ "error": "Invalid payment signature" }
```

### Browser test:
1. Open `order.html` in your browser
2. Add items to cart
3. Click **Proceed to Checkout**
4. Fill in delivery details
5. Click **Pay with Razorpay**
6. Complete payment in Razorpay modal
7. Verify success message and confirmation page

---

## Environment Variables Reference

### Supabase Edge Function Secrets (set in Dashboard, never in code)

| Variable | Purpose |
|----------|---------|
| `RAZORPAY_KEY_ID` | Public Razorpay API key ID (starts with `rzp_`) |
| `RAZORPAY_KEY_SECRET` | Secret Razorpay API key — used to create orders and verify signatures |
| `RAZORPAY_WEBHOOK_SECRET` | Secret used to verify webhook requests from Razorpay |
| `SUPABASE_URL` | Supabase project URL for database access |
| `SUPABASE_SECRET_KEY` | Supabase service role key — bypasses RLS, used only by Edge Functions |

### Cloudflare Pages Environment Variables (set in Dashboard)

| Variable | Purpose |
|----------|---------|
| `RAZORPAY_KEY_ID` | Same as above — needed if you serve the Key ID via server-side |
| `SUPABASE_URL` | Same as above — needed if you proxy through Cloudflare Functions |

### Frontend Config (`js/config.js`) — Safe to commit

| Variable | Purpose |
|----------|---------|
| `razorpayKeyId` | Public Razorpay Key ID — safe to expose |
| `supabaseUrl` | Public Supabase project URL — safe to expose |
| `supabaseAnonKey` | Public Supabase anon key — safe to expose (RLS-protected) |
| `supabaseFunctionUrl` | Public URL for Edge Functions — safe to expose |

---

## Security Reminders

### NEVER commit these to GitHub:
- ❌ `RAZORPAY_KEY_SECRET`
- ❌ `RAZORPAY_WEBHOOK_SECRET`
- ❌ `SUPABASE_SECRET_KEY`
- ❌ Any `.env` or `.env.local` file
- ❌ Any file containing real secret values

### These ARE safe in frontend code:
- ✅ `RAZORPAY_KEY_ID` (public identifier)
- ✅ `SUPABASE_URL` (public URL)
- ✅ `SUPABASE_ANON_KEY` (RLS-protected, public)

### How to check if you accidentally pushed secrets:
```bash
git log --all --full-history -p -- js/config.js | grep -i "secret\|key\|rzp_\|sb_"
```

### How to remove secrets from git history:
```bash
# Using git filter-branch (simpler):
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch js/config.js" \
  --prune-empty --tag-name-filter cat -- --all

# Then force push:
git push origin --force --all
git push origin --force --tags
```

**Better option — BFG Repo Cleaner:**
```bash
# Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --replace-text passwords.txt my-repo.git
```

After cleaning, re-add the file without secrets and recommit.

---

## How Supabase Edge Function Secrets Work

- Secrets are set in **Supabase Dashboard → Settings → Edge Functions**
- They are injected as environment variables at runtime via `Deno.env.get("VARIABLE_NAME")`
- They are **never stored in any file** in your repository
- They are encrypted at rest and only accessible to your deployed Edge Functions
- Each secret can be up to 16KB

## How Cloudflare Pages Environment Variables Work

- Set in **Cloudflare Dashboard → Pages → your project → Settings → Environment variables**
- Can be set per environment (Production, Preview)
- Accessed via `process.env.VARIABLE_NAME` in Cloudflare Functions
- **Never put them in code files** — always set them in the dashboard
- Encrypted at rest and in transit

## Correct `.gitignore` Entries

```
# Environment variables (contains secrets — NEVER commit)
.env
.env.local
.env.*.local

# Supabase local development
supabase/.temp/
supabase/.branches/

# Node modules
node_modules/

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
*.log
npm-debug.log*

# Build output
dist/
build/

# Cloudflare
.wrangler/
```