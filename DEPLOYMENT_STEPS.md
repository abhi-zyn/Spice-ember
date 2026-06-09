# 🔥 Spice & Ember — Razorpay Payment Integration: Deployment Steps

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

## Step 1: Create the Payments Table

1. Go to **Supabase SQL Editor**: https://supabase.com/dashboard/project/rbwrvrwuxndzcstzurdk/sql/new
2. Copy and paste the entire contents of `sql/payments_table.sql`
3. Click **Run**

---

## Step 2: Set Edge Function Secrets

Go to **Supabase Dashboard → Settings → Edge Functions → Secrets** and add these:

| Secret Name | Where to Get It |
|-------------|-----------------|
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys → Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys → Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → Webhooks → Secret (after creating webhook in Step 5) |
| `SUPABASE_URL` | `https://rbwrvrwuxndzcstzurdk.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase Dashboard → Settings → API → `secret` key |

> ⚠️ **IMPORTANT**: These secrets are stored ONLY in Supabase's secure vault. They are NEVER stored in any file pushed to GitHub.

---

## Step 3: Deploy Each Edge Function

For each function below, go to **Supabase Dashboard → Edge Functions → New Function**:

### 3a. Deploy `create-order`
- **Name**: `create-order`
- **Entry point**: Paste the entire contents of `supabase/functions/create-order/index.ts`
- Click **Deploy**

### 3b. Deploy `verify-payment`
- **Name**: `verify-payment`
- **Entry point**: Paste the entire contents of `supabase/functions/verify-payment/index.ts`
- Click **Deploy**

### 3c. Deploy `razorpay-webhook`
- **Name**: `razorpay-webhook`
- **Entry point**: Paste the entire contents of `supabase/functions/razorpay-webhook/index.ts`
- Click **Deploy**

---

## Step 4: Update Frontend Config

In `js/config.js`, replace the placeholder with your actual Razorpay Key ID:

```js
razorpayKeyId: 'rzp_live_YOUR_RAZORPAY_KEY_ID',  // ← replace this
```

Change it to your real key (e.g., `rzp_live_abc123def456`).

> ✅ The Razorpay Key ID is **safe to be in frontend code**. It is a public identifier, not a secret.

---

## Step 5: Set Up Razorpay Webhook

1. Go to **Razorpay Dashboard → Settings → Webhooks**
2. Click **Add New Webhook**
3. Set:
   - **Webhook URL**: `https://rbwrvrwuxndzcstzurdk.supabase.co/functions/v1/razorpay-webhook`
   - **Secret**: Generate one (or use your own)
   - **Events**: Select `payment.captured`
4. Click **Create**
5. Copy the **Webhook Secret** and add it as `RAZORPAY_WEBHOOK_SECRET` in Supabase Edge Function secrets (Step 2)

---

## Step 6: Create `.env.local` for Local Reference

```bash
cp .env.example .env.local
```

Then edit `.env.local` and fill in your real values. This file is gitignored and will never be pushed.

---

## Step 7: Test Everything

### 7a. Test `create-order` with curl
```bash
curl -X POST \
  https://rbwrvrwuxndzcstzurdk.supabase.co/functions/v1/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "user_id": "test-user-123"}'
```
Expected: `{"order_id":"order_xxx","amount":50000,"currency":"INR"}`

### 7b. Test `verify-payment` with curl (invalid signature)
```bash
curl -X POST \
  https://rbwrvrwuxndzcstzurdk.supabase.co/functions/v1/verify-payment \
  -H "Content-Type: application/json" \
  -d '{"razorpay_payment_id":"pay_test","razorpay_order_id":"order_test","razorpay_signature":"bad_signature"}'
```
Expected: `{"error":"Invalid payment signature"}` (400)

### 7c. Test `razorpay-webhook` with curl
```bash
curl -X POST \
  https://rbwrvrwuxndzcstzurdk.supabase.co/functions/v1/razorpay-webhook \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: test" \
  -d '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test","order_id":"order_test","amount":50000,"status":"captured"}}}}'
```
Expected: `{"status":"error","message":"Invalid webhook signature"}` (200 — always returns 200 to Razorpay)

### 7d. Browser Test
1. Open `order.html` in your browser
2. Add items to cart
3. Click **Proceed to Checkout**
4. Fill in delivery details
5. Click **💳 Pay with Razorpay**
6. Complete the payment on Razorpay's test/sandbox mode
7. Verify success message appears
8. Check Supabase `payments` table for the new record

---

## 🔐 Secrets & GitHub Safety

### What's Safe vs. What's Secret

| Value | Safe in Code? | Where It Lives |
|-------|:---:|----------------|
| `RAZORPAY_KEY_ID` (rzp_live_xxx) | ✅ Yes | `js/config.js` |
| `RAZORPAY_KEY_SECRET` | ❌ NO | Supabase Edge Function secrets only |
| `RAZORPAY_WEBHOOK_SECRET` | ❌ NO | Supabase Edge Function secrets only |
| `SUPABASE_URL` | ✅ Yes | `js/config.js` |
| `SUPABASE_ANON_KEY` (sb_publishable_xxx) | ✅ Yes | `js/config.js` |
| `SUPABASE_SECRET_KEY` | ❌ NO | Supabase Edge Function secrets only |

### `.gitignore` Entries

The following are gitignored and will never be pushed:
- `.env`, `.env.local`, `.env.*.local`
- `supabase/.temp/`, `supabase/.branches/`
- `node_modules/`
- `.DS_Store`, `Thumbs.db`
- `.vscode/`, `.idea/`
- `*.log`
- `dist/`, `build/`
- `.wrangler/`

### How Supabase Edge Function Secrets Work

- Secrets are set in the Supabase Dashboard under **Settings → Edge Functions**
- They are injected as environment variables at runtime via `Deno.env.get("SECRET_NAME")`
- They are **never stored in any file** in your repository
- They are encrypted at rest in Supabase's infrastructure
- Even if someone gains access to your GitHub repo, they cannot see these secrets

### How to Check If You Accidentally Pushed Secrets

```bash
# Search git history for sensitive patterns
git log --all --full-history -p -- js/config.js | grep -E "secret|key|password"

# Or search all files ever committed
git rev-list --all | xargs git grep -E "sk_live|rzp_live.*secret|SUPABASE_SECRET" || echo "No secrets found"
```

### How to Remove Secrets from Git History (if found)

**Option A: Using `git filter-branch`**
```bash
# Remove a specific file from all history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch js/config.js" \
  --prune-empty --tag-name-filter cat -- --all

# Then force push
git push origin --force --all
git push origin --force --tags
```

**Option B: Using BFG Repo Cleaner (recommended for large repos)**
```bash
# Install BFG
brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove a file from history
bfg --delete-files config.js

# Or replace text across all files
bfg --replace-text passwords.txt

# Then clean up and push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

> ⚠️ After removing secrets from history, **rotate all exposed keys immediately** — assume they are compromised.

---

## Environment Variables Summary

### Supabase Edge Function Secrets (set in Supabase Dashboard)

| Variable | Used By | Purpose |
|----------|---------|---------|
| `RAZORPAY_KEY_ID` | `create-order` | Authenticate with Razorpay API |
| `RAZORPAY_KEY_SECRET` | `create-order`, `verify-payment` | Authenticate + verify signatures |
| `RAZORPAY_WEBHOOK_SECRET` | `razorpay-webhook` | Verify incoming webhook authenticity |
| `SUPABASE_URL` | `verify-payment`, `razorpay-webhook` | Connect to Supabase DB |
| `SUPABASE_SECRET_KEY` | `verify-payment`, `razorpay-webhook` | Insert into DB (bypasses RLS) |

### Frontend Config (in `js/config.js` — safe to commit)

| Variable | Purpose |
|----------|---------|
| `razorpayKeyId` | Razorpay Key ID for checkout SDK |
| `supabaseFunctionUrl` | Base URL for calling Edge Functions |
| `supabaseUrl` | Supabase project URL |
| `supabaseAnonKey` | Supabase anon key (public, restricted by RLS) |

---

## ⚠️ Final Reminders

1. **NEVER** put `RAZORPAY_KEY_SECRET`, `SUPABASE_SECRET_KEY`, `RAZORPAY_WEBHOOK_SECRET`, or `SUPABASE_JWT_SECRET` in any HTML, JS, or config file
2. Always use **test keys** (`rzp_test_`) during development and switch to **live keys** (`rzp_live_`) only in production
3. The `.env.example` file IS safe to push — it only contains placeholder values
4. The `.env.local` file is gitignored — use it for local reference only
5. Edge Function secrets are managed entirely in the Supabase Dashboard — no file ever contains them