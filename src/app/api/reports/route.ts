import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct'

const REPORT_PROMPTS: Record<string, string> = {
  financiero: `Genera un informe financiero completo y estructurado. Incluye:
## Resumen Ejecutivo
## Análisis de Ingresos y Gastos
## Márgenes y Rentabilidad
## Indicadores Clave (KPIs)
## Puntos de Atención
## Recomendaciones`,

  tecnico: `Genera un informe técnico detallado. Incluye:
## Resumen del Documento Técnico
## Especificaciones y Parámetros Clave
## Análisis de Procesos
## Desviaciones o Incidencias Detectadas
## Recomendaciones Técnicas`,

  auditoria: `Genera un informe de auditoría riguroso. Incluye:
## Alcance y Objetivo de la Auditoría
## Metodología Aplicada
## Hallazgos Principales
## No Conformidades Detectadas
## Riesgos Identificados
## Plan de Acción Correctivo
## Conclusiones`,

  produccion: `Genera un informe de producción y operaciones. Incluye:
## Resumen de Producción
## Análisis de Capacidad
## Eficiencia y Rendimiento
## Cuellos de Botella Identificados
## Gestión de Stock e Inventario
## Propuestas de Mejora Operativa`,
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY no configurada' }, { status: 500 })
  }

  const body = await req.json()
  const { reportType, documentId, title } = body as {
    reportType: 'financiero' | 'tecnico' | 'auditoria' | 'produccion'
    documentId?: string
    title?: string
  }

  if (!reportType || !REPORT_PROMPTS[reportType]) {
    return NextResponse.json({ error: 'Tipo de informe no válido' }, { status: 400 })
  }

  const supabase = createServerClient()

  let docContext = ''
  if (documentId) {
    const { data: doc } = await supabase
      .from('documents')
      .select('name, extracted_text, file_type')
      .eq('id', documentId)
      .single()

    if (doc?.extracted_text) {
      const maxChars = 12000
      const truncated = doc.extracted_text.length > maxChars
        ? doc.extracted_text.slice(0, maxChars) + '\n[...truncado...]'
        : doc.extracted_text

      docContext = `\n\nDOCUMENTO BASE: "${doc.name}"\n\nCONTENIDO:\n${truncated}`
    }
  }

  const systemPrompt = `Eres FactoryBrain AI, analista industrial experto para PyMEs de fabricación técnica española.
Genera informes profesionales, rigurosos y estructurados en español de España.
No inventes datos. Si no hay información suficiente, indícalo claramente en cada sección.`

  const userMessage = REPORT_PROMPTS[reportType] + (docContext ? docContext : '\n\nGenera el informe de forma genérica dado que no se ha proporcionado un documento base.')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'FactoryBrain AI',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 3000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    return NextResponse.json({ error: `Error de OpenRouter: ${errorText}` }, { status: response.status })
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  const reportTitle = title || `Informe ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} - ${new Date().toLocaleDateString('es-ES')}`

  const { data: savedReport, error: saveError } = await supabase
    .from('reports')
    .insert({
      title: reportTitle,
      report_type: reportType,
      content,
      document_id: documentId || null,
    })
    .select()
    .single()

  if (saveError) {
    // Si falla el guardado, igual devolvemos el contenido
    return NextResponse.json({ content, title: reportTitle, saved: false })
  }

  return NextResponse.json({ content, title: reportTitle, saved: true, report: savedReport })
}

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reports: data })
}
