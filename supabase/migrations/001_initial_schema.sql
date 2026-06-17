-- =============================================================
-- Ringo — Initial Database Schema
-- Migration: 001_initial_schema.sql
--
-- Table creation order:
--   1. Extensions
--   2. Helper functions
--   3. Tables (profiles → user_settings → campaigns → contacts
--              → call_logs → conversation_messages → script_templates)
--   4. Indexes
--   5. RLS enable + policies
--   6. Triggers
-- =============================================================


-- ===========================
-- EXTENSIONS
-- ===========================

-- gen_random_uuid() is built-in on PostgreSQL 13+ (all Supabase projects)
-- No additional extensions required


-- ===========================
-- HELPER FUNCTIONS
-- ===========================

-- Reusable trigger function: stamps updated_at = now() before every UPDATE.
-- Attached to every table that carries an updated_at column.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Invoked by the on_auth_user_created trigger (see Triggers section).
-- SECURITY DEFINER + empty search_path prevents search-path hijacking.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Increments campaigns.total_contacts on INSERT, decrements on DELETE.
CREATE OR REPLACE FUNCTION sync_campaign_total_contacts()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.campaigns
      SET total_contacts = total_contacts + 1
    WHERE id = NEW.campaign_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.campaigns
      SET total_contacts = GREATEST(total_contacts - 1, 0)
    WHERE id = OLD.campaign_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Increments campaigns.completed_calls when a contact's call_status
-- transitions out of pending/calling (i.e. the call has been resolved).
-- Decrements when a contact is reset back to pending/calling (retry).
CREATE OR REPLACE FUNCTION sync_campaign_completed_calls()
RETURNS TRIGGER AS $$
DECLARE
  v_was_active BOOLEAN;
  v_is_active  BOOLEAN;
BEGIN
  -- "active" = call not yet resolved; "terminal" = outcome recorded
  v_was_active := OLD.call_status IN ('pending', 'calling');
  v_is_active  := NEW.call_status IN ('pending', 'calling');

  IF v_was_active AND NOT v_is_active THEN
    -- Transitioned to terminal state → mark as completed
    UPDATE public.campaigns
      SET completed_calls = completed_calls + 1
    WHERE id = NEW.campaign_id;

  ELSIF NOT v_was_active AND v_is_active THEN
    -- Reset to active state (e.g. retry) → undo the completion count
    UPDATE public.campaigns
      SET completed_calls = GREATEST(completed_calls - 1, 0)
    WHERE id = NEW.campaign_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- ===========================
-- USER MODELS
-- ===========================

-- [profiles]
-- Purpose: Extends auth.users with display info and credit (points) balance.
--          One row is created automatically via on_auth_user_created trigger.
-- Source found in: src/routes/settings.index.tsx
--                  (supabase.auth.updateUser for full_name, points display)
CREATE TABLE public.profiles (
  -- Same PK as auth.users — strict 1-to-1 mapping; cascades on user deletion
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- User display name; can be updated from Settings page
  full_name       TEXT        NOT NULL DEFAULT '',
  -- URL to avatar image (optional; populated by OAuth providers)
  avatar_url      TEXT,
  -- Remaining call credits; deducted per call attempt by application logic
  points_balance  INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [user_settings]
-- Purpose: Per-user defaults for call configuration.
--          One row per user; created on first save from Settings → Call Defaults.
-- Source found in: src/routes/settings.call-defaults.tsx
--                  (TODO: persist to Supabase — marked in source)
CREATE TABLE public.user_settings (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Owner — enforced UNIQUE so there is exactly one settings row per user
  user_id                 UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Default voice ID sent to the Voice API (e.g. 'mali', 'samorn', 'somchai')
  voice_id                TEXT,
  -- Default playback speed multiplier (0.5–2.0); 1.0 = normal speed
  voice_speed             NUMERIC     NOT NULL DEFAULT 1.0,
  -- Default script body; used when creating a new campaign without a template
  default_script          TEXT,
  -- Maximum redial attempts before a contact is marked as failed
  max_retries             INT         NOT NULL DEFAULT 3,
  -- Minutes to wait between retry attempts
  retry_interval_minutes  INT         NOT NULL DEFAULT 30,
  -- Words / phrases that count as a positive (confirmed) response
  confirmation_keywords   TEXT[]      NOT NULL DEFAULT '{}',
  -- Words / phrases that count as a rejection response
  rejection_keywords      TEXT[]      NOT NULL DEFAULT '{}',
  -- User's own Voice API key (stored per user, encrypted at rest by Supabase Vault)
  api_key                 TEXT,
  -- Which voice provider to use (currently 'botnoi'; extensible via CHECK-free TEXT)
  api_provider            TEXT        NOT NULL DEFAULT 'botnoi',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===========================
-- CAMPAIGN MODELS
-- ===========================

-- [campaigns]
-- Purpose: A call campaign — defines the script, schedule, voice settings,
--          and tracks overall dialing progress through denormalized counters.
-- Source found in: src/lib/campaignStore.ts, src/routes/campaign.create.tsx,
--                  src/routes/campaign.$id.index.tsx, src/routes/campaign.$id.edit.tsx
CREATE TABLE public.campaigns (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Owner of this campaign; used for RLS
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Human-readable campaign title shown in the campaign list
  name             TEXT        NOT NULL,
  -- Optional longer description of the campaign purpose
  description      TEXT,
  -- Lifecycle state of the campaign
  status           TEXT        NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled')),
  -- Call script body; supports template variables e.g. {ชื่อ}, {ชื่องาน}, {วันที่}, {เวลา}
  script           TEXT,
  -- Voice ID for this campaign; overrides user_settings.voice_id if set
  voice_id         TEXT,
  -- Playback speed for this campaign; overrides user_settings.voice_speed if set
  voice_speed      NUMERIC     NOT NULL DEFAULT 1.0,
  -- Maximum redial attempts per contact for this campaign
  max_retries      INT         NOT NULL DEFAULT 3,
  -- When auto-dialing should begin (null = start manually)
  scheduled_start  TIMESTAMPTZ,
  -- When auto-dialing must stop regardless of remaining contacts (null = no cutoff)
  scheduled_end    TIMESTAMPTZ,
  -- Maintained by trigger: total contacts imported into this campaign
  total_contacts   INT         NOT NULL DEFAULT 0,
  -- Maintained by trigger: contacts that have left the pending/calling state
  completed_calls  INT         NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [contacts]
-- Purpose: Each person to be called within a campaign, with their current call
--          status and retry metadata. Imported in bulk via CSV.
-- Source found in: src/lib/campaignStore.ts, src/routes/campaign.$id.contacts.tsx,
--                  src/routes/campaign.create.tsx (CSV import)
CREATE TABLE public.contacts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The campaign this contact belongs to
  campaign_id     UUID        NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  -- Contact's full name (first column of imported CSV)
  full_name       TEXT        NOT NULL,
  -- Phone number to dial; no format enforced — flexible for Thai number formats
  phone           TEXT        NOT NULL,
  -- Current call outcome for this contact
  call_status     TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (call_status IN ('pending', 'calling', 'confirmed', 'rejected', 'no_answer', 'failed')),
  -- Number of times this contact has been retried (incremented by application logic)
  retry_count     INT         NOT NULL DEFAULT 0,
  -- Timestamp of the most recent call attempt
  last_called_at  TIMESTAMPTZ,
  -- Additional CSV columns that do not map to known fields
  -- (e.g. event name, seat number, table assignment stored as {"event": "งานแต่ง"})
  extra_data      JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===========================
-- CALL MODELS
-- ===========================

-- [call_logs]
-- Purpose: One record per call attempt. A contact with retries will have multiple
--          rows here. Stores the Voice API's call ID and the final outcome.
-- Source found in: src/services/botnoiService.ts (BotnoiCallResult interface),
--                  src/hooks/useCampaignRunner.ts (results[] state)
CREATE TABLE public.call_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The specific contact this call was placed to
  contact_id       UUID        NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  -- Denormalized: avoids joining contacts for campaign-level analytics queries
  campaign_id      UUID        NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  -- External call identifier returned by the Voice API (e.g. Botnoi call_id)
  call_id          TEXT,
  -- Outcome of this individual call attempt
  status           TEXT        NOT NULL DEFAULT 'initiated'
                   CHECK (status IN ('initiated', 'ringing', 'answered', 'confirmed', 'rejected', 'no_answer', 'failed')),
  -- Duration of the answered call in seconds (null if call was not answered)
  duration_seconds INT,
  -- URL to the call recording file provided by the Voice API
  recording_url    TEXT,
  -- When the call was initiated by the system
  started_at       TIMESTAMPTZ,
  -- When the call ended or timed out
  ended_at         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [conversation_messages]
-- Purpose: Individual transcript turns for a single call.
--          Alternates between 'ai' (voice bot) and 'user' (the contact) roles.
-- Source found in: src/routes/campaign.$id.contacts.$contactId.tsx
--                  (ChatMessage interface; currently rendered from mock data)
CREATE TABLE public.conversation_messages (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The call this transcript turn belongs to
  call_log_id       UUID        NOT NULL REFERENCES public.call_logs(id) ON DELETE CASCADE,
  -- Speaker: 'ai' = voice bot, 'user' = the contacted person
  role              TEXT        NOT NULL CHECK (role IN ('ai', 'user')),
  -- Transcribed text of what was said in this turn
  message           TEXT        NOT NULL,
  -- Offset in seconds from the start of the call recording (for audio sync)
  timestamp_seconds FLOAT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===========================
-- CONTENT MODELS
-- ===========================

-- [script_templates]
-- Purpose: Reusable saved scripts visible in the Script Library dropdown.
--          Pre-seeded with wedding, meeting, and training templates.
-- Source found in: src/routes/campaign.create.tsx (template selector),
--                  src/routes/settings.call-defaults.tsx (script library)
CREATE TABLE public.script_templates (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Owner; users can only see and manage their own templates
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Display name shown in the Script Library dropdown
  name        TEXT        NOT NULL,
  -- Script body; supports template variables like {ชื่อ}, {ชื่องาน}, {วันที่}, {เวลา}
  script      TEXT        NOT NULL,
  -- Suggested voice ID when applying this template to a campaign
  voice_id    TEXT,
  -- Suggested playback speed when applying this template
  voice_speed NUMERIC     NOT NULL DEFAULT 1.0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===========================
-- INDEXES
-- ===========================

-- Foreign key indexes (prevent sequential scans on JOIN / cascade operations)
CREATE INDEX idx_contacts_campaign_id              ON public.contacts (campaign_id);
CREATE INDEX idx_call_logs_contact_id              ON public.call_logs (contact_id);
CREATE INDEX idx_call_logs_campaign_id             ON public.call_logs (campaign_id);
CREATE INDEX idx_conversation_messages_call_log_id ON public.conversation_messages (call_log_id);
CREATE INDEX idx_user_settings_user_id             ON public.user_settings (user_id);
CREATE INDEX idx_script_templates_user_id          ON public.script_templates (user_id);

-- Status indexes on large frequently-filtered tables
CREATE INDEX idx_campaigns_status                  ON public.campaigns (status);
CREATE INDEX idx_contacts_call_status              ON public.contacts (call_status);
CREATE INDEX idx_call_logs_status                  ON public.call_logs (status);

-- created_at indexes for time-range analytics queries
CREATE INDEX idx_call_logs_created_at              ON public.call_logs (created_at);
CREATE INDEX idx_conversation_messages_created_at  ON public.conversation_messages (created_at);


-- ===========================
-- ROW LEVEL SECURITY
-- ===========================

ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_templates       ENABLE ROW LEVEL SECURITY;

-- profiles: each user reads and updates only their own row
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- user_settings: full CRUD on own row only
CREATE POLICY "user_settings_all_own" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- campaigns: full CRUD on own campaigns only
CREATE POLICY "campaigns_all_own" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id);

-- contacts: access granted by traversing up to the parent campaign's user_id
CREATE POLICY "contacts_all_own" ON public.contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id    = contacts.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- call_logs: access via denormalized campaign_id (avoids double join)
CREATE POLICY "call_logs_all_own" ON public.call_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id    = call_logs.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- conversation_messages: traverse call_logs → campaigns to verify ownership
CREATE POLICY "conversation_messages_all_own" ON public.conversation_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.call_logs
        JOIN public.campaigns ON campaigns.id = call_logs.campaign_id
      WHERE call_logs.id      = conversation_messages.call_log_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- script_templates: full CRUD on own templates only
CREATE POLICY "script_templates_all_own" ON public.script_templates
  FOR ALL USING (auth.uid() = user_id);


-- ===========================
-- TRIGGERS
-- ===========================

-- updated_at stamps — attached to every table that carries updated_at

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_call_logs_updated_at
  BEFORE UPDATE ON public.call_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_conversation_messages_updated_at
  BEFORE UPDATE ON public.conversation_messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_script_templates_updated_at
  BEFORE UPDATE ON public.script_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Keeps campaigns.total_contacts in sync when contacts are added or removed
CREATE TRIGGER trg_contacts_sync_total
  AFTER INSERT OR DELETE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION sync_campaign_total_contacts();

-- Keeps campaigns.completed_calls in sync on every call_status change
CREATE TRIGGER trg_contacts_sync_completed
  AFTER UPDATE OF call_status ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION sync_campaign_completed_calls();

-- Auto-provisions a profiles row for every new Supabase Auth registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
