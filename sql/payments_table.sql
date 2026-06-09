-- ============================================
-- SPICE & EMBER - PAYMENTS TABLE
-- ============================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rbwrvrwuxndzcstzurdk/sql/new

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on payment_id to prevent duplicate entries
-- (handled by UNIQUE above, but explicit for clarity)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);

-- Index for looking up payments by order_id
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Index for looking up payments by user_id
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- RLS: only secret key can access (Edge Functions use secret key)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- No public/anonymous access to payments
-- Edge Functions use the secret key which bypasses RLS