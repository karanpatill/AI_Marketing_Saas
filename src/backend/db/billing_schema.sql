-- ==========================================
-- BILLING, SUBSCRIPTIONS, & TOKENS SCHEMA
-- ==========================================

-- 1. PLANS TABLE
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'free', 'pay_per_export', 'pro', 'agency', 'automate_brand'
    price_monthly INTEGER NOT NULL DEFAULT 0, -- stored in cents
    price_yearly INTEGER NOT NULL DEFAULT 0,
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    token_allowance INTEGER NOT NULL DEFAULT 0,
    features JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Plans
INSERT INTO plans (name, type, price_monthly, price_yearly, token_allowance, features)
VALUES 
    ('Free', 'free', 0, 0, 10, '{"description": "Get started with free tokens"}'),
    ('Pro', 'pro', 49900, 499000, 50, '{"description": "For professionals and small teams"}'),
    ('Agency', 'agency', 199900, 1999000, 300, '{"description": "For large agencies and scaling brands"}'),
    ('Automate Your Brand', 'automate_brand', 499900, 4999000, 1000, '{"description": "End-to-end automation from planning to posting"}')
ON CONFLICT DO NOTHING;

-- 2. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'incomplete'
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id)
);

-- 3. ORG WALLETS (TOKENS)
CREATE TABLE IF NOT EXISTS org_wallets (
    org_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    free_tokens_granted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TOKEN TRANSACTIONS
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positive for addition, negative for deduction
    reason VARCHAR(255) NOT NULL, -- e.g., 'signup_bonus', 'subscription_grant', 'static_post_generation'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read plans
CREATE POLICY "Anyone can view plans" ON plans FOR SELECT USING (true);

-- Allow users to view their org's subscription
CREATE POLICY "Users can view their org subscriptions" ON subscriptions FOR SELECT USING (
    org_id IN (SELECT org_id FROM workspace_members WHERE user_id = auth.uid())
);

-- Allow users to view their org's wallet
CREATE POLICY "Users can view their org wallet" ON org_wallets FOR SELECT USING (
    org_id IN (SELECT org_id FROM workspace_members WHERE user_id = auth.uid())
);

-- Allow users to view their org's token transactions
CREATE POLICY "Users can view their org token transactions" ON token_transactions FOR SELECT USING (
    org_id IN (SELECT org_id FROM workspace_members WHERE user_id = auth.uid())
);
