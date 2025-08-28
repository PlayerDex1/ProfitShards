(async () => {
  console.log('🔍 DEBUG PARTICIPAÇÃO AUTOMÁTICA');
  
  // Simular dados do usuário
  const userId = 'user_' + Date.now();
  const giveawayId = 'final_test_1756416737209'; // ID do giveaway ativo
  
  console.log('📋 DADOS:', { userId: userId.slice(0, 15), giveawayId });
  
  // 1. Verificar giveaway atual
  let giveaway = null;
  try {
    const response = await fetch('/api/giveaways/active');
    const result = await response.json();
    giveaway = result.giveaway;
    console.log('🎁 GIVEAWAY ATIVO:', giveaway ? giveaway.title : 'NENHUM');
  } catch (error) {
    console.error('❌ Erro ao buscar giveaway:', error);
  }
  
  if (!giveaway) {
    console.log('❌ SEM GIVEAWAY ATIVO - PARANDO DEBUG');
    return;
  }
  
  // 2. Verificar requirements
  console.log('📋 REQUIREMENTS:', giveaway.requirements?.length || 0);
  if (giveaway.requirements) {
    giveaway.requirements.forEach((req, i) => {
      console.log(`   ${i+1}. ${req.description} (${req.points}pts) - Required: ${req.required}`);
    });
  }
  
  // 3. Simular progresso completo
  const mockProgress = {
    userId,
    giveawayId,
    completedRequirements: giveaway.requirements?.map(r => r.id) || [],
    totalPoints: giveaway.requirements?.reduce((sum, r) => sum + r.points, 0) || 0,
    lastUpdated: new Date().toISOString(),
    activityLog: []
  };
  
  console.log('✅ PROGRESSO SIMULADO:', {
    completed: mockProgress.completedRequirements.length,
    totalPoints: mockProgress.totalPoints
  });
  
  // 4. Salvar progresso no localStorage
  localStorage.setItem(
    `user_mission_progress_${userId}_${giveawayId}`,
    JSON.stringify(mockProgress)
  );
  
  // 5. Testar lógica de auto-participação
  const requiredMissions = giveaway.requirements?.filter(req => req.required) || [];
  const completedRequired = requiredMissions.filter(req => 
    mockProgress.completedRequirements.includes(req.id)
  );
  
  console.log('🎯 VERIFICAÇÃO AUTO-PARTICIPAÇÃO:', {
    requiredMissions: requiredMissions.length,
    completedRequired: completedRequired.length,
    shouldParticipate: completedRequired.length >= requiredMissions.length
  });
  
  // 6. Verificar se nenhuma é obrigatória (participação imediata)
  if (requiredMissions.length === 0) {
    console.log('⚠️ NENHUMA MISSÃO OBRIGATÓRIA - AUTO-PARTICIPAÇÃO DEVE SER IMEDIATA');
  }
  
  // 7. Verificar participantes atuais
  const participantsKey = `giveaway_participants_${giveawayId}`;
  const participants = JSON.parse(localStorage.getItem(participantsKey) || '[]');
  console.log('👥 PARTICIPANTES ATUAIS:', participants.length);
  
  // 8. Simular auto-participação manual
  if (!participants.includes(userId)) {
    participants.push(userId);
    localStorage.setItem(participantsKey, JSON.stringify(participants));
    console.log('✅ USUÁRIO ADICIONADO AOS PARTICIPANTES');
    
    // Disparar evento
    window.dispatchEvent(new CustomEvent('giveaway-participation-updated', {
      detail: { giveawayId, participants }
    }));
    
    console.log('🎉 EVENTO DE PARTICIPAÇÃO DISPARADO');
  } else {
    console.log('ℹ️ USUÁRIO JÁ ESTAVA PARTICIPANDO');
  }
  
  console.log('🏁 DEBUG CONCLUÍDO - RECARREGUE A PÁGINA PARA VER MUDANÇAS');
})();