import Link from 'next/link'

const cards = [
  {
    href: '/documents',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Documentos',
    description: 'Sube y gestiona documentos técnicos, financieros y operativos.',
    cta: 'Gestionar documentos',
    color: '#3b82f6',
  },
  {
    href: '/chat',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Chat IA',
    description: 'Consulta a tu analista industrial sobre procesos, costes y finanzas.',
    cta: 'Abrir chat',
    color: '#10b981',
  },
  {
    href: '/reports',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Informes',
    description: 'Genera informes financieros, técnicos, de auditoría y producción.',
    cta: 'Generar informe',
    color: '#f59e0b',
  },
]

const capabilities = [
  'Análisis de procesos de fabricación',
  'Análisis financiero y contable',
  'Costes industriales y márgenes',
  'Auditorías documentales',
  'Gestión de stock e inventario',
  'Documentación técnica',
  'Inversión y financiación industrial',
  'Extracción de datos de documentos',
]

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div
            style={{ backgroundColor: '#3b82f620', border: '1px solid #3b82f640', color: '#3b82f6' }}
            className="px-3 py-1 rounded-full text-xs font-medium"
          >
            Beta v0.1
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ backgroundColor: '#10b981' }} />
            <span style={{ color: '#64748b' }} className="text-xs">Sistema operativo</span>
          </div>
        </div>
        <h1 style={{ color: '#e2e8f0' }} className="text-3xl font-bold mb-2">
          FactoryBrain <span style={{ color: '#3b82f6' }}>AI</span>
        </h1>
        <p style={{ color: '#94a3b8' }} className="text-base max-w-2xl leading-relaxed">
          Copiloto industrial con inteligencia artificial para PyMEs de fabricación técnica.
          Analiza documentos, consulta a tu analista IA y genera informes profesionales.
        </p>
      </div>

      {/* Módulos principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }}
            className="rounded-xl p-6 flex flex-col gap-4 transition-all hover:border-blue-500/40 hover:-translate-y-0.5 group"
          >
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${card.color}20`, color: card.color }}
            >
              {card.icon}
            </div>
            <div>
              <h2 style={{ color: '#e2e8f0' }} className="font-semibold text-base mb-1.5">{card.title}</h2>
              <p style={{ color: '#94a3b8' }} className="text-sm leading-relaxed">{card.description}</p>
            </div>
            <div
              className="flex items-center gap-2 text-sm font-medium mt-auto"
              style={{ color: card.color }}
            >
              {card.cta}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Panel inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Capacidades */}
        <div
          style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }}
          className="rounded-xl p-6"
        >
          <h3 style={{ color: '#e2e8f0' }} className="font-semibold text-sm mb-4">
            Capacidades del analista IA
          </h3>
          <ul className="space-y-2.5">
            {capabilities.map((cap) => (
              <li key={cap} className="flex items-center gap-2.5">
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span style={{ color: '#94a3b8' }} className="text-sm">{cap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Guía rápida */}
        <div
          style={{ backgroundColor: '#1e2130', border: '1px solid #2a2d3e' }}
          className="rounded-xl p-6"
        >
          <h3 style={{ color: '#e2e8f0' }} className="font-semibold text-sm mb-4">
            Guía rápida de inicio
          </h3>
          <ol className="space-y-4">
            {[
              { step: '01', title: 'Sube un documento', desc: 'Ve a Documentos y sube un PDF, Excel o Word con datos de tu empresa.' },
              { step: '02', title: 'Consulta al analista', desc: 'Abre el Chat IA y pregunta sobre el contenido de tus documentos.' },
              { step: '03', title: 'Genera un informe', desc: 'En Informes, selecciona el tipo y genera un análisis profesional.' },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span
                  style={{ color: '#3b82f6', backgroundColor: '#3b82f615', minWidth: '2rem' }}
                  className="text-xs font-bold rounded-md flex items-center justify-center h-7"
                >
                  {item.step}
                </span>
                <div>
                  <div style={{ color: '#e2e8f0' }} className="text-sm font-medium mb-0.5">{item.title}</div>
                  <div style={{ color: '#64748b' }} className="text-xs leading-relaxed">{item.desc}</div>
                </div>
              </li>
            ))}
          </ol>

          <div
            style={{ backgroundColor: '#141622', border: '1px solid #2a2d3e' }}
            className="rounded-lg p-3 mt-5"
          >
            <div style={{ color: '#64748b' }} className="text-xs font-medium mb-2">Estado de configuración</div>
            <div className="space-y-1.5">
              {['Supabase', 'OpenRouter API'].map((label) => (
                <div key={label} className="flex items-center justify-between">
                  <span style={{ color: '#94a3b8' }} className="text-xs">{label}</span>
                  <span style={{ color: '#f59e0b' }} className="text-xs">Configurar en .env.local</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
