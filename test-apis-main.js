// 🔍 TESTE DAS APIs NA MAIN
console.log('🔍 TESTANDO APIs NA MAIN...');

async function testAllAPIs() {
  const apis = [
    { name: 'Community Stats', url: '/api/community/stats' },
    { name: 'Admin Users', url: '/api/admin/get-users' },
    { name: 'Admin Trends', url: '/api/admin/get-trends' },
    { name: 'Admin Profit Stats', url: '/api/admin/get-profit-stats' },
    { name: 'Feed Activity', url: '/api/feed/activity-stream' }
  ];

  for (const api of apis) {
    try {
      console.log(`\n📊 Testando ${api.name}...`);
      
      const response = await fetch(api.url, {
        credentials: 'include'
      });
      
      console.log(`Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Dados:`, data);
      } else {
        const error = await response.text();
        console.log(`Erro:`, error);
      }
      
    } catch (error) {
      console.error(`❌ Erro em ${api.name}:`, error);
    }
  }
}

testAllAPIs();