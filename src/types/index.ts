export interface Document {
  id: string
  user_id: string
  name: string
  file_path: string
  file_type: string
  size: number
  extracted_text: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  document_id: string | null
  created_at: string
}

export interface Report {
  id: string
  user_id: string
  title: string
  report_type: 'financiero' | 'tecnico' | 'auditoria' | 'produccion'
  content: string
  document_id: string | null
  created_at: string
}

export type ReportType = 'financiero' | 'tecnico' | 'auditoria' | 'produccion'

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
  documentId?: string
  systemContext?: string
}

export interface ChatResponse {
  content: string
  error?: string
}
