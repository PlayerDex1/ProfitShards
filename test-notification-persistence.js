// Script para testar persistência das notificações
// Execute no console do navegador para verificar se os dados estão sendo salvos

console.log('🧪 TESTE DE PERSISTÊNCIA DE NOTIFICAÇÕES');
console.log('==========================================');

// Função para verificar status atual
async function checkNotificationStatus() {
  try {
    console.log('📊 Verificando status das notificações...');
    
    const response = await fetch('/api/winners/public?admin=true&limit=50');
    const result = await response.json();
    
    if (result.winners) {
      console.log('✅ Ganhadores carregados:', result.winners.length);
      
      // Verificar campos de notificação
      const notificationFields = result.winners.map(w => ({
        id: w.id,
        userEmail: w.userEmail,
        notified: w.notified,
        notificationMethod: w.notificationMethod,
        notifiedAt: w.notifiedAt,
        claimed: w.claimed,
        shippingStatus: w.shippingStatus
      }));
      
      console.table(notificationFields);
      
      // Contadores
      const notifiedCount = result.winners.filter(w => w.notified).length;
      const claimedCount = result.winners.filter(w => w.claimed).length;
      
      console.log(`📧 Notificados: ${notifiedCount}/${result.winners.length}`);
      console.log(`🎁 Reivindicados: ${claimedCount}/${result.winners.length}`);
      
      return result.winners;
    } else {
      console.error('❌ Nenhum ganhador encontrado');
      return [];
    }
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    return [];
  }
}

// Função para testar envio de email
async function testEmailSending(winnerId, customMessage = 'Teste de persistência') {
  try {
    console.log(`📧 Testando envio de email para ganhador: ${winnerId}`);
    
    const response = await fetch('/api/winners/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        winnerId,
        customMessage,
        adminId: 'test-admin'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email enviado com sucesso:', result);
      
      // Aguardar um pouco e verificar se o status foi persistido
      setTimeout(async () => {
        console.log('🔄 Verificando persistência após 2 segundos...');
        await checkNotificationStatus();
      }, 2000);
      
    } else {
      console.error('❌ Erro ao enviar email:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return null;
  }
}

// Função para limpar rate limiting (se necessário)
async function clearRateLimit() {
  try {
    console.log('🧹 Tentando limpar rate limiting...');
    
    // Simular limpeza (o rate limit expira automaticamente em 1 minuto)
    console.log('⏱️ Rate limit expira automaticamente em 1 minuto');
    console.log('💡 Ou execute: ./clear-rate-limit.sh');
    
  } catch (error) {
    console.error('❌ Erro ao limpar rate limit:', error);
  }
}

// Função principal de teste
async function runPersistenceTest() {
  console.log('🚀 Iniciando teste de persistência...');
  
  // 1. Verificar status inicial
  const initialWinners = await checkNotificationStatus();
  
  if (initialWinners.length === 0) {
    console.log('⚠️ Nenhum ganhador para testar');
    return;
  }
  
  // 2. Encontrar um ganhador não notificado
  const unnotifiedWinner = initialWinners.find(w => !w.notified);
  
  if (unnotifiedWinner) {
    console.log(`🎯 Testando com ganhador: ${unnotifiedWinner.id}`);
    
    // 3. Testar envio de email
    await testEmailSending(unnotifiedWinner.id);
    
  } else {
    console.log('✅ Todos os ganhadores já foram notificados');
    
    // 4. Verificar se os dados persistem após F5
    console.log('🔄 Recarregue a página (F5) e execute novamente este teste');
    console.log('💡 Os status devem permanecer consistentes');
  }
}

// Expor funções para uso manual
window.notificationTest = {
  checkStatus: checkNotificationStatus,
  testEmail: testEmailSending,
  clearRateLimit,
  runTest: runPersistenceTest
};

console.log('📋 Funções disponíveis:');
console.log('   window.notificationTest.checkStatus() - Verificar status atual');
console.log('   window.notificationTest.testEmail(id, msg) - Testar envio');
console.log('   window.notificationTest.clearRateLimit() - Limpar rate limit');
console.log('   window.notificationTest.runTest() - Executar teste completo');

// Executar teste automaticamente
runPersistenceTest();