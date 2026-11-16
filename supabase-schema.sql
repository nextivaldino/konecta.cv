-- ============================================================
-- Konecta.cv - Supabase Database Schema
-- Executa este SQL no editor SQL do Supabase
-- ============================================================

-- Tabela de visitantes (tracking automático)
CREATE TABLE IF NOT EXISTS public.visitors (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  ip_address      TEXT NOT NULL,
  country         TEXT DEFAULT 'Unknown',
  country_code    TEXT DEFAULT 'XX',
  city            TEXT DEFAULT 'Unknown',
  user_agent      TEXT,
  path            TEXT,
  is_bot          BOOLEAN DEFAULT false,
  is_intrusion_attempt BOOLEAN DEFAULT false,
  intrusion_type  TEXT
);

-- Tabela de registos (Konecta-se popup)
CREATE TABLE IF NOT EXISTS public.registrations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT DEFAULT '',
  island      TEXT DEFAULT '',
  email       TEXT DEFAULT '',
  has_account BOOLEAN DEFAULT false,
  ip_address  TEXT DEFAULT '',
  country     TEXT DEFAULT 'Unknown'
);

-- Adiciona colunas se já existir a tabela
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS has_account BOOLEAN DEFAULT false;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON public.visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON public.visitors(country);
CREATE INDEX IF NOT EXISTS idx_visitors_intrusion ON public.visitors(is_intrusion_attempt) WHERE is_intrusion_attempt = true;
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Política: apenas service_role pode ler/escrever (backend)
CREATE POLICY "service_role_all_visitors" ON public.visitors
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_registrations" ON public.registrations
  FOR ALL TO service_role USING (true) WITH CHECK (true);
