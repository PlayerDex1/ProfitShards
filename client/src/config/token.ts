// 🚀 CONFIGURAÇÃO DO TOKEN WORLDSHARDS 🚀
// Este arquivo será usado quando o token for lançado

export const TOKEN_CONFIG = {
  // PLACEHOLDER - Implementar quando token for lançado
  name: 'WorldShards',
  symbol: 'WORLDSHARDS', 
  
  // Preço atual (TEMPORÁRIO - $1 fixo)
  currentPrice: 1.0,
  
  // APIs para implementar no futuro:
  // coingeckoId: 'worldshards',
  // coinmarketcapId: 'XXXXX',
  // priceApiEndpoint: 'https://api.exemplo.com/price',
  
  // Configurações de atualização
  updateInterval: 60, // minutos
  cacheTime: 3600, // segundos
  
  // Fallbacks
  fallbackPrice: 1.0,
  
  // Status
  isLive: false, // Mudar para true quando token for lançado
  priceSource: 'STATIC' // 'STATIC' | 'COINGECKO' | 'COINMARKETCAP' | 'API'
};

// 🎯 FUNÇÃO PRINCIPAL - Buscar preço do token
export async function getTokenPrice(): Promise<number> {
  // TEMPORÁRIO: Retorna $1 fixo
  if (!TOKEN_CONFIG.isLive) {
    return TOKEN_CONFIG.currentPrice;
  }
  
  // TODO: Implementar APIs reais aqui quando token for lançado
  // switch (TOKEN_CONFIG.priceSource) {
  //   case 'COINGECKO':
  //     return await fetchFromCoinGecko();
  //   case 'COINMARKETCAP':
  //     return await fetchFromCoinMarketCap();
  //   case 'API':
  //     return await fetchFromCustomAPI();
  //   default:
  //     return TOKEN_CONFIG.fallbackPrice;
  // }
  
  return TOKEN_CONFIG.currentPrice;
}

// 📝 COMENTÁRIOS PARA IMPLEMENTAÇÃO FUTURA:
/*
async function fetchFromCoinGecko(): Promise<number> {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${TOKEN_CONFIG.coingeckoId}&vs_currencies=usd`
  );
  const data = await response.json();
  return data[TOKEN_CONFIG.coingeckoId]?.usd || TOKEN_CONFIG.fallbackPrice;
}

async function fetchFromCoinMarketCap(): Promise<number> {
  // Implementar com API key da CoinMarketCap
  return TOKEN_CONFIG.fallbackPrice;
}

async function fetchFromCustomAPI(): Promise<number> {
  const response = await fetch(TOKEN_CONFIG.priceApiEndpoint);
  const data = await response.json();
  return data.price || TOKEN_CONFIG.fallbackPrice;
}
*/