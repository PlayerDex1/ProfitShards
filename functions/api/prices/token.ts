import { json } from '@sveltejs/kit';

// Cache para evitar chamadas excessivas à API externa
const PRICE_CACHE = {
  price: null as number | null,
  lastUpdate: 0,
  cacheDuration: 5 * 60 * 1000, // 5 minutos
};

export async function GET() {
  try {
    const now = Date.now();
    
    // Verificar se temos um cache válido
    if (PRICE_CACHE.price && (now - PRICE_CACHE.lastUpdate) < PRICE_CACHE.cacheDuration) {
      console.log('💰 [TOKEN PRICE] Returning cached price:', PRICE_CACHE.price);
      return json({
        success: true,
        price: PRICE_CACHE.price,
        cached: true,
        lastUpdate: PRICE_CACHE.lastUpdate,
        source: 'CoinGecko (cached)'
      });
    }

    // Buscar preço atual do CoinGecko
    console.log('🔍 [TOKEN PRICE] Fetching fresh price from CoinGecko...');
    
    // WorldShards Token ID no CoinGecko (pode precisar ser ajustado)
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=worldshards&vs_currencies=usd', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WorldShards-Calculator/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Verificar se temos o preço
    if (!data.worldshards || !data.worldshards.usd) {
      // Fallback para um preço estimado baseado em dados históricos
      const fallbackPrice = 0.042; // Preço base estimado
      console.log('⚠️ [TOKEN PRICE] Using fallback price:', fallbackPrice);
      
      PRICE_CACHE.price = fallbackPrice;
      PRICE_CACHE.lastUpdate = now;
      
      return json({
        success: true,
        price: fallbackPrice,
        cached: false,
        fallback: true,
        lastUpdate: now,
        source: 'Fallback (estimated)'
      });
    }

    const price = data.worldshards.usd;
    
    // Atualizar cache
    PRICE_CACHE.price = price;
    PRICE_CACHE.lastUpdate = now;
    
    console.log('✅ [TOKEN PRICE] Price updated successfully:', price);
    
    return json({
      success: true,
      price: price,
      cached: false,
      lastUpdate: now,
      source: 'CoinGecko'
    });

  } catch (error) {
    console.error('❌ [TOKEN PRICE] Error fetching price:', error);
    
    // Em caso de erro, retornar preço fallback se disponível
    if (PRICE_CACHE.price) {
      console.log('🔄 [TOKEN PRICE] Returning last known price due to error');
      return json({
        success: true,
        price: PRICE_CACHE.price,
        cached: true,
        error: 'Using cached price due to API error',
        lastUpdate: PRICE_CACHE.lastUpdate,
        source: 'CoinGecko (cached, error fallback)'
      });
    }
    
    // Último recurso: preço padrão
    const defaultPrice = 0.042;
    console.log('🆘 [TOKEN PRICE] Using default price due to complete failure');
    
    return json({
      success: false,
      price: defaultPrice,
      error: 'Failed to fetch price, using default',
      lastUpdate: now,
      source: 'Default (error fallback)'
    });
  }
}