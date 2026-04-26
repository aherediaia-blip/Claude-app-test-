'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Este email ya está registrado. Inicia sesión.'
        : error.message)
      setLoading(false)
      return
    }

    // Si el email no requiere confirmación, redirigir directo
    if (data.session) {
      router.push('/')
      router.refresh()
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#0f1117' }}
      >
        <div className="w-full max-w-md text-center">
          <div
            style={{ backgroundColor: '#10b98120', color: '#10b981' }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ color: '#e2e8f0' }} className="text-xl font-bold mb-2">¡Registro completado!</h2>
          <p style={{ color: '#94a3b8' }} className="text-sm mb-6">
            Revisa tu email <strong style={{ color: '#e2e8f0' }}>{email}</strong> y confirma tu cuenta para empezar.
          </p>
          <Link
            href="/login"
            style={{ backgroundColor: '#3b82f6' }}
            className="inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Ir al login
          </Link>
        </div>
      </div>
    )
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
            <div
              style={{ backgroundColor: '#3b82f6' }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
            >
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
          <h1 style={{ color: '#e2e8f0' }} className="text-xl font-bold">Crear cuenta</h1>
          <p style={{ color: '#64748b' }} className="text-sm mt-1">Empieza a usar tu copiloto industrial</p>
        </div>

        {/* Card */}
        <div
          style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }}
          className="rounded-2xl p-8"
        >
          <form onSubmit={handleRegister} className="space-y-5">
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
                placeholder="Mínimo 6 caracteres"
                required
                style={{ backgroundColor: '#141622', border: '1px solid #2a2d3e', color: '#e2e8f0', width: '100%' }}
                className="rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
              />
            </div>

            <div>
              <label style={{ color: '#94a3b8' }} className="block text-xs font-medium mb-2">Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
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
                  Creando cuenta...
                </>
              ) : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ color: '#64748b' }} className="text-sm text-center mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" style={{ color: '#3b82f6' }} className="hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
