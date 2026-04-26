# FactoryBrain AI

**Copiloto industrial con IA para PyMEs de fabricación técnica.**

Plataforma web que permite subir documentos, analizarlos con inteligencia artificial y chatear con un analista experto en procesos industriales, finanzas, costes y auditorías.

---

## Stack tecnológico

- **Next.js 16** con App Router
- **React 19** + TypeScript
- **Tailwind CSS v4**
- **Supabase** (base de datos + storage)
- **OpenRouter API** (modelos de IA, por defecto `meta-llama/llama-3-8b-instruct` - GRATUITO)
- **pdf-parse**, **mammoth**, **xlsx** para extracción de texto documental

---

## Funcionalidades MVP

| Módulo | Descripción |
|---|---|
| Dashboard | Vista general con acceso a todos los módulos |
| Documentos | Subida, almacenamiento y extracción de texto (PDF, DOCX, XLSX, TXT, CSV) |
| Chat IA | Conversación con analista industrial vía OpenRouter, con contexto documental |
| Informes | Generación automática de informes financieros, técnicos, de auditoría y producción |

---

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/aherediaia-blip/Claude-app-test-.git
cd Claude-app-test-
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
OPENROUTER_API_KEY=tu-api-key-de-openrouter
OPENROUTER_MODEL=meta-llama/llama-3-8b-instruct
```

### 4. Configurar Supabase

#### ⚠️ Permitir localhost (IMPORTANTE para claves `sb_publishable_`)

Si tus claves tienen formato `sb_publishable_` y `sb_secret_`:

1. **Supabase Dashboard → Settings → API**
2. Busca **"Allowed Hostnames"** (o "CORS")
3. Añade:
   ```
   localhost:3000
   localhost
   127.0.0.1:3000
   ```
4. Haz clic en **Save**

> Ver [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) para guía visual completa.

#### Crear las tablas

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Abre **SQL Editor**
3. Copia todo el contenido de `supabase/schema.sql`
4. Pégalo y ejecuta (botón ▶)
5. Espera a que termine con "Success"

#### Crear el bucket de Storage

1. Ve a **Storage** en el panel de Supabase
2. Clic en **New Bucket**
3. Nombre: `documents`
4. Público: No (privado)
5. Guarda

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Clave pública anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Clave privada de servicio (solo servidor) |
| `OPENROUTER_API_KEY` | Sí | API key de OpenRouter |
| `OPENROUTER_MODEL` | No | Modelo a usar (default: `meta-llama/llama-3-8b-instruct` - GRATUITO) |

> **Seguridad:** `SUPABASE_SERVICE_ROLE_KEY` y `OPENROUTER_API_KEY` nunca se exponen al cliente. Solo se usan en API routes de servidor.

### Modelos gratuitos disponibles en OpenRouter

Por defecto se usa `meta-llama/llama-3-8b-instruct` (gratuito). Otras opciones:

| Modelo | Gratuito | Velocidad | Calidad |
|---|---|---|---|
| `meta-llama/llama-3-8b-instruct` | ✅ | Rápido | Bueno |
| `mistralai/mistral-7b-instruct` | ✅ | Muy rápido | Bueno |
| `meta-llama/llama-2-7b-chat` | ✅ | Rápido | Aceptable |
| `openai/gpt-4o-mini` | ❌ | Rápido | Excelente (pago) |

Para cambiar, edita `.env.local`:
```env
OPENROUTER_MODEL=mistralai/mistral-7b-instruct
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts         # API OpenRouter
│   │   ├── documents/route.ts    # API documentos (GET/POST)
│   │   └── reports/route.ts      # API informes
│   ├── chat/page.tsx             # Chat IA
│   ├── documents/page.tsx        # Gestión documentos
│   ├── reports/page.tsx          # Generador de informes
│   ├── layout.tsx                # Layout con sidebar
│   └── page.tsx                  # Dashboard
├── components/
│   └── Sidebar.tsx               # Navegación lateral
├── lib/
│   ├── document-extractor.ts     # Extracción de texto
│   └── supabase/
│       ├── client.ts             # Cliente Supabase (browser)
│       └── server.ts             # Cliente Supabase (servidor)
├── types/
│   └── index.ts                  # Tipos TypeScript
supabase/
└── schema.sql                    # Esquema de base de datos
```

---

## Despliegue en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Añade todas las variables de entorno del `.env.example`
3. Despliega — Vercel detecta Next.js automáticamente

---

## Limitaciones conocidas (MVP)

- No hay autenticación de usuarios (acceso libre). Añadir Supabase Auth en próxima versión.
- La extracción de PDF con solo imágenes (PDF escaneados) no extrae texto; requiere OCR.
- El texto de documentos grandes se trunca a ~12.000 caracteres en el contexto de la IA.
- Los informes se guardan en Supabase pero no hay historial de informes en la UI todavía.
- RLS (Row Level Security) de Supabase desactivado en MVP; activar en producción.

---

## Soporte de formatos de documento

| Formato | Extracción de texto |
|---|---|
| `.txt` | Completa |
| `.csv` | Completa |
| `.pdf` | Texto seleccionable (no PDFs escaneados) |
| `.docx` | Completa |
| `.doc` | Parcial (formato legacy) |
| `.xlsx` | Completa (todas las hojas) |
| `.xls` | Parcial (formato legacy) |
