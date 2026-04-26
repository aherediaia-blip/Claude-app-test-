// Extracción de texto de documentos por tipo

export async function extractText(buffer: Buffer, fileType: string, fileName: string): Promise<string> {
  const ext = fileName.split('.').pop()?.toLowerCase() || fileType.toLowerCase()

  if (ext === 'txt') {
    return buffer.toString('utf-8')
  }

  if (ext === 'csv') {
    return buffer.toString('utf-8')
  }

  if (ext === 'pdf') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse')
      const data = await pdfParse(buffer)
      return data.text || ''
    } catch {
      // TODO: mejorar manejo de PDFs protegidos o con imágenes
      return `[PDF: ${fileName}] - Error al extraer texto. El PDF puede estar protegido o ser de solo imagen.`
    }
  }

  if (ext === 'docx' || ext === 'doc') {
    try {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return result.value || ''
    } catch {
      // TODO: soporte completo para .doc legacy
      return `[DOCX: ${fileName}] - Error al extraer texto.`
    }
  }

  if (ext === 'xlsx' || ext === 'xls') {
    try {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const texts: string[] = []
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(sheet)
        texts.push(`=== Hoja: ${sheetName} ===\n${csv}`)
      }
      return texts.join('\n\n')
    } catch {
      // TODO: soporte para formatos Excel legacy
      return `[XLSX: ${fileName}] - Error al extraer texto.`
    }
  }

  return `[${ext?.toUpperCase()}: ${fileName}] - Tipo de archivo no soportado para extracción de texto.`
}
