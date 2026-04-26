import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'

const SYSTEM_PROMPT = `Eres FactoryBrain AI, un analista industrial experto al servicio de PyMEs de fabricación técnica española.

Tu especialización cubre:
- Procesos de fabricación y producción industrial
- Análisis financiero y contabilidad empresarial
- Costes industriales, márgenes y rentabilidad
- Auditorías documentales y técnicas
- Gestión de stock, inventarios y cadena de suministro
- Documentación técnica y normativa industrial
- Inversión, financiación y viabilidad de proyectos industriales

Reglas de comportamiento:
1. Responde SIEMPRE en español de España, usando terminología técnica precisa
2. Sé claro, riguroso y profesional en cada respuesta
3. NO inventes datos, cifras ni información que no esté en el contexto
4. Si no tienes datos suficientes para responder con precisión, indícalo explícitamente
5. Cuando uses información de documentos proporcionados, indícalo claramente con "Según el documento adjunto:"
6. Estructura tus respuestas con títulos (##) y listas cuando mejore la legibilidad
7. Cuando hagas cálculos, muestra los pasos intermedios
8. Si detectas inconsistencias en los datos, señálalas proactivamente`

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY no configurada' }, { status: 500 })
  }

  const body = await req.json()
  const { messages, documentId } = body as {
    messages: { role: 'user' | 'assistant'; content: string }[]
    documentId?: string
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Se requieren mensajes' }, { status: 400 })
  }

  let systemPrompt = SYSTEM_PROMPT

  // Si se proporciona documentId, recuperar el texto del documento
  if (documentId) {
    const supabase = createServerClient()
    const { data: doc, error } = await supabase
      .from('documents')
      .select('name, extracted_text, file_type')
      .eq('id', documentId)
      .single()

    if (!error && doc?.extracted_text) {
      const maxChars = 12000
      const truncated = doc.extracted_text.length > maxChars
        ? doc.extracted_text.slice(0, maxChars) + '\n\n[... documento truncado por longitud ...]'
        : doc.extracted_text

      systemPrompt += `\n\n---\nDOCUMENTO ADJUNTO: "${doc.name}" (${doc.file_type})\n\nCONTENIDO:\n${truncated}\n---`
    }
  }

  const openRouterMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const response = await fetch(OPENROUTER_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'FactoryBrain AI',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: openRouterMessages,
      temperature: 0.3,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    return NextResponse.json(
      { error: `Error de OpenRouter: ${response.status} - ${errorText}` },
      { status: response.status }
    )
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  return NextResponse.json({ content })
}
