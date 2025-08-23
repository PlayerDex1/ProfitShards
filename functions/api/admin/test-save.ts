import { addSecurityHeaders } from '../../_lib/security';
import { createUserHash } from '../../_lib/metrics';

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('🧪 TEST SAVE: Endpoint chamado');

    // Criar tabela se não existir
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS map_drop_metrics (
        id TEXT PRIMARY KEY,
        user_hash TEXT NOT NULL,
        map_name TEXT NOT NULL,
        luck_value REAL NOT NULL,
        loads_completed INTEGER NOT NULL,
        charges_consumed INTEGER NOT NULL,
        tokens_dropped REAL NOT NULL,
        efficiency_tokens_per_load REAL NOT NULL,
        efficiency_tokens_per_charge REAL NOT NULL,
        session_date TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `).run();

    console.log('✅ Tabela criada/verificada');

    // Dados de teste
    const testData = {
      id: crypto.randomUUID(),
      user_hash: 'test123',
      map_name: 'xlarge',
      luck_value: 5000,
      loads_completed: 6,
      charges_consumed: 24,
      tokens_dropped: 150,
      efficiency_tokens_per_load: 25,
      efficiency_tokens_per_charge: 6.25,
      session_date: '2024-08-23',
      created_at: Date.now()
    };

    console.log('📊 Inserindo dados de teste:', testData);

    // Inserir dados de teste
    await env.DB.prepare(`
      INSERT INTO map_drop_metrics (
        id, user_hash, map_name, luck_value, loads_completed, charges_consumed, tokens_dropped,
        efficiency_tokens_per_load, efficiency_tokens_per_charge, session_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      testData.id, testData.user_hash, testData.map_name, testData.luck_value,
      testData.loads_completed, testData.charges_consumed, testData.tokens_dropped, 
      testData.efficiency_tokens_per_load, testData.efficiency_tokens_per_charge, 
      testData.session_date, testData.created_at
    ).run();

    console.log('✅ Dados de teste inseridos com sucesso');

    // Verificar se foi salvo
    const count = await env.DB.prepare(`SELECT COUNT(*) as count FROM map_drop_metrics`).first() as { count: number };
    
    console.log('📊 Total de registros após teste:', count?.count || 0);

    const response = Response.json({
      success: true,
      message: 'Dados de teste salvos com sucesso',
      totalRecords: count?.count || 0,
      testData
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    const response = Response.json({ 
      error: 'Test failed',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}