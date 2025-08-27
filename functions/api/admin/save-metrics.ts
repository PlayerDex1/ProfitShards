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
    
    if (type === 'calculation') {
      // Para cálculos: usar as colunas específicas que o community-metrics espera
      console.log('📊 INSERINDO CALCULATION:', {
        calculationId, userIdForStats, type,
        investment: sanitizedData.investment || 0,
        finalProfit: sanitizedResults?.finalProfit || 0,
        roi: sanitizedResults?.roi || 0
      });
      
      await env.DB.prepare(`
        INSERT INTO user_calculations (
          id, 
          user_id, 
          calculation_type,
          investment,
          final_profit,
          roi,
          efficiency,
          tokens_equipment,
          tokens_farmed,
          calculation_data, 
          result_data, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        calculationId,
        userIdForStats,
        type,
        sanitizedData.investment || 0,
        sanitizedResults?.finalProfit || 0,
        sanitizedResults?.roi || 0,
        sanitizedResults?.efficiency || 0,
        sanitizedData.tokensEquipment || 0,
        sanitizedData.tokensFarmed || 0,
        JSON.stringify(sanitizedData),
        sanitizedResults ? JSON.stringify(sanitizedResults) : null,
        Date.now()
      ).run();
    } else if (type === 'map_planning') {
      // Para map planning: simular um "lucro" baseado nos tokens
      const simulatedProfit = (data.tokens || 0) * 100; // 1 token = $100 estimado
      const simulatedInvestment = simulatedProfit * 0.7; // simular 70% de eficiência
      const simulatedROI = simulatedInvestment > 0 ? ((simulatedProfit - simulatedInvestment) / simulatedInvestment) * 100 : 0;
      
      console.log('🗺️ INSERINDO MAP_PLANNING:', {
        calculationId, userIdForStats, type,
        tokens: data.tokens || 0,
        simulatedProfit, simulatedInvestment, simulatedROI
      });
      
      await env.DB.prepare(`
        INSERT INTO user_calculations (
          id, 
          user_id, 
          calculation_type,
          investment,
          final_profit,
          roi,
          efficiency,
          tokens_equipment,
          tokens_farmed,
          calculation_data, 
          result_data, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        calculationId,
        userIdForStats,
        type,
        simulatedInvestment,
        simulatedProfit,
        simulatedROI,
        data.efficiency || 0,
        0, // map planning não usa tokens equipment
        data.tokens || 0,
        JSON.stringify(sanitizedData),
        sanitizedResults ? JSON.stringify(sanitizedResults) : null,
        Date.now()
      ).run();
    } else {
      // Fallback para outros tipos
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
    }

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
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro interno do servidor',
      details: error.stack,
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