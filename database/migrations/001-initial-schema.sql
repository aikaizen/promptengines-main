-- ============================================================
-- Prompt Engines Lab: Token-Based Team Join System
-- Initial Schema Migration
--
-- Target: Supabase Postgres (or any PostgreSQL 14+)
-- Date:   2026-03-09
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────
-- ENUM TYPES
-- ────────────────────────────────────────────

CREATE TYPE token_type    AS ENUM ('single_use', 'permanent');
CREATE TYPE token_scope   AS ENUM ('article_only', 'full_member');
CREATE TYPE token_status  AS ENUM ('active', 'used', 'revoked', 'expired');
CREATE TYPE auth_provider AS ENUM ('email', 'github', 'google');
CREATE TYPE user_role     AS ENUM ('member', 'admin');
CREATE TYPE user_type     AS ENUM ('human', 'agent');
CREATE TYPE availability  AS ENUM ('open', 'busy', 'unavailable');
CREATE TYPE article_status AS ENUM ('draft', 'pending', 'in_review', 'approved', 'rejected', 'published');
CREATE TYPE article_category AS ENUM ('experiments', 'evaluation', 'infrastructure', 'lab_notes', 'agents', 'security', 'architecture', 'other');

-- ────────────────────────────────────────────
-- TOKENS
-- ────────────────────────────────────────────

CREATE TABLE tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    value       TEXT NOT NULL UNIQUE,              -- hashed token value
    type        token_type NOT NULL DEFAULT 'single_use',
    scope       token_scope NOT NULL DEFAULT 'full_member',
    created_by  UUID,                              -- admin user id (nullable for seed tokens)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ,                       -- null = no expiration
    used_by     UUID,                              -- references users.id after use
    used_at     TIMESTAMPTZ,
    status      token_status NOT NULL DEFAULT 'active'
);

CREATE INDEX idx_tokens_status ON tokens (status);
CREATE INDEX idx_tokens_value  ON tokens (value);

-- ────────────────────────────────────────────
-- USERS
-- ────────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT NOT NULL UNIQUE,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    auth_provider   auth_provider NOT NULL DEFAULT 'email',
    role            user_role NOT NULL DEFAULT 'member',
    type            user_type NOT NULL DEFAULT 'human',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login      TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_type  ON users (type);

-- ────────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────────

CREATE TABLE profiles (
    user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username                TEXT NOT NULL UNIQUE,
    display_name            TEXT NOT NULL,
    bio                     TEXT,                   -- markdown, max ~500 chars enforced at app layer
    avatar_url              TEXT,
    links                   JSONB DEFAULT '{}'::JSONB,  -- {website, github, twitter, linkedin}
    location                TEXT,
    availability            availability NOT NULL DEFAULT 'open',
    is_agent                BOOLEAN NOT NULL DEFAULT FALSE,
    human_contact_name      TEXT,                   -- required if is_agent = true
    human_contact_email     TEXT,                   -- required if is_agent = true
    human_contact_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_profiles_username ON profiles (username);

-- Ensure agent profiles have human contact info
ALTER TABLE profiles ADD CONSTRAINT chk_agent_contact
    CHECK (
        is_agent = FALSE
        OR (human_contact_name IS NOT NULL AND human_contact_email IS NOT NULL)
    );

-- ────────────────────────────────────────────
-- ARTICLES
-- ────────────────────────────────────────────

CREATE TABLE articles (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title             TEXT NOT NULL,
    slug              TEXT NOT NULL UNIQUE,
    category          article_category NOT NULL DEFAULT 'other',
    tags              TEXT[] DEFAULT '{}',
    content           TEXT NOT NULL,                -- markdown
    excerpt           TEXT,                         -- auto-generated or manual
    featured_image    TEXT,
    status            article_status NOT NULL DEFAULT 'draft',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at      TIMESTAMPTZ,
    published_at      TIMESTAMPTZ,
    admin_notes       TEXT,                         -- internal reviewer notes
    rejection_reason  TEXT
);

CREATE INDEX idx_articles_author ON articles (author_id);
CREATE INDEX idx_articles_status ON articles (status);
CREATE INDEX idx_articles_slug   ON articles (slug);
CREATE INDEX idx_articles_published ON articles (published_at DESC) WHERE status = 'published';

-- ────────────────────────────────────────────
-- FOREIGN KEYS (tokens -> users)
-- ────────────────────────────────────────────

ALTER TABLE tokens ADD CONSTRAINT fk_tokens_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE tokens ADD CONSTRAINT fk_tokens_used_by
    FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────
-- ROW LEVEL SECURITY (Supabase)
-- ────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens   ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY profiles_read  ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_write ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Articles: public read for published, owner read/write for own
CREATE POLICY articles_read_published ON articles FOR SELECT USING (status = 'published');
CREATE POLICY articles_read_own       ON articles FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY articles_write_own      ON articles FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY articles_insert_own     ON articles FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Tokens: admin only
CREATE POLICY tokens_admin ON tokens FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
