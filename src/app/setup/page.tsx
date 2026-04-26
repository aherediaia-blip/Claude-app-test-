'use client'

import { useState, useEffect } from 'react'

export default function SetupPage() {
  const [step, setStep] = useState<'check' | 'configure' | 'done'>('check')
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<{ tables: boolean; bucket: boolean }>({
    tables: false,
    bucket: false,
  })

  useEffect(() => {
    checkSetup()
  }, [])

  const checkSetup = async () => {
    try {
      const res = await fetch('/api/health')
      const data = await res.json()

      if (data.status === 'ok') {
        setStatus({ tables: true, bucket: true })
        setStep('done')
        setChecking(false)
      } else {
        setError(data.message)
        setStep('configure')
        setChecking(false)
      }
    } catch (err) {
      setError((err as Error).message)
      setStep('configure')
      setChecking(false)
    }
  }

  const handleConfigureSupabase = async () => {
    setChecking(true)
    try {
      // Intenta ejecutar setup SQL
      const res = await fetch('/api/setup-sql', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setStatus({ tables: true, bucket: true })
        setStep('done')
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0f1117' }}
    >
      <div className="w-full max-w-md">
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
              <div style={{ color: '#e2e8f0' }} className="font-bold text-lg leading-tight">FactoryBrain</div>
              <div style={{ color: '#3b82f6' }} className="text-sm font-semibold">AI</div>
            </div>
          </div>
          <h1 style={{ color: '#e2e8f0' }} className="text-2xl font-bold">Configuración inicial</h1>
          <p style={{ color: '#64748b' }} className="text-sm mt-2">Inicializando tu copiloto industrial</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }} className="rounded-2xl p-8">
          {/* Paso 1: Check */}
          {step === 'check' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p style={{ color: '#94a3b8' }} className="text-sm text-center">
                Verificando configuración de Supabase...
              </p>
            </div>
          )}

          {/* Paso 2: Configurar */}
          {step === 'configure' && (
            <div className="space-y-5">
              <div>
                <h2 style={{ color: '#e2e8f0' }} className="font-semibold text-base mb-3">Estado</h2>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {status.bucket ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    )}
                    <span style={{ color: '#94a3b8' }} className="text-sm">
                      {status.bucket ? '✅ Storage bucket' : '⚠️ Storage bucket'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {status.tables ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                    )}
                    <span style={{ color: '#94a3b8' }} className="text-sm">
                      {status.tables ? '✅ Tablas de base de datos' : '❌ Tablas de base de datos'}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div
                  style={{ backgroundColor: '#ef444415', border: '1px solid #ef444440', color: '#ef4444' }}
                  className="rounded-lg px-4 py-3 text-sm"
                >
                  {error}
                </div>
              )}

              <div style={{ backgroundColor: '#141622', border: '1px solid #2a2d3e' }} className="rounded-lg p-4">
                <p style={{ color: '#94a3b8' }} className="text-xs mb-3">
                  <strong style={{ color: '#e2e8f0' }}>Falta configurar:</strong>
                </p>
                <ol style={{ color: '#64748b' }} className="text-xs space-y-2 list-decimal list-inside">
                  <li>Permitir localhost en Supabase</li>
                  <li>Crear las tablas SQL</li>
                </ol>
              </div>

              <button
                onClick={handleConfigureSupabase}
                disabled={checking}
                style={{ backgroundColor: checking ? '#2a2d3e' : '#3b82f6', width: '100%' }}
                className="rounded-xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:cursor-not-allowed"
              >
                {checking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Configurando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Completar setup
                  </>
                )}
              </button>

              <details className="text-xs" style={{ color: '#64748b' }}>
                <summary className="cursor-pointer hover:text-white transition-colors">
                  ¿Qué hace este botón?
                </summary>
                <div style={{ color: '#94a3b8' }} className="mt-3 p-3 rounded bg-white/5 space-y-2">
                  <p>1. Intenta crear las tablas de base de datos</p>
                  <p>2. Configura Row Level Security (RLS)</p>
                  <p>3. Crea políticas de seguridad</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Si falla: necesitas ejecutar manualmente <code>supabase/schema.sql</code> en Supabase SQL Editor
                  </p>
                </div>
              </details>
            </div>
          )}

          {/* Paso 3: Done */}
          {step === 'done' && (
            <div className="space-y-5 text-center">
              <div
                style={{ backgroundColor: '#10b98120', color: '#10b981' }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h2 style={{ color: '#e2e8f0' }} className="font-semibold text-lg mb-1">¡Listo!</h2>
                <p style={{ color: '#94a3b8' }} className="text-sm">
                  FactoryBrain AI está completamente configurado
                </p>
              </div>

              <a
                href="/"
                style={{ backgroundColor: '#3b82f6', width: '100%' }}
                className="inline-block rounded-xl py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Ir al Dashboard
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
