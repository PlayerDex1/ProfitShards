import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('💰 SEED PROFIT DATA: Populando dados de exemplo de lucros');

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

    // Gerar dados de exemplo
    const sampleData = [];
    const levels = ['I', 'II', 'III', 'IV', 'V'];
    const tiers = ['I', 'II', 'III', 'IV', 'V'];
    const mapSizes = ['small', 'medium', 'large', 'xlarge'];
    
    // Gerar 50 registros de exemplo dos últimos 7 dias
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000);
      
      const tokenPrice = 0.5 + Math.random() * 2; // 0.5 a 2.5
      const tokensFarmed = 1000 + Math.random() * 10000; // 1000 a 11000
      const totalProfit = tokensFarmed * tokenPrice;
      const efficiency = 60 + Math.random() * 40; // 60% a 100%
      
      sampleData.push({
        id: `sample_${i}_${timestamp}`,
        user_id: session.id,
        user_email: session.email,
        token_price: Math.round(tokenPrice * 100) / 100,
        tokens_farmed: Math.round(tokensFarmed),
        total_profit: Math.round(totalProfit * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        level: levels[Math.floor(Math.random() * levels.length)],
        tier: tiers[Math.floor(Math.random() * tiers.length)],
        luck: Math.round((50 + Math.random() * 50) * 100) / 100, // 50 a 100
        charge: Math.round((80 + Math.random() * 20) * 100) / 100, // 80 a 100
        map_size: mapSizes[Math.floor(Math.random() * mapSizes.length)],
        timestamp: timestamp,
        created_at: timestamp
      });
    }

    // Inserir dados de exemplo
    let insertedCount = 0;
    for (const data of sampleData) {
      try {
        await env.DB.prepare(`
          INSERT INTO profit_calculations (
            id, user_id, user_email, token_price, tokens_farmed, total_profit,
            efficiency, level, tier, luck, charge, map_size, timestamp, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          data.id, data.user_id, data.user_email, data.token_price, data.tokens_farmed,
          data.total_profit, data.efficiency, data.level, data.tier, data.luck,
          data.charge, data.map_size, data.timestamp, data.created_at
        ).run();
        insertedCount++;
      } catch (error) {
        console.log('⚠️ Erro ao inserir registro:', error);
      }
    }

    console.log(`✅ ${insertedCount} registros de exemplo inseridos`);

    const response = Response.json({
      success: true,
      message: 'Dados de exemplo de lucros criados com sucesso',
      inserted: insertedCount,
      total: sampleData.length
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao criar dados de exemplo:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}