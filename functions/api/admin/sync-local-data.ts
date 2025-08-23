import { addSecurityHeaders, checkRateLimit, getClientIP } from "../../_lib/security";
import { createUserHash } from "../../_lib/metrics";

export interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(env, clientIP, 'api', request);
    
    if (!rateLimitResult.allowed) {
      const response = Response.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
      return addSecurityHeaders(response);
    }

    // Verificar autenticação
    const cookie = request.headers.get('Cookie');
    if (!cookie) {
      const response = Response.json({ error: 'Authentication required' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    const sessionMatch = cookie.match(/ps_session=([^;]+)/);
    if (!sessionMatch) {
      const response = Response.json({ error: 'Invalid session' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Verificar se a sessão é válida
    const sessionId = sessionMatch[1];
    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > ?'
    ).bind(sessionId, Date.now()).first() as { user_id: string } | null;

    if (!session) {
      const response = Response.json({ error: 'Session expired' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Verificar se o usuário é admin
    const user = await env.DB.prepare(
      'SELECT email FROM users WHERE id = ?'
    ).bind(session.user_id).first() as { email: string } | null;

    const adminEmails = ['profitshards@gmail.com', 'admin@profitshards.com', 'holdboy01@gmail.com'];
    const isAdmin = user && adminEmails.includes(user.email);

    if (!isAdmin) {
      const response = Response.json({ error: 'Admin access required' }, { status: 403 });
      return addSecurityHeaders(response);
    }

    // Parse do body para obter dados do histórico local
    const body = await request.json();
    const { historyData } = body;

    if (!historyData || !Array.isArray(historyData)) {
      const response = Response.json({ error: 'Invalid history data' }, { status: 400 });
      return addSecurityHeaders(response);
    }

    console.log('📊 Sync local data - recebidos:', historyData.length, 'registros');

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

    let savedCount = 0;
    let skippedCount = 0;

    // Processar cada entrada do histórico
    for (const entry of historyData) {
      try {
        console.log('🔍 Processando entrada:', JSON.stringify(entry, null, 2));
        
        // Validar dados obrigatórios
        if (!entry.userEmail) {
          console.log('❌ Ignorado: userEmail ausente');
          skippedCount++;
          continue;
        }
        
        if (!entry.mapSize) {
          console.log('❌ Ignorado: mapSize ausente');
          skippedCount++;
          continue;
        }
        
        if (!entry.tokensDropped && entry.tokensDropped !== 0) {
          console.log('❌ Ignorado: tokensDropped ausente');
          skippedCount++;
          continue;
        }
        
        if (!entry.loads && entry.loads !== 0) {
          console.log('❌ Ignorado: loads ausente');
          skippedCount++;
          continue;
        }
        
        if (!entry.timestamp) {
          console.log('❌ Ignorado: timestamp ausente');
          skippedCount++;
          continue;
        }

        // Normalizar campo luck (pode vir como 'luck' ou 'totalLuck')
        const luckValue = entry.luck || entry.totalLuck || 0;
        console.log('✅ Luck normalizado:', entry.luck, '||', entry.totalLuck, '→', luckValue);

        console.log('✅ Validação básica passou para:', entry.userEmail);

        // Buscar usuário no banco
        const targetUser = await env.DB.prepare(
          'SELECT id FROM users WHERE email = ?'
        ).bind(entry.userEmail).first() as { id: string } | null;

        if (!targetUser) {
          console.log('❌ Usuário não encontrado no banco:', entry.userEmail);
          skippedCount++;
          continue;
        }

        console.log('✅ Usuário encontrado:', entry.userEmail, '→', targetUser.id);

        // Gerar hash do usuário
        const userHash = createUserHash(targetUser.id);
        console.log('✅ Hash gerado:', userHash);

        // Calcular cargas baseado no tipo de mapa
        const chargesPerMap = {
          small: 4,    // 1 carga × 4 equipamentos
          medium: 8,   // 2 cargas × 4 equipamentos  
          large: 16,   // 4 cargas × 4 equipamentos
          xlarge: 24   // 6 cargas × 4 equipamentos
        };

        const mapName = (entry.mapSize || 'medium').toLowerCase();
        const chargesConsumed = chargesPerMap[mapName] || chargesPerMap.medium;
        console.log('✅ Mapa processado:', entry.mapSize, '→', mapName, '→', chargesConsumed, 'cargas');

        // Converter timestamp para data
        const entryDate = new Date(entry.timestamp);
        const sessionDate = entryDate.toISOString().split('T')[0]; // YYYY-MM-DD
        console.log('✅ Data processada:', entry.timestamp, '→', sessionDate);

        // Verificar se já existe registro idêntico
        const existingRecord = await env.DB.prepare(`
          SELECT id FROM map_drop_metrics 
          WHERE user_hash = ? AND created_at = ?
        `).bind(userHash, entry.timestamp).first();

        if (existingRecord) {
          console.log('⚠️ Registro já existe (duplicado):', userHash, entry.timestamp);
          skippedCount++;
          continue; // Pular duplicados
        }

        console.log('✅ Não é duplicado, preparando para salvar...');

        // Criar métrica
        const metrics = {
          id: crypto.randomUUID(),
          user_hash: userHash,
          map_name: mapName,
          luck_value: luckValue,
          loads_completed: entry.loads || 0,
          charges_consumed: chargesConsumed,
          tokens_dropped: entry.tokensDropped || 0,
          efficiency_tokens_per_load: (entry.tokensDropped || 0) / Math.max(entry.loads || 1, 1),
          efficiency_tokens_per_charge: (entry.tokensDropped || 0) / Math.max(chargesConsumed, 1),
          session_date: sessionDate,
          created_at: entry.timestamp
        };

        console.log('📊 Métrica preparada:', JSON.stringify(metrics, null, 2));

        // Salvar no banco
        await env.DB.prepare(`
          INSERT INTO map_drop_metrics (
            id, user_hash, map_name, luck_value, loads_completed, charges_consumed, tokens_dropped,
            efficiency_tokens_per_load, efficiency_tokens_per_charge, session_date, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          metrics.id, metrics.user_hash, metrics.map_name, metrics.luck_value,
          metrics.loads_completed, metrics.charges_consumed, metrics.tokens_dropped, 
          metrics.efficiency_tokens_per_load, metrics.efficiency_tokens_per_charge, 
          metrics.session_date, metrics.created_at
        ).run();

        savedCount++;
        console.log('✅ SALVO COM SUCESSO:', entry.userEmail, mapName, entry.tokensDropped, 'tokens');

      } catch (error) {
        console.error('❌ Erro ao processar entrada:', error);
        console.error('❌ Entrada que causou erro:', JSON.stringify(entry, null, 2));
        skippedCount++;
      }
    }

    const result = {
      timestamp: new Date().toISOString(),
      admin_user: user.email,
      action: 'sync_local_data',
      total_received: historyData.length,
      saved_count: savedCount,
      skipped_count: skippedCount,
      success: savedCount > 0,
      message: `Sincronizados ${savedCount} registros do histórico local para métricas admin`
    };

    console.log('🔄 Sync result:', result);
    
    const response = Response.json(result);
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Sync local data error:', error);
    const response = Response.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}