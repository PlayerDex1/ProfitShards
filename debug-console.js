// 🔍 CÓDIGO DE DEBUG PARA CONSOLE DO NAVEGADOR
// Cole este código no console (F12) e pressione Enter

console.log('🔍 INICIANDO DEBUG PROFITSHARDS...');

// 1. Verificar se React está carregado
console.log('1️⃣ React carregado:', typeof window.React !== 'undefined');
console.log('1️⃣ ReactDOM carregado:', typeof window.ReactDOM !== 'undefined');

// 2. Verificar elementos na página
const elements = document.querySelectorAll('*');
console.log('2️⃣ Elementos na página:', elements.length);

// 3. Verificar se há erros JavaScript
console.log('3️⃣ Verificando erros JavaScript...');
window.addEventListener('error', (e) => {
  console.error('❌ Erro JavaScript:', e.error);
});

// 4. Verificar localStorage
console.log('4️⃣ LocalStorage keys:', Object.keys(localStorage));
const authData = localStorage.getItem('worldshards-current-user');
console.log('4️⃣ Auth data:', authData ? JSON.parse(authData) : null);

// 5. Verificar elementos React
const rootElement = document.getElementById('root');
console.log('5️⃣ Elementos React:', rootElement?.children.length || 0);
console.log('5️⃣ Root element:', rootElement);

// 6. Verificar scripts carregados
const scripts = document.querySelectorAll('script');
console.log('6️⃣ Scripts carregados:', scripts.length);

// 7. Verificar CSS carregado
const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
console.log('7️⃣ CSS carregado:', stylesheets.length);

// 8. Capturar erros
const errors = [];
window.addEventListener('error', (e) => {
  errors.push(e.error);
});
console.log('8️⃣ Erros capturados:', errors);

// 9. Verificar elementos específicos do ProfitShards
const profitShardsElements = {
  header: document.querySelector('[data-testid="header"]') || document.querySelector('header'),
  main: document.querySelector('main'),
  calculator: document.querySelector('[data-testid="calculator"]') || document.querySelector('.calculator'),
  profile: document.querySelector('[data-testid="profile"]') || document.querySelector('.profile')
};
console.log('9️⃣ Elementos ProfitShards:', profitShardsElements);

// 10. Verificar network status
fetch('/api/auth/me')
  .then(response => {
    console.log('🔟 Network status:', response.ok);
    return response.json();
  })
  .then(data => {
    console.log('🔟 API response:', data);
  })
  .catch(error => {
    console.log('🔟 Network error:', error);
  });

// 11. Verificar se há componentes de debug
setTimeout(() => {
  const debugElements = document.querySelectorAll('[style*="background: red"]');
  console.log('1️⃣1️⃣ Elementos de debug encontrados:', debugElements.length);
  
  const limeElements = document.querySelectorAll('[style*="background: lime"]');
  console.log('1️⃣1️⃣ Elementos lime (Dashboard):', limeElements.length);
  
  const orangeElements = document.querySelectorAll('[style*="background: orange"]');
  console.log('1️⃣1️⃣ Elementos orange (Relatórios):', orangeElements.length);
}, 2000);

console.log('✅ DEBUG COMPLETO!');