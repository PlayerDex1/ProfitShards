// 🔧 Atualizar Schema da Tabela feed_runs
// Adicionar colunas level, tier, charge

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env }: { env: Env }) {
  try {
    console.log('🔧 Atualizando schema da tabela feed_runs...');

    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database not available'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Adicionar coluna level
    try {
      await env.DB.prepare(`
        ALTER TABLE feed_runs ADD COLUMN level TEXT DEFAULT 'I'
      `).run();
      console.log('✅ Coluna level adicionada');
    } catch (error) {
      console.log('⚠️ Coluna level já existe ou erro:', error);
    }

    // 2. Adicionar coluna tier  
    try {
      await env.DB.prepare(`
        ALTER TABLE feed_runs ADD COLUMN tier TEXT DEFAULT 'I'
      `).run();
      console.log('✅ Coluna tier adicionada');
    } catch (error) {
      console.log('⚠️ Coluna tier já existe ou erro:', error);
    }

    // 3. Adicionar coluna charge
    try {
      await env.DB.prepare(`
        ALTER TABLE feed_runs ADD COLUMN charge INTEGER DEFAULT 0
      `).run();
      console.log('✅ Coluna charge adicionada');
    } catch (error) {
      console.log('⚠️ Coluna charge já existe ou erro:', error);
    }

    // 4. Verificar estrutura final
    const schemaResult = await env.DB.prepare(`
      PRAGMA table_info(feed_runs)
    `).all();

    console.log('📋 Estrutura final da tabela:', schemaResult.results);

    return new Response(JSON.stringify({
      success: true,
      message: 'Schema atualizado com sucesso',
      columns: schemaResult.results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar schema:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet({ env }: { env: Env }) {
  // GET para verificar schema atual
  try {
    if (!env.DB) {
      return new Response('Database not available', { status: 500 });
    }

    const schemaResult = await env.DB.prepare(`
      PRAGMA table_info(feed_runs)
    `).all();

    return new Response(JSON.stringify({
      success: true,
      schema: schemaResult.results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}