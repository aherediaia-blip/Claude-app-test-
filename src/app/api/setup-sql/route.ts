import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        message: 'Falta configuración de Supabase',
      }, { status: 500 })
    }

    // Leer schema.sql
    const schemaPath = join(process.cwd(), 'supabase', 'schema.sql')
    let schema: string
    try {
      schema = readFileSync(schemaPath, 'utf-8')
    } catch {
      return NextResponse.json({
        success: false,
        message: 'No se encontró supabase/schema.sql',
      }, { status: 500 })
    }

    // Dividir en queries
    const queries = schema
      .split(';')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('--'))

    console.log(`Ejecutando ${queries.length} queries SQL...`)

    let successCount = 0
    const errors: string[] = []

    // Ejecutar cada query
    for (const query of queries) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ sql: query }),
        })

        if (response.ok) {
          successCount++
        } else {
          const text = await response.text()
          errors.push(`Query falló: ${text.slice(0, 100)}`)
        }
      } catch (err) {
        errors.push((err as Error).message)
      }
    }

    if (successCount === 0 && errors.length > 0) {
      // Si todas fallan, retornar instrucción manual
      return NextResponse.json({
        success: false,
        message: `No se pudieron ejecutar las queries remotamente. Necesitas ejecutar manualmente:\n\n1. Ve a Supabase SQL Editor\n2. Pega el contenido de supabase/schema.sql\n3. Ejecuta\n\nError: ${errors[0]}`,
        needsManualSetup: true,
      }, { status: 500 })
    }

    if (successCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Se ejecutaron ${successCount} queries SQL exitosamente`,
        queriesExecuted: successCount,
      })
    }

    return NextResponse.json({
      success: false,
      message: 'No se ejecutaron queries',
    }, { status: 500 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: (error as Error).message,
    }, { status: 500 })
  }
}
