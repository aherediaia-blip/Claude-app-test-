// Almacén local en memoria para desarrollo sin Supabase
// Se resetea al reiniciar el servidor — solo para pruebas locales

import { Document, ChatMessage, Report } from '@/types'

type Store = {
  documents: Document[]
  chatMessages: ChatMessage[]
  reports: Report[]
  users: { id: string; email: string }[]
  sessions: Map<string, { userId: string; email: string }>
}

const store: Store = {
  documents: [],
  chatMessages: [],
  reports: [],
  users: [],
  sessions: new Map(),
}

// Simula un usuario demo fijo para modo offline
const DEMO_USER = { id: 'demo-user-id', email: 'demo@factorybrain.local' }

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const localStore = {
  isLocalMode(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    return (
      url.includes('your-project') ||
      key.includes('your-anon-key') ||
      url === '' ||
      key === ''
    )
  },

  auth: {
    getUser(sessionToken?: string) {
      if (sessionToken && store.sessions.has(sessionToken)) {
        const session = store.sessions.get(sessionToken)!
        return { user: { id: session.userId, email: session.email }, error: null }
      }
      // En modo offline, siempre devuelve el usuario demo
      return { user: DEMO_USER, error: null }
    },

    signIn(email: string, _password: string) {
      const token = generateId()
      store.sessions.set(token, { userId: DEMO_USER.id, email })
      return { session: { access_token: token }, user: DEMO_USER, error: null }
    },

    signUp(email: string, _password: string) {
      const user = { id: generateId(), email }
      store.users.push(user)
      const token = generateId()
      store.sessions.set(token, { userId: user.id, email })
      return { session: { access_token: token }, user, error: null }
    },
  },

  documents: {
    list(userId: string): Document[] {
      return store.documents
        .filter(d => d.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    },

    create(data: Omit<Document, 'id' | 'created_at'>): Document {
      const doc: Document = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
      }
      store.documents.push(doc)
      return doc
    },

    getById(id: string, userId: string): Document | null {
      return store.documents.find(d => d.id === id && d.user_id === userId) || null
    },
  },

  reports: {
    list(userId: string): Report[] {
      return store.reports
        .filter(r => r.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    },

    create(data: Omit<Report, 'id' | 'created_at'>): Report {
      const report: Report = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
      }
      store.reports.push(report)
      return report
    },
  },
}
