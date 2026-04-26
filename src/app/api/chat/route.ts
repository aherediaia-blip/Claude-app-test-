import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { localStore } from '@/lib/local-store'

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct'
const LOCAL_MODE = process.env.SUPABASE_LOCAL_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

const DEMO_USER_ID = 'demo-user-id'

const SYSTEM_PROMPT = `Eres FactoryBrain AI, un analista industrial experto al servicio de PyMEs de fabricación técnica española.

Tu especialización cubre:
- Procesos de fabricación y producción industrial
- Análisis financiero y contabilidad empresarial
- Costes industriales, márgenes y rentabilidad
- Auditorías documentales y técnicas
- Gestión de stock, inventarios y cadena de suministro
- Documentación técnica y normativa industrial
- Inversión, financiación y viabilidad de proyectos industriales

Reglas:
1. Responde SIEMPRE en español de España con terminología técnica precisa
2. Sé claro, riguroso y profesional
3. NO inventes datos ni cifras que no estén en el contexto
4. Si no tienes datos suficientes, indícalo explícitamente
5. Cuando uses información de documentos, indícalo con "Según el documento adjunto:"
6. Estructura las respuestas con títulos (##) y listas cuando mejore la legibilidad
7. Muestra pasos intermedios en cálculos
8. Señala proactivamente inconsistencias en los datos`

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY no configurada en .env.local' }, { status: 500 })
  }

  const body = await req.json()
  const { messages, documentId } = body as {
    messages: { role: 'user' | 'assistant'; content: string }[]
    documentId?: string
  }

  if (!messages?.length) {
    return NextResponse.json({ error: 'Se requieren mensajes' }, { status: 400 })
  }

  let systemPrompt = SYSTEM_PROMPT

  // Obtener contexto documental
  if (documentId) {
    let doc = null

    if (LOCAL_MODE) {
      doc = localStore.documents.getById(documentId, DEMO_USER_ID)
    } else {
      try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('documents')
            .select('name, extracted_text, file_type')
            .eq('id', documentId)
            .eq('user_id', user.id)
            .single()
          doc = data
        }
      } catch {
        doc = localStore.documents.getById(documentId, DEMO_USER_ID)
      }
    }

    if (doc?.extracted_text) {
      const maxChars = 12000
      const truncated = doc.extracted_text.length > maxChars
        ? doc.extracted_text.slice(0, maxChars) + '\n\n[... documento truncado por longitud ...]'
        : doc.extracted_text
      systemPrompt += `\n\n---\nDOCUMENTO ADJUNTO: "${doc.name}" (${doc.file_type})\n\nCONTENIDO:\n${truncated}\n---`
    }
  }

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
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    return NextResponse.json(
      { error: `Error de OpenRouter (${response.status}): ${errorText}` },
      { status: response.status }
    )
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  return NextResponse.json({ content })
}
