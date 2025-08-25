interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { env: Env; request: Request }) {
  console.log('🧪 MINIMAL TEST: Iniciando...');
  
  try {
    const { env } = context;
    
    // Verificar se DB existe
    if (!env.DB) {
      console.log('❌ DB não existe');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'No DB',
        step: 'db_check'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ DB existe');
    
    // Testar query simples primeiro
    try {
      const testQuery = await env.DB.prepare('SELECT 1 as test').first();
      console.log('✅ Query teste OK:', testQuery);
    } catch (queryError) {
      console.log('❌ Erro query teste:', queryError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Query test failed',
        details: queryError instanceof Error ? queryError.message : 'Unknown query error',
        step: 'query_test'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verificar se tabela existe
    try {
      const tableExists = await env.DB.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='user_map_drops'
      `).first();
      
      console.log('🔍 Tabela existe?', !!tableExists, tableExists);
      
      if (!tableExists) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Table user_map_drops does not exist',
          step: 'table_check'
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (tableError) {
      console.log('❌ Erro verificando tabela:', tableError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Table check failed',
        details: tableError instanceof Error ? tableError.message : 'Unknown table error',
        step: 'table_check'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Testar INSERT simples
    try {
      const testData = {
        id: `test_${Date.now()}`,
        user_id: 'test-user',
        map_name: 'medium',
        map_size: 'medium',
        tokens_earned: 100,
        efficiency_rating: 12.5,
        drop_data: '{"test": true}',
        time_spent: 0,
        created_at: Date.now()
      };
      
      console.log('💾 Testando INSERT:', testData);
      
      const result = await env.DB.prepare(`
        INSERT INTO user_map_drops (
          id, user_id, map_name, map_size, tokens_earned, 
          efficiency_rating, drop_data, time_spent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        testData.id,
        testData.user_id,
        testData.map_name,
        testData.map_size,
        testData.tokens_earned,
        testData.efficiency_rating,
        testData.drop_data,
        testData.time_spent,
        testData.created_at
      ).run();
      
      console.log('✅ INSERT OK:', result);
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Test insert successful',
        data: testData,
        result: result,
        step: 'insert_success'
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (insertError) {
      console.log('❌ Erro INSERT:', insertError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Insert failed',
        details: insertError instanceof Error ? insertError.message : 'Unknown insert error',
        step: 'insert_test'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (generalError) {
    console.log('❌ Erro geral:', generalError);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'General error',
      details: generalError instanceof Error ? generalError.message : 'Unknown general error',
      step: 'general'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ 
    message: 'Use POST to test minimal insert' 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}