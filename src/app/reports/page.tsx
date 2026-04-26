'use client'

import { useState, useEffect, useCallback } from 'react'
import { Document, ReportType } from '@/types'

const REPORT_TYPES: { value: ReportType; label: string; desc: string; color: string; icon: React.ReactNode }[] = [
  {
    value: 'financiero',
    label: 'Informe Financiero',
    desc: 'Análisis de ingresos, gastos, márgenes y KPIs financieros.',
    color: '#10b981',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: 'tecnico',
    label: 'Informe Técnico',
    desc: 'Especificaciones, procesos, parámetros y recomendaciones técnicas.',
    color: '#3b82f6',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    value: 'auditoria',
    label: 'Informe de Auditoría',
    desc: 'Hallazgos, no conformidades, riesgos y plan de acción correctivo.',
    color: '#ef4444',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    value: 'produccion',
    label: 'Informe de Producción',
    desc: 'Capacidad, eficiencia, cuellos de botella y mejoras operativas.',
    color: '#f59e0b',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
]

function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
}

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocId, setSelectedDocId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ content: string; title: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch { /* silencioso */ }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const generateReport = async () => {
    if (!selectedType) return
    setGenerating(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: selectedType,
          documentId: selectedDocId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al generar informe')
      setResult({ content: data.content, title: data.title })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (result) navigator.clipboard.writeText(result.content)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 style={{ color: '#e2e8f0' }} className="text-2xl font-bold mb-1.5">Informes</h1>
        <p style={{ color: '#94a3b8' }} className="text-sm">
          Genera informes profesionales con IA. Selecciona un tipo y opcionalmente un documento base.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de configuración */}
        <div className="lg:col-span-1 space-y-5">

          {/* Tipo de informe */}
          <div
            style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }}
            className="rounded-xl p-5"
          >
            <h2 style={{ color: '#e2e8f0' }} className="font-semibold text-sm mb-4">
              Tipo de informe
            </h2>
            <div className="space-y-2">
              {REPORT_TYPES.map((type) => {
                const selected = selectedType === type.value
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    style={{
                      backgroundColor: selected ? `${type.color}15` : '#141622',
                      border: `1px solid ${selected ? type.color + '50' : '#2a2d3e'}`,
                      color: selected ? type.color : '#94a3b8',
                      width: '100%',
                    }}
                    className="rounded-lg px-3 py-3 text-left flex items-start gap-3 transition-all hover:border-opacity-60"
                  >
                    <span className="flex-shrink-0 mt-0.5">{type.icon}</span>
                    <div>
                      <div className="text-xs font-semibold mb-0.5">{type.label}</div>
                      <div style={{ color: selected ? `${type.color}aa` : '#64748b' }} className="text-xs leading-relaxed">
                        {type.desc}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Documento opcional */}
          <div
            style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }}
            className="rounded-xl p-5"
          >
            <h2 style={{ color: '#e2e8f0' }} className="font-semibold text-sm mb-3">
              Documento base <span style={{ color: '#64748b' }} className="font-normal">(opcional)</span>
            </h2>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              style={{
                backgroundColor: '#141622',
                border: '1px solid #2a2d3e',
                color: selectedDocId ? '#e2e8f0' : '#64748b',
                width: '100%',
              }}
              className="text-xs rounded-lg px-3 py-2.5 appearance-none"
            >
              <option value="">Sin documento (genérico)</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name.length > 35 ? doc.name.slice(0, 35) + '…' : doc.name}
                </option>
              ))}
            </select>
            {documents.length === 0 && (
              <p style={{ color: '#64748b' }} className="text-xs mt-2">
                Sube documentos en la sección Documentos para usarlos como base.
              </p>
            )}
          </div>

          {/* Botón generar */}
          <button
            onClick={generateReport}
            disabled={!selectedType || generating}
            style={{
              backgroundColor: selectedType && !generating ? '#3b82f6' : '#2a2d3e',
              color: selectedType && !generating ? '#fff' : '#64748b',
              width: '100%',
            }}
            className="rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Generando informe...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generar informe
              </>
            )}
          </button>

          {error && (
            <div
              style={{ backgroundColor: '#ef444415', border: '1px solid #ef444440', color: '#ef4444' }}
              className="rounded-lg px-4 py-3 text-xs"
            >
              {error}
            </div>
          )}
        </div>

        {/* Panel de resultado */}
        <div className="lg:col-span-2">
          {!result && !generating && (
            <div
              style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }}
              className="rounded-xl h-full flex flex-col items-center justify-center py-20 text-center"
            >
              <div
                style={{ backgroundColor: '#2a2d3e', color: '#64748b' }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p style={{ color: '#64748b' }} className="text-sm">
                Selecciona un tipo de informe y pulsa &ldquo;Generar&rdquo;
              </p>
            </div>
          )}

          {generating && (
            <div
              style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }}
              className="rounded-xl h-full flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p style={{ color: '#94a3b8' }} className="text-sm">Analizando y generando informe...</p>
              <p style={{ color: '#64748b' }} className="text-xs mt-1">Esto puede tardar unos segundos</p>
            </div>
          )}

          {result && (
            <div
              style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }}
              className="rounded-xl overflow-hidden animate-fade-in"
            >
              <div
                style={{ borderBottom: '1px solid #2a2d3e' }}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <h2 style={{ color: '#e2e8f0' }} className="font-semibold text-sm">{result.title}</h2>
                  <p style={{ color: '#64748b' }} className="text-xs mt-0.5">Generado por FactoryBrain AI</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    style={{ backgroundColor: '#2a2d3e', color: '#94a3b8', border: '1px solid #3a3d4e' }}
                    className="text-xs px-3 py-1.5 rounded-lg hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    style={{ backgroundColor: '#2a2d3e', color: '#94a3b8', border: '1px solid #3a3d4e' }}
                    className="text-xs px-3 py-1.5 rounded-lg hover:text-white transition-colors"
                  >
                    Nuevo
                  </button>
                </div>
              </div>
              <div className="px-6 py-5 overflow-y-auto max-h-[600px]">
                <div
                  className="prose-ai"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(result.content) }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
