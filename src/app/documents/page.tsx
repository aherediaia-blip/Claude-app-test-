'use client'

import { useState, useCallback, useRef } from 'react'
import { Document } from '@/types'

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'csv', 'docx', 'doc', 'xlsx', 'xls']
const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  txt: 'TXT',
  csv: 'CSV',
  docx: 'Word',
  doc: 'Word',
  xlsx: 'Excel',
  xls: 'Excel',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() || ''
}

function FileTypeTag({ name }: { name: string }) {
  const ext = getFileExt(name)
  const label = FILE_TYPE_LABELS[ext] || ext.toUpperCase()
  const colors: Record<string, string> = {
    PDF: '#ef4444',
    TXT: '#64748b',
    CSV: '#10b981',
    Word: '#3b82f6',
    Excel: '#22c55e',
  }
  const color = colors[label] || '#94a3b8'
  return (
    <span
      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
      className="text-xs font-medium px-2 py-0.5 rounded"
    >
      {label}
    </span>
  )
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar documentos')
      setDocuments(data.documents || [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }, [])

  // Cargar documentos al montar
  useState(() => { fetchDocuments() })

  const uploadFile = async (file: File) => {
    const ext = getFileExt(file.name)
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Tipo de archivo no permitido: .${ext}. Formatos: PDF, TXT, CSV, DOCX, XLSX`)
      return
    }
    setUploading(true)
    setError(null)
    setSuccess(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/documents', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir archivo')
      setSuccess(`"${file.name}" subido correctamente`)
      await fetchDocuments()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    uploadFile(files[0])
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ color: '#e2e8f0' }} className="text-2xl font-bold mb-1.5">Documentos</h1>
        <p style={{ color: '#94a3b8' }} className="text-sm">
          Sube y gestiona tus documentos. El texto se extrae automáticamente para análisis con IA.
        </p>
      </div>

      {/* Upload area */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          backgroundColor: dragging ? '#3b82f610' : '#1e2130',
          border: `2px dashed ${dragging ? '#3b82f6' : '#2a2d3e'}`,
          cursor: uploading ? 'wait' : 'pointer',
        }}
        className="rounded-xl p-10 flex flex-col items-center justify-center gap-3 mb-6 transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.csv,.docx,.doc,.xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        {uploading ? (
          <>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span style={{ color: '#94a3b8' }} className="text-sm">Subiendo y procesando...</span>
          </>
        ) : (
          <>
            <div
              style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}
              className="w-12 h-12 rounded-full flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-center">
              <p style={{ color: '#e2e8f0' }} className="text-sm font-medium">
                Arrastra un archivo aquí o haz clic para seleccionar
              </p>
              <p style={{ color: '#64748b' }} className="text-xs mt-1">
                PDF, DOCX, XLSX, TXT, CSV · Máx. 20 MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Mensajes */}
      {error && (
        <div
          style={{ backgroundColor: '#ef444415', border: '1px solid #ef444440', color: '#ef4444' }}
          className="rounded-lg px-4 py-3 text-sm mb-4 flex items-center gap-2"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div
          style={{ backgroundColor: '#10b98115', border: '1px solid #10b98140', color: '#10b981' }}
          className="rounded-lg px-4 py-3 text-sm mb-4 flex items-center gap-2"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {/* Lista de documentos */}
      <div style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }} className="rounded-xl overflow-hidden">
        <div
          style={{ borderBottom: '1px solid #2a2d3e' }}
          className="px-6 py-4 flex items-center justify-between"
        >
          <h2 style={{ color: '#e2e8f0' }} className="font-semibold text-sm">
            Documentos subidos
            {documents.length > 0 && (
              <span
                style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}
                className="ml-2 text-xs px-2 py-0.5 rounded-full"
              >
                {documents.length}
              </span>
            )}
          </h2>
          <button
            onClick={fetchDocuments}
            disabled={loading}
            style={{ color: '#64748b' }}
            className="text-xs hover:text-white transition-colors flex items-center gap-1"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {loading && !loaded ? (
          <div className="px-6 py-12 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-10 h-10 mx-auto mb-3" style={{ color: '#2a2d3e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p style={{ color: '#64748b' }} className="text-sm">No hay documentos todavía</p>
            <p style={{ color: '#2a2d3e' }} className="text-xs mt-1">Sube tu primer documento usando el área de arriba</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2a2d3e' }}>
            {documents.map((doc) => (
              <div key={doc.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div
                  style={{ backgroundColor: '#2a2d3e', color: '#94a3b8' }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ color: '#e2e8f0' }} className="text-sm font-medium truncate">{doc.name}</span>
                    <FileTypeTag name={doc.name} />
                    {doc.extracted_text && (
                      <span
                        style={{ backgroundColor: '#10b98115', color: '#10b981', border: '1px solid #10b98130' }}
                        className="text-xs px-1.5 py-0.5 rounded"
                      >
                        Texto extraído
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span style={{ color: '#64748b' }} className="text-xs">{formatBytes(doc.size)}</span>
                    <span style={{ color: '#2a2d3e' }} className="text-xs">·</span>
                    <span style={{ color: '#64748b' }} className="text-xs">
                      {new Date(doc.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nota sobre bucket */}
      <div
        style={{ backgroundColor: '#f59e0b10', border: '1px solid #f59e0b30' }}
        className="rounded-lg p-4 mt-5"
      >
        <p style={{ color: '#f59e0b' }} className="text-xs font-medium mb-1">Configuración requerida en Supabase</p>
        <p style={{ color: '#94a3b8' }} className="text-xs">
          Crea un bucket llamado <code style={{ color: '#f59e0b' }}>documents</code> en Supabase Storage (Storage → New Bucket → nombre: documents).
          Ver <code>supabase/schema.sql</code> para crear las tablas necesarias.
        </p>
      </div>
    </div>
  )
}
