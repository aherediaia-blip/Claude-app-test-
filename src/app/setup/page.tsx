'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HealthStatus {
  status: string
  localMode: boolean
  checks: {
    supabase: boolean
    openrouter: boolean
    supabaseUrl: string
    openrouterKey: string
  }
  message: string
  fixes: {
    supabase: string | null
    openrouter: string | null
  }
}

export default function SetupPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const check = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/health')
      const data = await res.json()
      setHealth(data)
    } catch (err) {
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { check() }, [])

  const allOk = health?.checks.supabase && health?.checks.openrouter

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0f1117' }}>
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div style={{ backgroundColor: '#3b82f6' }} className="w-10 h-10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <div className="text-left">
              <div style={{ color: '#e2e8f0' }} className="font-bold text-lg">FactoryBrain AI</div>
              <div style={{ color: '#64748b' }} className="text-xs">Estado del sistema</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }} className="rounded-2xl p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p style={{ color: '#64748b' }} className="text-sm">Comprobando servicios...</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }} className="rounded-2xl overflow-hidden">

            {/* Estado global */}
            <div
              style={{
                backgroundColor: allOk ? '#10b98115' : health?.localMode ? '#f59e0b15' : '#ef444415',
                borderBottom: `1px solid ${allOk ? '#10b98130' : health?.localMode ? '#f59e0b30' : '#ef444430'}`,
              }}
              className="px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{ color: allOk ? '#10b981' : health?.localMode ? '#f59e0b' : '#ef4444' }}
                  className="text-xl"
                >
                  {allOk ? '✅' : health?.localMode ? '⚠️' : '❌'}
                </div>
                <div>
                  <div style={{ color: '#e2e8f0' }} className="font-semibold text-sm">
                    {allOk ? 'Todo funcionando' : health?.localMode ? 'Modo local activo' : 'Configuración pendiente'}
                  </div>
                  <div style={{ color: '#94a3b8' }} className="text-xs mt-0.5">{health?.message}</div>
                </div>
              </div>
            </div>

            {/* Servicios */}
            <div className="px-6 py-5 space-y-3">
              <h3 style={{ color: '#94a3b8' }} className="text-xs font-medium uppercase tracking-wider mb-4">Servicios</h3>

              {[
                {
                  name: 'Supabase (base de datos)',
                  ok: health?.checks.supabase,
                  fix: health?.fixes.supabase,
                  link: 'https://supabase.com/dashboard/project/vbyjqtxqzecqyedikkms/settings/api',
                  linkLabel: 'Abrir Settings → API',
                },
                {
                  name: 'OpenRouter (IA)',
                  ok: health?.checks.openrouter,
                  fix: health?.fixes.openrouter,
                  link: 'https://openrouter.ai/settings/keys',
                  linkLabel: 'Abrir OpenRouter Settings',
                },
              ].map((service) => (
                <div
                  key={service.name}
                  style={{
                    backgroundColor: '#141622',
                    border: `1px solid ${service.ok ? '#10b98130' : '#ef444430'}`,
                  }}
                  className="rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span style={{ color: service.ok ? '#10b981' : '#ef4444' }}>
                        {service.ok ? '●' : '●'}
                      </span>
                      <span style={{ color: '#e2e8f0' }} className="text-sm font-medium">{service.name}</span>
                    </div>
                    <span
                      style={{
                        backgroundColor: service.ok ? '#10b98120' : '#ef444420',
                        color: service.ok ? '#10b981' : '#ef4444',
                      }}
                      className="text-xs px-2 py-0.5 rounded-full"
                    >
                      {service.ok ? 'Conectado' : 'No conectado'}
                    </span>
                  </div>
                  {!service.ok && service.fix && (
                    <div className="mt-2">
                      <p style={{ color: '#f59e0b' }} className="text-xs mb-2">🔧 {service.fix}</p>
                      <a
                        href={service.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3b82f6' }}
                        className="text-xs hover:underline flex items-center gap-1"
                      >
                        {service.linkLabel} →
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Qué funciona ahora */}
            <div style={{ borderTop: '1px solid #2a2d3e' }} className="px-6 py-5">
              <h3 style={{ color: '#94a3b8' }} className="text-xs font-medium uppercase tracking-wider mb-3">
                Qué funciona ahora
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Dashboard e interfaz', ok: true },
                  { label: 'Subida y listado de documentos', ok: true },
                  { label: 'Extracción de texto (PDF, DOCX, XLSX)', ok: true },
                  { label: 'Chat IA con OpenRouter', ok: health?.checks.openrouter },
                  { label: 'Informes automáticos con IA', ok: health?.checks.openrouter },
                  { label: 'Persistencia de datos (Supabase)', ok: health?.checks.supabase && !health?.localMode },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span style={{ color: item.ok ? '#10b981' : '#ef4444' }} className="text-sm">
                      {item.ok ? '✓' : '✗'}
                    </span>
                    <span style={{ color: item.ok ? '#94a3b8' : '#64748b' }} className="text-sm">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div style={{ borderTop: '1px solid #2a2d3e' }} className="px-6 py-5 flex gap-3">
              <button
                onClick={check}
                style={{ backgroundColor: '#2a2d3e', color: '#94a3b8', flex: 1 }}
                className="rounded-xl py-2.5 text-sm font-medium hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recomprobar
              </button>
              <Link
                href="/"
                style={{ backgroundColor: '#3b82f6', flex: 1 }}
                className="rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Ir al Dashboard →
              </Link>
            </div>
          </div>
        )}

        {/* Instrucciones rápidas */}
        {health && !health.checks.openrouter && (
          <div
            style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }}
            className="rounded-xl mt-4 p-5"
          >
            <h3 style={{ color: '#e2e8f0' }} className="font-semibold text-sm mb-3">
              Para activar el Chat IA (OpenRouter)
            </h3>
            <ol style={{ color: '#94a3b8' }} className="text-sm space-y-2 list-decimal list-inside">
              <li>
                Ve a{' '}
                <a href="https://openrouter.ai/settings/keys" target="_blank" style={{ color: '#3b82f6' }} className="hover:underline">
                  openrouter.ai/settings/keys
                </a>
              </li>
              <li>Haz clic en tu API key activa</li>
              <li>Busca &ldquo;Allowed domains&rdquo; o &ldquo;Allowed origins&rdquo;</li>
              <li>Borra los dominios existentes <strong style={{ color: '#e2e8f0' }}>(o deja en blanco = sin restricción)</strong></li>
              <li>Guarda cambios</li>
              <li>Pulsa &ldquo;Recomprobar&rdquo; aquí</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
