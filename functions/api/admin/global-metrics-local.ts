import { addSecurityHeaders } from '../../_lib/security';

export async function onRequestGet({ request }: { request: Request }) {
  try {
    console.log('📊 Global metrics local - sem D1');

    // Verificar autenticação básica
    const cookieHeader = request.headers.get('Cookie');
    const hasSession = cookieHeader && cookieHeader.includes('ps_session=');

    if (!hasSession) {
      const response = Response.json({ error: 'Unauthorized' }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Retornar estrutura básica - o frontend vai processar os dados
    const result = {
      success: true,
      message: 'Use localStorage processing',
      useLocalStorage: true,
      totalRuns: 0,
      totalTokens: 0,
      uniqueUsers: 0,
      totalRegisteredUsers: 0,
      luckRanges: [
        { range: '1k - 2k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
        { range: '2k - 3k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
        { range: '3k - 4k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
        { range: '4k - 5k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
        { range: '5k - 6k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
        { range: '6k - 7k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
        { range: '7k - 8k Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
        { range: '8k+ Luck', runs: 0, totalTokens: 0, avgTokens: 0, users: 0 },
      ],
      rawData: []
    };

    console.log('📊 Retornando estrutura para processamento local');

    const response = Response.json(result);
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro em global-metrics-local:', error);
    const response = Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}