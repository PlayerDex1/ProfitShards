import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

interface ProfitData {
  user_email: string;
  token_price: number;
  tokens_farmed: number;
  total_profit: number;
  efficiency: number;
  level: string;
  tier: string;
  luck: number;
  charge: number;
  map_size: string;
  timestamp: number;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('💰 SAVE PROFIT DATA: Salvando dados de lucro da calculadora');

    // Verificar se DB existe
    if (!env.DB) {
      const response = Response.json({ 
        error: 'Database not available' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    // Verificar autenticação
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      const response = Response.json({ error: 'Unauthorized' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('ps_session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      const response = Response.json({ error: 'No session' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Buscar usuário pela sessão
    const session = await env.DB.prepare(`
      SELECT u.id, u.email 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.session_id = ? AND s.expires_at > ?
    `).bind(sessionCookie, Date.now()).first() as { id: string; email: string } | null;

    if (!session) {
      const response = Response.json({ error: 'Invalid session' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    console.log('✅ Usuário autenticado:', session.email);

    // Criar tabela se não existir
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS profit_calculations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        token_price REAL NOT NULL,
        tokens_farmed REAL NOT NULL,
        total_profit REAL NOT NULL,
        efficiency REAL NOT NULL,
        level TEXT NOT NULL,
        tier TEXT NOT NULL,
        luck REAL NOT NULL,
        charge REAL NOT NULL,
        map_size TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `).run();

    console.log('✅ Tabela profit_calculations criada/verificada');

    // Receber dados do frontend
    const body = await request.json();
    const { profitData } = body;

    if (!profitData) {
      const response = Response.json({ 
        error: 'Invalid data format' 
      }, { status: 400 });
      return addSecurityHeaders(response);
    }

    console.log(`💰 Recebidos dados de lucro do usuário ${session.email}`);

    // Verificar se já existe um cálculo similar recente (evitar duplicatas)
    const existing = await env.DB.prepare(`
      SELECT id FROM profit_calculations 
      WHERE user_id = ? AND timestamp = ? AND total_profit = ?
    `).bind(session.id, profitData.timestamp, profitData.total_profit).first();

    if (existing) {
      console.log('⚠️ Cálculo de lucro já existe, pulando...');
      const response = Response.json({
        success: true,
        message: 'Cálculo já existe',
        duplicate: true
      });
      return addSecurityHeaders(response);
    }

    // Preparar dados para salvar
    const recordId = `${session.id}_${profitData.timestamp}_${Date.now()}`;

    const profitRecord = {
      id: recordId,
      user_id: session.id,
      user_email: session.email,
      token_price: profitData.token_price || 0,
      tokens_farmed: profitData.tokens_farmed || 0,
      total_profit: profitData.total_profit || 0,
      efficiency: profitData.efficiency || 0,
      level: profitData.level || 'Unknown',
      tier: profitData.tier || 'Unknown',
      luck: profitData.luck || 0,
      charge: profitData.charge || 0,
      map_size: profitData.map_size || 'Unknown',
      timestamp: profitData.timestamp,
      created_at: Date.now()
    };

    // Salvar no banco
    await env.DB.prepare(`
      INSERT INTO profit_calculations (
        id, user_id, user_email, token_price, tokens_farmed, total_profit,
        efficiency, level, tier, luck, charge, map_size, timestamp, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      profitRecord.id, profitRecord.user_id, profitRecord.user_email,
      profitRecord.token_price, profitRecord.tokens_farmed, profitRecord.total_profit,
      profitRecord.efficiency, profitRecord.level, profitRecord.tier,
      profitRecord.luck, profitRecord.charge, profitRecord.map_size,
      profitRecord.timestamp, profitRecord.created_at
    ).run();

    console.log(`✅ Dados de lucro salvos: ${profitRecord.total_profit} tokens`);

    const response = Response.json({
      success: true,
      message: 'Dados de lucro salvos com sucesso',
      user: session.email,
      profit: profitRecord.total_profit
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao salvar dados de lucro:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}