import { NextResponse } from 'next/server'

const LOCAL_MODE = process.env.SUPABASE_LOCAL_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

export async function GET() {
  const checks = {
    supabase: false,
    openrouter: false,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌ Falta',
    openrouterKey: process.env.OPENROUTER_API_KEY ? '✅' : '❌ Falta',
    localMode: LOCAL_MODE,
  }

  // Test Supabase
  if (!LOCAL_MODE) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/documents?limit=0`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      })
      checks.supabase = res.ok
    } catch { checks.supabase = false }
  } else {
    checks.supabase = true // en modo local siempre OK
  }

  // Test OpenRouter (HEAD request para no consumir tokens)
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    })
    checks.openrouter = res.ok
  } catch { checks.openrouter = false }

  const allOk = checks.supabase && checks.openrouter

  return NextResponse.json({
    status: allOk ? 'ok' : 'partial',
    localMode: LOCAL_MODE,
    checks,
    message: LOCAL_MODE
      ? '⚠️ Modo local activo. Datos en memoria (se pierden al reiniciar). Configura Supabase y OpenRouter para persistencia.'
      : allOk
        ? '✅ Todos los servicios funcionando'
        : '⚠️ Algunos servicios no responden',
    fixes: {
      supabase: checks.supabase ? null : 'Añade localhost:3000 en Supabase → Settings → API → Allowed Hostnames',
      openrouter: checks.openrouter ? null : 'Añade localhost:3000 en OpenRouter → Settings → tu API key → Allowed Domains',
    },
  })
}
