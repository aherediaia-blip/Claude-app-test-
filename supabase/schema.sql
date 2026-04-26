-- FactoryBrain AI - Schema SQL
-- Ejecutar en Supabase SQL Editor

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: documents
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: chat_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('financiero', 'tecnico', 'auditoria', 'produccion')),
  content TEXT NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_document_id ON chat_messages(document_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);

-- ============================================================
-- POLÍTICAS RLS (Row Level Security)
-- NOTA MVP: desactivadas para simplificar. Activar en producción.
-- ============================================================

-- Para activar RLS en producción, descomentar:
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para acceso anónimo en MVP:
-- CREATE POLICY "Allow all on documents" ON documents FOR ALL USING (true);
-- CREATE POLICY "Allow all on chat_messages" ON chat_messages FOR ALL USING (true);
-- CREATE POLICY "Allow all on reports" ON reports FOR ALL USING (true);

-- ============================================================
-- BUCKET de Storage: documents
-- ============================================================
-- Ejecutar también en Supabase > Storage > New Bucket:
-- Nombre: documents
-- Public: false (privado, acceder via service role)
--
-- O via SQL (si la extensión está disponible):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', false)
-- ON CONFLICT DO NOTHING;
