import { addSecurityHeaders, checkRateLimit, getClientIP, validateCalculationData } from "../../_lib/security";
import { saveFarmingMetrics, saveMapDropMetrics } from "../../_lib/metrics";

interface Env {
  DB: D1Database;
}

interface MetricsData {
  type: 'calculation' | 'map_planning';
  data: any;
  results?: any;
  userId?: string;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    console.log('📊 METRICS: Salvando métricas anônimas...');

    const body: MetricsData = await request.json();
    const { type, data, results, userId } = body;

    // Obter userId da sessão se disponível (para estatísticas, não identificação)
    const userIdForStats = userId || 'anonymous';

    // Sanitizar dados para remover informações pessoais
    const sanitizedData = {
      ...data,
      // Remove qualquer campo que possa ser pessoal
      email: undefined,
      username: undefined,
      personalInfo: undefined
    };

    const sanitizedResults = results ? {
      ...results,
      // Manter apenas métricas numéricas
      finalProfit: results.finalProfit,
      roi: results.roi,
      efficiency: results.efficiency,
      breakdown: results.breakdown
    } : null;

    // Salvar no banco de dados
    const calculationId = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await env.DB.prepare(`
      INSERT INTO user_calculations (
        id, 
        user_id, 
        calculation_type, 
        calculation_data, 
        result_data, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      calculationId,
      userIdForStats,
      type,
      JSON.stringify(sanitizedData),
      sanitizedResults ? JSON.stringify(sanitizedResults) : null,
      Date.now()
    ).run();

    // Também registrar na tabela de atividade para estatísticas de usuários ativos
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await env.DB.prepare(`
      INSERT INTO user_activity (
        id,
        user_id,
        activity_type,
        activity_data,
        created_at
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      activityId,
      userIdForStats,
      type === 'calculation' ? 'calculation' : 'map_planning',
      JSON.stringify({
        type,
        hasResults: !!results,
        profit: results?.finalProfit || 0,
        roi: results?.roi || 0
      }),
      Date.now()
    ).run();

    console.log('✅ Métricas salvas:', { type, userId: userIdForStats });

    return new Response(JSON.stringify({
      success: true,
      message: 'Métricas salvas com sucesso',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao salvar métricas:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Permitir OPTIONS para CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}