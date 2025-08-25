// 🧪 ENDPOINT PARA CONTROLAR SIMULAÇÃO DO FEED
import { addSecurityHeaders, checkRateLimit, getClientIP } from "../../_lib/security";

interface Env {
  DB: D1Database;
  KV?: KVNamespace;
}

interface SimulationConfig {
  duration: number;      // minutos
  intensity: 'low' | 'medium' | 'high' | 'burst';
  agents: string[];      // IDs dos agentes a usar
  mapTypes: string[];    // Tipos de mapa a simular
  luckRange: [number, number];
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(env, clientIP, 'strict', request);
    
    if (!rateLimitResult.allowed) {
      const response = Response.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
      return addSecurityHeaders(response);
    }

    // Verificar autenticação admin
    const cookieHeader = request.headers.get('Cookie');
    const sessionCookie = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith('ps_session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      const response = Response.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Verificar se é admin
    const session = await env.DB.prepare(`
      SELECT u.email 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.session_id = ? AND s.expires_at > ?
    `).bind(sessionCookie, Date.now()).first() as { email: string } | null;

    const adminEmails = ['holdboy01@gmail.com', 'profitshards@gmail.com'];
    const isAdmin = session && adminEmails.includes(session.email);

    if (!isAdmin) {
      const response = Response.json({ 
        success: false,
        error: 'Admin access required' 
      }, { status: 403 });
      return addSecurityHeaders(response);
    }

    console.log('🧪 FEED SIMULATION: Admin autorizado:', session.email);

    // Parse da configuração
    const config: SimulationConfig = await request.json();
    
    // Validar configuração
    if (!config.duration || config.duration < 1 || config.duration > 120) {
      const response = Response.json({ 
        success: false,
        error: 'Duration must be between 1-120 minutes' 
      }, { status: 400 });
      return addSecurityHeaders(response);
    }

    console.log('📊 Configuração da simulação:', config);

    // Gerar dados de simulação
    const simulationData = await generateSimulationData(config);
    
    // Salvar runs simuladas no banco
    let savedRuns = 0;
    for (const run of simulationData) {
      try {
        await env.DB.prepare(`
          INSERT INTO user_map_drops (
            id, user_id, map_name, map_size, drop_data, tokens_earned, 
            time_spent, efficiency_rating, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          run.agentId,
          run.mapSize,
          run.mapSize,
          JSON.stringify({
            luck: run.luck,
            loads: run.loads,
            energyCost: run.energyCost,
            source: 'simulation',
            timestamp: run.timestamp
          }),
          run.tokensDropped,
          run.timeSpent || 0,
          run.efficiency,
          run.timestamp
        ).run();
        
        savedRuns++;
      } catch (error) {
        console.error('❌ Erro salvando run simulada:', error);
      }
    }

    console.log(`✅ Simulação concluída: ${savedRuns}/${simulationData.length} runs salvas`);

    const response = Response.json({
      success: true,
      message: `Feed simulation completed`,
      config: config,
      runsGenerated: simulationData.length,
      runsSaved: savedRuns,
      duration: config.duration,
      intensity: config.intensity,
      startTime: new Date().toISOString()
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro na simulação do feed:', error);
    const response = Response.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}

async function generateSimulationData(config: SimulationConfig) {
  const runs = [];
  const intensityMultiplier = {
    low: 0.5,
    medium: 1.0,
    high: 2.0,
    burst: 5.0
  }[config.intensity];

  const totalRuns = Math.ceil(config.duration * intensityMultiplier * 2); // Base: 2 runs per minute
  
  console.log(`🎯 Gerando ${totalRuns} runs para ${config.duration} minutos (${config.intensity})`);

  for (let i = 0; i < totalRuns; i++) {
    const agentId = config.agents[Math.floor(Math.random() * config.agents.length)] 
                   || `sim-agent-${Math.floor(Math.random() * 20) + 1}`;
    
    const mapSize = config.mapTypes[Math.floor(Math.random() * config.mapTypes.length)] 
                   || ['small', 'medium', 'large', 'xlarge'][Math.floor(Math.random() * 4)];
    
    const luck = Math.floor(Math.random() * (config.luckRange[1] - config.luckRange[0])) + config.luckRange[0];
    
    // Calcular dados realistas
    const loads = getLoadsForMap(mapSize);
    const efficiency = calculateEfficiency(luck, mapSize);
    const tokensDropped = Math.round(loads * efficiency * (0.8 + Math.random() * 0.4));
    
    // Timestamp distribuído ao longo da duração
    const minuteOffset = (i / totalRuns) * config.duration;
    const timestamp = Date.now() - (config.duration - minuteOffset) * 60 * 1000;

    runs.push({
      agentId,
      mapSize,
      luck,
      loads,
      tokensDropped,
      efficiency,
      energyCost: loads,
      timeSpent: Math.floor(Math.random() * 30) + 10, // 10-40 min
      timestamp: Math.floor(timestamp)
    });
  }

  return runs.sort((a, b) => a.timestamp - b.timestamp);
}

function getLoadsForMap(mapSize: string): number {
  const loads = {
    small: 4,
    medium: 8,
    large: 16,
    xlarge: 24
  };
  return loads[mapSize] || 8;
}

function calculateEfficiency(luck: number, mapSize: string): number {
  const baseEfficiency = {
    small: 1.2,
    medium: 1.8,
    large: 2.5,
    xlarge: 3.2
  };
  
  const luckBonus = luck / 1000;
  const base = baseEfficiency[mapSize] || 1.8;
  
  return Math.round((base + luckBonus) * 100) / 100;
}

// GET endpoint para status e configurações
export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    // Verificar últimas simulações
    const recentSims = await env.DB.prepare(`
      SELECT user_id, COUNT(*) as runs, MAX(created_at) as last_run
      FROM user_map_drops 
      WHERE user_id LIKE 'sim-agent-%' OR user_id LIKE 'bc-test-%'
      GROUP BY user_id
      ORDER BY last_run DESC
      LIMIT 10
    `).all();

    const response = Response.json({
      success: true,
      message: 'Feed simulation endpoint',
      recentSimulations: recentSims.results || [],
      availableIntensities: ['low', 'medium', 'high', 'burst'],
      availableMapTypes: ['small', 'medium', 'large', 'xlarge'],
      exampleConfig: {
        duration: 30,
        intensity: 'medium',
        agents: ['bc-test-001', 'bc-test-002', 'bc-test-003'],
        mapTypes: ['medium', 'large'],
        luckRange: [100, 500]
      }
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro no GET simulation:', error);
    const response = Response.json({ 
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}