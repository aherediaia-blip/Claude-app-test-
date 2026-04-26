-- FactoryBrain AI - Schema SQL con Auth y RLS
-- Ejecutar en Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: documents
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  file_path    TEXT NOT NULL,
  file_type    TEXT NOT NULL,
  size         INTEGER NOT NULL DEFAULT 0,
  extracted_text TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: chat_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('financiero', 'tecnico', 'auditoria', 'produccion')),
  content     TEXT NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_documents_user_id    ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id   ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_id      ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at   ON reports(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE documents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports      ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo ve y modifica sus propios registros

CREATE POLICY "documents: select own"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "documents: insert own"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents: update own"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "documents: delete own"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "chat_messages: select own"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_messages: insert own"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_messages: delete own"
  ON chat_messages FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "reports: select own"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reports: insert own"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reports: delete own"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE: bucket "documents" con políticas RLS
-- ============================================================
-- 1. Ir a Supabase > Storage > New Bucket
--    Nombre: documents  |  Public: NO
--
-- 2. Ejecutar estas políticas de storage:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  20971520, -- 20 MB
  ARRAY['application/pdf','text/plain','text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel']
)
ON CONFLICT (id) DO NOTHING;

-- Política: cada usuario gestiona solo su carpeta (user_id/)
CREATE POLICY "storage: upload own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage: read own folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage: delete own folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
