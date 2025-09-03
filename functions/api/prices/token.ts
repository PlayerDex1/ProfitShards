// Cache para evitar chamadas excessivas à API externa
const PRICE_CACHE = {
  price: null as number | null,
  lastUpdate: 0,
  cacheDuration: 2 * 60 * 1000, // 2 minutos (reduzido de 5 para 2)
};

export async function onRequest() {
  try {
    const now = Date.now();
    
    // Verificar se temos um cache válido
    if (PRICE_CACHE.price && (now - PRICE_CACHE.lastUpdate) < PRICE_CACHE.cacheDuration) {
      console.log('💰 [TOKEN PRICE] Returning cached price:', PRICE_CACHE.price);
      return new Response(JSON.stringify({
        success: true,
        price: PRICE_CACHE.price,
        cached: true,
        lastUpdate: PRICE_CACHE.lastUpdate,
        source: 'CoinGecko (cached)'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=120', // 2 minutos (120 segundos)
        }
      });
    }

    // Buscar preço atual do CoinGecko
    console.log('🔍 [TOKEN PRICE] Fetching fresh price from CoinGecko...');
    
    // Pudgy Penguins Token ID no CoinGecko para teste
    const tokenId = 'pudgy-penguins';
    let price = null;
    let source = 'CoinGecko';
    
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WorldShards-Calculator/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data[tokenId] && data[tokenId].usd) {
          price = data[tokenId].usd;
          source = `CoinGecko (${tokenId})`;
          console.log(`✅ [TOKEN PRICE] Found price for Pudgy Penguins:`, price);
        }
      }
    } catch (err) {
      console.log(`⚠️ [TOKEN PRICE] Failed to fetch price for ${tokenId}:`, err);
    }
    
    // Se não encontrou preço, usar fallback
    if (!price) {
      // Fallback para um preço estimado baseado em dados históricos
      const fallbackPrice = 0.042; // Preço base estimado
      console.log('⚠️ [TOKEN PRICE] No price found, using fallback price:', fallbackPrice);
      
      PRICE_CACHE.price = fallbackPrice;
      PRICE_CACHE.lastUpdate = now;
      
      return new Response(JSON.stringify({
        success: true,
        price: fallbackPrice,
        cached: false,
        fallback: true,
        lastUpdate: now,
        source: 'Fallback (estimated)',
        note: 'Token not found on CoinGecko, using estimated price'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=120', // 2 minutos (120 segundos)
        }
      });
    }

    // Atualizar cache
    PRICE_CACHE.price = price;
    PRICE_CACHE.lastUpdate = now;
    
    console.log('✅ [TOKEN PRICE] Price updated successfully:', price);
    
    return new Response(JSON.stringify({
      success: true,
      price: price,
      cached: false,
      lastUpdate: now,
      source: source
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120', // 2 minutos (120 segundos)
      }
    });

  } catch (error) {
    console.error('❌ [TOKEN PRICE] Error fetching price:', error);
    
    // Em caso de erro, retornar preço fallback se disponível
    if (PRICE_CACHE.price) {
      console.log('🔄 [TOKEN PRICE] Returning last known price due to error');
      return new Response(JSON.stringify({
        success: true,
        price: PRICE_CACHE.price,
        cached: true,
        error: 'Using cached price due to API error',
        lastUpdate: PRICE_CACHE.lastUpdate,
        source: 'CoinGecko (cached, error fallback)'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=120', // 2 minutos (120 segundos)
        }
      });
    }
    
    // Último recurso: preço padrão
    const defaultPrice = 0.042;
    console.log('🆘 [TOKEN PRICE] Using default price due to complete failure');
    
    return new Response(JSON.stringify({
      success: false,
      price: defaultPrice,
      error: 'Failed to fetch price, using default',
      lastUpdate: now,
      source: 'Default (error fallback)'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120', // 2 minutos (120 segundos)
      }
    });
  }
}