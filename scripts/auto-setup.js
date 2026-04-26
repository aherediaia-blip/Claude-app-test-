#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🚀 Auto-configurando FactoryBrain AI\n');

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setup() {
  try {
    // 1. Crear bucket
    console.log('📦 Creando bucket "documents"...');
    try {
      const { data } = await supabase.storage.createBucket('documents', {
        public: false,
        fileSizeLimit: 20971520,
        allowedMimeTypes: [
          'application/pdf', 'text/plain', 'text/csv',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ]
      });
      console.log('✅ Bucket creado\n');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✅ Bucket ya existe\n');
      } else {
        throw err;
      }
    }

    // 2. Ejecutar schema SQL
    console.log('🗄️  Creando tablas y RLS...');
    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Dividir en queries individuales
    const queries = schema
      .split(';')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('--'));

    let successCount = 0;
    for (const query of queries) {
      try {
        const { error } = await supabase.rpc('execute_sql', { sql: query });
        if (!error) successCount++;
      } catch (err) {
        // Intentar directamente con fetch
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql: query })
          });
          if (response.ok) successCount++;
        } catch { }
      }
    }

    if (successCount > 0) {
      console.log(`✅ Tablas creadas (${successCount} queries ejecutadas)\n`);
    } else {
      console.log('⚠️  No se ejecutaron queries de forma remota\n');
      console.log('📋 Solución manual:');
      console.log('  1. Ve a: https://supabase.com/dashboard/project/vbyjqtxqzecqyedikkms/sql/new');
      console.log('  2. Copia TODO el contenido de: supabase/schema.sql');
      console.log('  3. Pégalo en el editor');
      console.log('  4. Haz clic en ▶ Run\n');
      return;
    }

    // 3. Test de conexión
    console.log('🧪 Verificando conexión...');
    const { error: testError } = await supabase
      .from('documents')
      .select('count', { count: 'exact' })
      .limit(0);

    if (testError && testError.code !== 'PGRST116') {
      console.error(`❌ Error: ${testError.message}`);
      console.log('\n⚠️  Falta permitir localhost en Supabase:');
      console.log('  1. Ve a: https://supabase.com/dashboard/project/vbyjqtxqzecqyedikkms/settings/api');
      console.log('  2. En "Allowed Hostnames" añade: localhost:3000');
      console.log('  3. Haz clic en Save\n');
      return;
    }

    console.log('✅ Conexión verificada\n');

    console.log('═══════════════════════════════════════════════');
    console.log('✅ ¡FactoryBrain AI configurado completamente!');
    console.log('═══════════════════════════════════════════════\n');
    console.log('Ahora ejecuta:');
    console.log('  npm run dev\n');
    console.log('Abre: http://localhost:3000\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Solución manual:');
    console.log('  1. Ve a Supabase Dashboard');
    console.log('  2. SQL Editor');
    console.log('  3. Ejecuta el contenido de supabase/schema.sql');
    console.log('  4. Settings → API → Añade localhost:3000 a Allowed Hostnames');
    process.exit(1);
  }
}

setup();
