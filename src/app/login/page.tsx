'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'auth_callback_error') setError('Error de autenticación. Inténtalo de nuevo.')
    const msg = searchParams.get('message')
    if (msg === 'confirm_email') setError('Revisa tu email para confirmar tu cuenta antes de iniciar sesión.')
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos.'
        : error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {error && (
        <div
          style={{ backgroundColor: '#ef444415', border: '1px solid #ef444440', color: '#ef4444' }}
          className="rounded-lg px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      <div>
        <label style={{ color: '#94a3b8' }} className="block text-xs font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@empresa.com"
          required
          style={{ backgroundColor: '#141622', border: '1px solid #2a2d3e', color: '#e2e8f0', width: '100%' }}
          className="rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
        />
      </div>

      <div>
        <label style={{ color: '#94a3b8' }} className="block text-xs font-medium mb-2">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          style={{ backgroundColor: '#141622', border: '1px solid #2a2d3e', color: '#e2e8f0', width: '100%' }}
          className="rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ backgroundColor: loading ? '#2a2d3e' : '#3b82f6', width: '100%' }}
        className="rounded-xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Iniciando sesión...
          </>
        ) : 'Iniciar sesión'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0f1117' }}>
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
          <h1 style={{ color: '#e2e8f0' }} className="text-xl font-bold">Iniciar sesión</h1>
          <p style={{ color: '#64748b' }} className="text-sm mt-1">Accede a tu copiloto industrial</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }} className="rounded-2xl p-8">
          <Suspense fallback={<div className="h-40" />}>
            <LoginForm />
          </Suspense>

          <p style={{ color: '#64748b' }} className="text-sm text-center mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/register" style={{ color: '#3b82f6' }} className="hover:underline font-medium">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
