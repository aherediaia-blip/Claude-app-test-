import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { extractText } from '@/lib/document-extractor'

export async function GET() {
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
  }

  if (!file.name.match(/\.(pdf|txt|csv|docx|doc|xlsx|xls)$/i)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido. Formatos: PDF, TXT, CSV, DOCX, XLSX' }, { status: 400 })
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo supera el límite de 20 MB' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const filePath = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: `Error al subir archivo: ${uploadError.message}` }, { status: 500 })
  }

  let extractedText: string | null = null
  try {
    extractedText = await extractText(buffer, file.type, file.name)
  } catch { /* no bloquear si falla extracción */ }

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
    return NextResponse.json({ error: `Error al guardar metadatos: ${dbError.message}` }, { status: 500 })
  }

  return NextResponse.json({ document: docData }, { status: 201 })
}
