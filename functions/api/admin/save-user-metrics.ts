import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('📊 SAVE USER METRICS: Iniciando...');

    // Verificar se DB está disponível
    if (!env.DB) {
      console.log('❌ D1 Database não disponível');
      const response = Response.json({ 
        success: false,
        error: 'Database not available' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    // Verificar autenticação
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      console.log('❌ Cookie não encontrado');
      const response = Response.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
      return addSecurityHeaders(response);
    }

    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('ps_session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      console.log('❌ Sessão não encontrada');
      const response = Response.json({ 
        success: false,
        error: 'No session' 
      }, { status: 401 });
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
      console.log('❌ Sessão inválida ou expirada');
      const response = Response.json({ 
        success: false,
        error: 'Invalid session' 
      }, { status: 401 });
      return addSecurityHeaders(response);
    }

    console.log('✅ Usuário autenticado:', session.email);

    // Parse dos dados
    const body = await request.json();
    const { mapSize, luck, loads, tokensDropped, timestamp } = body;

    console.log('📊 Dados recebidos:', {
      user: session.email,
      mapSize,
      luck,
      loads,
      tokensDropped,
      timestamp
    });

    // Validar dados básicos
    if (!mapSize || !tokensDropped || !timestamp) {
      console.log('❌ Dados inválidos');
      const response = Response.json({ 
        success: false,
        error: 'Missing required fields' 
      }, { status: 400 });
      return addSecurityHeaders(response);
    }

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
        created_at INTEGER NOT NULL
      )
    `).run();

    console.log('✅ Tabela user_map_metrics verificada/criada');

    // Verificar duplicatas
    const existing = await env.DB.prepare(`
      SELECT id FROM user_map_metrics 
      WHERE user_id = ? AND timestamp = ?
    `).bind(session.id, timestamp).first();

    if (existing) {
      console.log('⚠️ Registro já existe, ignorando duplicata');
      const response = Response.json({ 
        success: true,
        message: 'Already exists',
        duplicate: true
      });
      return addSecurityHeaders(response);
    }

    // Preparar dados
    const entryDate = new Date(timestamp);
    const sessionDate = entryDate.toISOString().split('T')[0];
    const recordId = `${session.id}_${timestamp}`;

    const metric = {
      id: recordId,
      user_id: session.id,
      user_email: session.email,
      map_size: mapSize.toLowerCase(),
      luck_value: luck || 0,
      tokens_dropped: tokensDropped,
      loads: loads || 0,
      timestamp: timestamp,
      session_date: sessionDate,
      created_at: Date.now()
    };

    console.log('📊 Preparando para inserir:', metric);

    // Inserir no banco
    const insertResult = await env.DB.prepare(`
      INSERT INTO user_map_metrics (
        id, user_id, user_email, map_size, luck_value, tokens_dropped, 
        loads, timestamp, session_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      metric.id, metric.user_id, metric.user_email, metric.map_size,
      metric.luck_value, metric.tokens_dropped, metric.loads,
      metric.timestamp, metric.session_date, metric.created_at
    ).run();

    console.log('✅ Insert result:', insertResult);

    // Verificar se foi salvo
    const count = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM user_map_metrics WHERE user_email = ?
    `).bind(session.email).first() as { count: number };

    console.log(`📊 Total de registros para ${session.email}:`, count?.count || 0);

    const response = Response.json({
      success: true,
      message: 'Métrica salva com sucesso',
      user: session.email,
      data: metric,
      totalRecords: count?.count || 0
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao salvar métrica:', error);
    const response = Response.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}