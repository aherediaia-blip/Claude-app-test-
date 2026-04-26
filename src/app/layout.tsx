import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'FactoryBrain AI - Copiloto Industrial',
  description: 'Copiloto industrial con IA para PyMEs de fabricación técnica. Análisis documental, financiero e industrial.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body
        className="h-full flex"
        style={{ backgroundColor: '#0f1117', color: '#e2e8f0' }}
      >
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
