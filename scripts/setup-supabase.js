#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

console.log('🚀 Configurando FactoryBrain AI en Supabase...\n');
console.log(`📍 Proyecto: ${supabaseUrl}\n`);

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupSupabase() {
  try {
    // 1. Test conexión
    console.log('✓ Conectando a Supabase...');
    const { data: tables, error: tablesError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);

    if (tablesError && tablesError.code === 'PGRST116') {
      console.log('⚠️  Tabla "documents" no existe. Necesito crear las tablas.\n');
      await createTables();
    } else if (tablesError && tablesError.code !== 'PGRST116') {
      console.error('❌ Error de conexión:', tablesError.message);
      process.exit(1);
    } else {
      console.log('✓ Tabla "documents" existe\n');
    }

    // 2. Verificar storage bucket
    console.log('✓ Verificando Storage bucket "documents"...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Error al listar buckets:', bucketsError.message);
    } else {
      const documentsBucket = buckets?.find(b => b.name === 'documents');
      if (documentsBucket) {
        console.log('✓ Bucket "documents" existe\n');
      } else {
        console.log('⚠️  Bucket "documents" no existe.\n');
        await createBucket();
      }
    }

    // 3. Permitir localhost
    console.log('✓ Configuración de hosts permitidos...');
    console.log('  → localhost:3000 debe estar en Supabase Settings → API → Allowed Hosts\n');

    console.log('✅ Configuración completada\n');
    console.log('📋 Próximos pasos:');
    console.log('  1. Ve a Supabase → Settings → API → "Allowed Hostnames"');
    console.log('  2. Añade: localhost:3000');
    console.log('  3. Guarda cambios');
    console.log('  4. Ejecuta: npm run dev\n');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    process.exit(1);
  }
}

async function createTables() {
  console.log('📝 Creando tablas en Supabase...');
  console.log('\n⚠️  No puedo ejecutar SQL remotamente. Haz esto manualmente:\n');
  console.log('1. Ve a Supabase Dashboard → SQL Editor');
  console.log('2. Copia y ejecuta el contenido de: supabase/schema.sql');
  console.log('3. Vuelve aquí y ejecuta: node scripts/setup-supabase.js\n');
  process.exit(0);
}

async function createBucket() {
  console.log('📝 Creando bucket "documents"...');
  try {
    const { data, error } = await supabase.storage.createBucket('documents', {
      public: false,
      fileSizeLimit: 20971520, // 20 MB
      allowedMimeTypes: [
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
    });

    if (error) {
      console.error('❌ Error al crear bucket:', error.message);
    } else {
      console.log('✓ Bucket "documents" creado\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupSupabase();
