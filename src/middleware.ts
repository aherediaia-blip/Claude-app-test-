import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/setup']

// Modo local: bypasea auth si Supabase no está configurado
const LOCAL_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project') ||
  process.env.SUPABASE_LOCAL_MODE === 'true'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Rutas de API: pasar siempre
  if (pathname.startsWith('/api/')) {
    return NextResponse.next({ request })
  }

  // En modo local no hay auth — acceso libre a todo
  if (LOCAL_MODE) {
    // Redirigir /login y /register al dashboard en modo local
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas públicas: redirigir al dashboard si ya está autenticado
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (user) return NextResponse.redirect(new URL('/', request.url))
    return supabaseResponse
  }

  // Rutas protegidas: redirigir a login si no autenticado
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
