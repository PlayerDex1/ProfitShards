// Script de debug para testar dados do feed
console.log('🔍 DEBUGGING FEED DATA');
console.log('===================');

// Simular inserção de dados na tabela user_map_drops
const testData = [
  {
    id: 'test-run-1',
    user_id: 'test-user-1',
    map_name: 'medium',
    tokens_earned: 250,
    drop_data: JSON.stringify({
      luck: 1500,
      efficiency: 166.7,
      gems_used: 5
    }),
    created_at: Date.now() - (2 * 60 * 60 * 1000) // 2 horas atrás
  },
  {
    id: 'test-run-2',
    user_id: 'test-user-2', 
    map_name: 'large',
    tokens_earned: 450,
    drop_data: JSON.stringify({
      luck: 2200,
      efficiency: 204.5,
      gems_used: 8
    }),
    created_at: Date.now() - (5 * 60 * 60 * 1000) // 5 horas atrás
  },
  {
    id: 'test-run-3',
    user_id: 'test-user-3',
    map_name: 'small',
    tokens_earned: 120,
    drop_data: JSON.stringify({
      luck: 800,
      efficiency: 150.0,
      gems_used: 3
    }),
    created_at: Date.now() - (1 * 60 * 60 * 1000) // 1 hora atrás
  }
];

console.log('📊 Dados de teste preparados:');
testData.forEach(data => {
  console.log(`- ${data.id}: ${data.map_name} map, ${data.tokens_earned} tokens, ${new Date(data.created_at).toISOString()}`);
});

console.log('\n🎯 Para inserir estes dados, use:');
console.log('INSERT INTO user_map_drops (id, user_id, map_name, tokens_earned, drop_data, created_at)');
console.log('VALUES (?, ?, ?, ?, ?, ?)');

console.log('\n🔍 Para verificar dados existentes:');
console.log('SELECT COUNT(*) as total FROM user_map_drops;');
console.log('SELECT * FROM user_map_drops ORDER BY created_at DESC LIMIT 5;');

console.log('\n⏰ Janela de tempo de 24h:');
const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
console.log(`- Timestamp mínimo: ${twentyFourHoursAgo}`);
console.log(`- Data mínima: ${new Date(twentyFourHoursAgo).toISOString()}`);
console.log(`- Agora: ${new Date().toISOString()}`);