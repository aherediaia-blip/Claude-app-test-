'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Document } from '@/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|u|l|p])(.+)$/gm, (m) => m ? `<p>${m}</p>` : '')
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocId, setSelectedDocId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch { /* silencioso */ }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setError(null)
    setLoading(true)

    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          documentId: selectedDocId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en la respuesta')
      setMessages([...updatedMessages, { role: 'assistant', content: data.content }])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  const selectedDoc = documents.find(d => d.id === selectedDocId)

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#0f1117' }}>

      {/* Header */}
      <div
        style={{ backgroundColor: '#1a1d27', borderBottom: '1px solid #2a2d3e' }}
        className="px-6 py-4 flex items-center justify-between flex-shrink-0"
      >
        <div>
          <h1 style={{ color: '#e2e8f0' }} className="font-bold text-base">Chat IA Industrial</h1>
          <p style={{ color: '#64748b' }} className="text-xs mt-0.5">Analista experto en fabricación, finanzas e industria</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Selector de documento */}
          <div className="relative">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              style={{
                backgroundColor: '#1e2130',
                border: '1px solid #2a2d3e',
                color: selectedDocId ? '#e2e8f0' : '#64748b',
              }}
              className="text-xs rounded-lg pl-8 pr-3 py-2 appearance-none cursor-pointer"
            >
              <option value="">Sin documento</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name.length > 30 ? doc.name.slice(0, 30) + '…' : doc.name}
                </option>
              ))}
            </select>
            <svg
              className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: selectedDocId ? '#3b82f6' : '#64748b' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{ color: '#64748b', border: '1px solid #2a2d3e', backgroundColor: '#1e2130' }}
              className="text-xs px-3 py-1.5 rounded-lg hover:text-white transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Contexto de documento activo */}
      {selectedDoc && (
        <div
          style={{ backgroundColor: '#3b82f610', borderBottom: '1px solid #3b82f630' }}
          className="px-6 py-2 flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ color: '#94a3b8' }} className="text-xs">
            Analizando: <span style={{ color: '#e2e8f0' }} className="font-medium">{selectedDoc.name}</span>
            {!selectedDoc.extracted_text && (
              <span style={{ color: '#f59e0b' }}> · El texto de este documento no fue extraído</span>
            )}
          </span>
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div
              style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 style={{ color: '#e2e8f0' }} className="font-semibold text-base mb-2">Analista IA listo</h2>
            <p style={{ color: '#64748b' }} className="text-sm max-w-sm leading-relaxed">
              Pregunta sobre procesos industriales, finanzas, costes o cualquier aspecto de tu empresa.
              Selecciona un documento para análisis contextual.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-lg w-full">
              {[
                '¿Cuáles son los KPIs clave para una pyme industrial?',
                'Explícame cómo calcular el coste de producción por unidad',
                'Analiza los riesgos financieros más comunes en fabricación',
                '¿Qué indicadores usar para auditar el stock de almacén?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); textareaRef.current?.focus() }}
                  style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e', color: '#94a3b8' }}
                  className="text-left text-xs px-3 py-2.5 rounded-lg hover:border-blue-500/40 hover:text-white transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div
                style={{ backgroundColor: '#3b82f620', color: '#3b82f6', flexShrink: 0 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
            )}
            <div
              style={{
                backgroundColor: msg.role === 'user' ? '#3b82f6' : '#1e2130',
                color: msg.role === 'user' ? '#fff' : '#e2e8f0',
                maxWidth: '75%',
              }}
              className="rounded-xl px-4 py-3 text-sm"
            >
              {msg.role === 'assistant' ? (
                <div
                  className="prose-ai"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                />
              ) : (
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div
                style={{ backgroundColor: '#2a2d3e', color: '#94a3b8', flexShrink: 0 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div
              style={{ backgroundColor: '#3b82f620', color: '#3b82f6', flexShrink: 0 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <div
              style={{ backgroundColor: '#1e2130' }}
              className="rounded-xl px-4 py-3"
            >
              <div className="flex gap-1.5 items-center h-5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                    style={{ backgroundColor: '#3b82f6', animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{ backgroundColor: '#ef444415', border: '1px solid #ef444440', color: '#ef4444' }}
            className="rounded-lg px-4 py-3 text-xs"
          >
            Error: {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{ backgroundColor: '#1a1d27', borderTop: '1px solid #2a2d3e' }}
        className="px-6 py-4 flex-shrink-0"
      >
        <div
          style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }}
          className="rounded-xl flex items-end gap-3 px-4 py-3"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu consulta industrial... (Enter para enviar, Shift+Enter para nueva línea)"
            disabled={loading}
            rows={1}
            style={{
              backgroundColor: 'transparent',
              color: '#e2e8f0',
              resize: 'none',
              outline: 'none',
              caretColor: '#3b82f6',
            }}
            className="flex-1 text-sm placeholder-gray-600 min-h-[24px] max-h-40"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              backgroundColor: loading || !input.trim() ? '#2a2d3e' : '#3b82f6',
              color: loading || !input.trim() ? '#64748b' : '#fff',
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        <p style={{ color: '#2a2d3e' }} className="text-xs mt-2 text-center">
          FactoryBrain AI · Responde en español de España · No compartir datos confidenciales de terceros
        </p>
      </div>
    </div>
  )
}
