import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('📊 COLLECT USER DATA: Coletando dados do usuário');

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
      CREATE TABLE IF NOT EXISTS user_map_metrics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        map_size TEXT NOT NULL,
        luck_value REAL NOT NULL,
        tokens_dropped REAL NOT NULL,
        loads INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        session_date TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `).run();

    console.log('✅ Tabela user_map_metrics criada/verificada');

    // Receber dados do localStorage do frontend
    const body = await request.json();
    const { mapDropsData } = body;

    if (!mapDropsData || !Array.isArray(mapDropsData)) {
      const response = Response.json({ 
        error: 'Invalid data format' 
      }, { status: 400 });
      return addSecurityHeaders(response);
    }

    console.log(`📊 Recebidos ${mapDropsData.length} registros do usuário ${session.email}`);

    let savedCount = 0;
    let skippedCount = 0;

    // Processar cada entrada
    for (const entry of mapDropsData) {
      try {
        // Validar dados básicos
        if (!entry.mapSize || !entry.tokensDropped || !entry.timestamp) {
          console.log('⚠️ Entrada inválida, pulando:', entry);
          skippedCount++;
          continue;
        }

        // Verificar se já existe (evitar duplicatas)
        const existing = await env.DB.prepare(`
          SELECT id FROM user_map_metrics 
          WHERE user_id = ? AND timestamp = ?
        `).bind(session.id, entry.timestamp).first();

        if (existing) {
          console.log('⚠️ Registro já existe, pulando');
          skippedCount++;
          continue;
        }

        // Preparar dados para salvar
        const entryDate = new Date(entry.timestamp);
        const sessionDate = entryDate.toISOString().split('T')[0];
        const recordId = `${session.id}_${entry.timestamp}`;

        const metric = {
          id: recordId,
          user_id: session.id,
          user_email: session.email,
          map_size: entry.mapSize,
          luck_value: entry.totalLuck || entry.luck || 0,
          tokens_dropped: entry.tokensDropped,
          loads: entry.loads || 0,
          timestamp: entry.timestamp,
          session_date: sessionDate,
          created_at: Date.now()
        };

        // Salvar no banco
        await env.DB.prepare(`
          INSERT INTO user_map_metrics (
            id, user_id, user_email, map_size, luck_value, tokens_dropped, 
            loads, timestamp, session_date, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          metric.id, metric.user_id, metric.user_email, metric.map_size,
          metric.luck_value, metric.tokens_dropped, metric.loads,
          metric.timestamp, metric.session_date, metric.created_at
        ).run();

        savedCount++;
        console.log(`✅ Métrica salva: ${metric.map_size} - ${metric.tokens_dropped} tokens`);

      } catch (error) {
        console.log('❌ Erro ao salvar entrada:', error);
        skippedCount++;
      }
    }

    console.log(`📊 Processamento concluído: ${savedCount} salvos, ${skippedCount} ignorados`);

    const response = Response.json({
      success: true,
      message: 'Dados coletados com sucesso',
      user: session.email,
      received: mapDropsData.length,
      saved: savedCount,
      skipped: skippedCount
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao coletar dados:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}