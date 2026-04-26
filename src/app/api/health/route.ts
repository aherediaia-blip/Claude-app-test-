import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Test básico de conexión (sin autenticación)
    const { data, error } = await supabase
      .from('documents')
      .select('count', { count: 'exact' })
      .limit(0)

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'ok',
      message: '✅ Supabase funcionando correctamente',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: (error as Error).message,
    }, { status: 500 })
  }
}
