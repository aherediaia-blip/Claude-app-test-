import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { extractText } from '@/lib/document-extractor'
import { localStore } from '@/lib/local-store'

const LOCAL_MODE = process.env.SUPABASE_LOCAL_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

const DEMO_USER_ID = 'demo-user-id'

export async function GET(req: NextRequest) {
  // Modo local: sin Supabase
  if (LOCAL_MODE) {
    const docs = localStore.documents.list(DEMO_USER_ID)
    return NextResponse.json({ documents: docs, mode: 'local' })
  }

  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ documents: data })
  } catch (err) {
    // Fallback a modo local si Supabase falla
    const docs = localStore.documents.list(DEMO_USER_ID)
    return NextResponse.json({ documents: docs, mode: 'local-fallback' })
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
  if (!file.name.match(/\.(pdf|txt|csv|docx|doc|xlsx|xls)$/i)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido. Formatos: PDF, TXT, CSV, DOCX, XLSX' }, { status: 400 })
  }
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo supera el límite de 20 MB' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let extractedText: string | null = null
  try {
    extractedText = await extractText(buffer, file.type, file.name)
  } catch { /* no bloquear si falla extracción */ }

  // Modo local: guardar en memoria
  if (LOCAL_MODE) {
    const doc = localStore.documents.create({
      user_id: DEMO_USER_ID,
      name: file.name,
      file_path: `local/${Date.now()}-${file.name}`,
      file_type: file.type || file.name.split('.').pop() || 'unknown',
      size: file.size,
      extracted_text: extractedText,
    })
    return NextResponse.json({ document: doc, mode: 'local' }, { status: 201 })
  }

  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const filePath = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: `Error al subir archivo: ${uploadError.message}` }, { status: 500 })
    }

    const { data: docData, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: file.name,
        file_path: filePath,
        file_type: file.type || file.name.split('.').pop() || 'unknown',
        size: file.size,
        extracted_text: extractedText,
      })
      .select()
      .single()

    if (dbError) {
      await supabase.storage.from('documents').remove([filePath])
      return NextResponse.json({ error: `Error al guardar: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json({ document: docData }, { status: 201 })
  } catch {
    // Fallback a modo local
    const doc = localStore.documents.create({
      user_id: DEMO_USER_ID,
      name: file.name,
      file_path: `local/${Date.now()}-${file.name}`,
      file_type: file.type || file.name.split('.').pop() || 'unknown',
      size: file.size,
      extracted_text: extractedText,
    })
    return NextResponse.json({ document: doc, mode: 'local-fallback' }, { status: 201 })
  }
}
