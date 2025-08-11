CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  document VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id UUID NOT NULL REFERENCES users(id),
  balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'COP',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES accounts(id),
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  type VARCHAR(10) NOT NULL CHECK (type IN ('deposit', 'withdraw')),
  timestamp TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id UUID NOT NULL,
  account_id UUID NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  rule VARCHAR(100) NOT NULL,
  detail JSONB
);

CREATE INDEX IF NOT EXISTS transactions_user_id_timestamp_idx ON transactions (user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS fraud_alerts_user_id_triggered_at_idx ON fraud_alerts (user_id, triggered_at DESC);
