# 🔧 Configuración de Supabase - FactoryBrain AI

## ❌ Problema actual
Las claves `sb_publishable_` y `sb_secret_` tienen restricción de **hostname**. 
Necesitas permitir `localhost:3000` para desarrollo.

---

## ✅ Solución paso a paso

### Opción A: Agregar Allowed Hosts (Recomendado)

1. **Abre tu proyecto Supabase**
   - https://supabase.com/dashboard/projects

2. **Ve a Settings → API**
   - URL: https://supabase.com/dashboard/project/vbyjqtxqzecqyedikkms/settings/api

3. **Busca "Allowed Hostnames"** (o "CORS allowed origins")
   - Debajo de "Project API Keys"

4. **Añade estas líneas:**
   ```
   localhost:3000
   localhost
   127.0.0.1:3000
   ```

5. **Haz clic en "Save"**

6. **Vuelve aquí y ejecuta:**
   ```bash
   npm run dev
   ```

---

### Opción B: Usar claves JWT antiguas (si las tienes)

Si tu proyecto tenía claves antes:

1. **Ve a Settings → API**
2. **Busca "Legacy API Keys"** o scroll hacia abajo
3. Si existen claves antiguas con formato `eyJhbGci...`:
   - Cópia la **anon key** → reemplaza en `.env.local`
   - Cópia la **service_role key** → reemplaza en `.env.local`

---

## 🚨 Si sigue sin funcionar

**Ejecuta el diagnóstico:**
```bash
node scripts/setup-supabase.js
```

El script te dirá exactamente qué falta.

---

## 📝 Crear las tablas en Supabase

Después de permitir los hosts:

1. **Ve a SQL Editor en Supabase**
   - https://supabase.com/dashboard/project/vbyjqtxqzecqyedikkms/sql/new

2. **Copia TODO el contenido de `supabase/schema.sql`**

3. **Pégalo en el SQL Editor** y haz clic en ▶ **Run**

4. **Espera a que termine** (debería decir "Success")

---

## 🎯 Resumen del flujo

```
1. Permitir localhost en Supabase API settings ← 👈 AQUÍ ESTÁS
   ↓
2. Ejecutar supabase/schema.sql en SQL Editor
   ↓
3. npm run dev
   ↓
4. Ir a http://localhost:3000
   ↓
5. Registrarse en /register
   ↓
6. ¡A usar FactoryBrain AI! 🚀
```

---

## ❓ Preguntas frecuentes

**P: ¿Dónde veo "Allowed Hostnames"?**
R: En **Settings → API**, bajo "Project API Keys". Si no lo ves, busca "CORS", "Origins" u "Hostnames".

**P: ¿Puedo usar 0.0.0.0:3000 en lugar de localhost?**
R: Sí, pero mejor localhost o 127.0.0.1 explícitamente.

**P: ¿Cómo sé que funcionó?**
R: Intenta registrarte en http://localhost:3000/register. Si puedes crear una cuenta, ¡funcionó! ✅

