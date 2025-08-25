// 🤖 SIMULADOR DE AGENTES PARA FEED DE TESTE
// Baseado na estrutura existente do projeto

class AgentSimulator {
  constructor() {
    this.agentProfiles = [
      { id: 'bc-test-001', type: 'conservative', luckRange: [50, 150] },
      { id: 'bc-test-002', type: 'aggressive', luckRange: [200, 500] },
      { id: 'bc-test-003', type: 'balanced', luckRange: [100, 300] },
      { id: 'bc-test-004', type: 'whale', luckRange: [1000, 5000] },
      { id: 'bc-test-005', type: 'newbie', luckRange: [20, 80] },
    ];
    
    this.mapStrategies = {
      conservative: ['small', 'medium'],
      aggressive: ['large', 'xlarge'],
      balanced: ['medium', 'large'],
      whale: ['xlarge'],
      newbie: ['small', 'medium']
    };
    
    this.baseUrl = '/api/admin/save-test-run';
  }

  // Gerar dados realistas baseados no WORLDSHARDS_KNOWLEDGE.md
  generateRealisticRun(agent) {
    const luck = this.randomBetween(...agent.luckRange);
    const mapChoices = this.mapStrategies[agent.type];
    const mapSize = mapChoices[Math.floor(Math.random() * mapChoices.length)];
    
    // Lógica baseada no conhecimento do jogo
    const efficiency = this.calculateEfficiency(luck, mapSize);
    const loads = this.getLoadsForMap(mapSize);
    const tokensDropped = Math.round(loads * efficiency * (0.8 + Math.random() * 0.4));
    
    return {
      agentId: agent.id,
      mapId: `${mapSize.toUpperCase()}_${Date.now()}`,
      mapName: mapSize,
      level: this.randomBetween(1, 5),
      tier: this.randomBetween(1, 4),
      luck: luck,
      tokensDropped: tokensDropped,
      energyCost: loads,
      gemCost: 0,
      efficiency: efficiency,
      estimatedTokens: tokensDropped * 1.1,
      timestamp: Date.now(),
      source: 'agent_simulator'
    };
  }

  calculateEfficiency(luck, mapSize) {
    const baseEfficiency = {
      small: 1.2,
      medium: 1.8,
      large: 2.5,
      xlarge: 3.2
    };
    
    const luckBonus = luck / 1000; // 1000 luck = +1.0 efficiency
    return baseEfficiency[mapSize] + luckBonus;
  }

  getLoadsForMap(mapSize) {
    return {
      small: 4,
      medium: 8,
      large: 16,
      xlarge: 24
    }[mapSize];
  }

  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Simular atividade em horários realistas
  async simulateRealisticActivity() {
    const hour = new Date().getHours();
    const activityMultiplier = this.getActivityMultiplier(hour);
    const runsToGenerate = Math.ceil(activityMultiplier * 3); // Base 3 runs

    console.log(`🕐 ${hour}h - Gerando ${runsToGenerate} runs (multiplicador: ${activityMultiplier})`);

    for (let i = 0; i < runsToGenerate; i++) {
      const agent = this.agentProfiles[Math.floor(Math.random() * this.agentProfiles.length)];
      const runData = this.generateRealisticRun(agent);
      
      try {
        await this.submitRun(runData);
        console.log(`✅ Run ${agent.id}: ${runData.mapName} - ${runData.tokensDropped} tokens`);
        
        // Delay natural entre runs
        await this.sleep(this.randomBetween(5000, 15000));
      } catch (error) {
        console.error(`❌ Erro enviando run ${agent.id}:`, error);
      }
    }
  }

  getActivityMultiplier(hour) {
    // Simular padrões reais de atividade
    const activityPattern = {
      0: 0.3, 1: 0.2, 2: 0.1, 3: 0.1, 4: 0.1, 5: 0.2,
      6: 0.4, 7: 0.6, 8: 0.8, 9: 1.0, 10: 1.2, 11: 1.3,
      12: 1.5, 13: 1.4, 14: 1.2, 15: 1.1, 16: 1.0, 17: 1.2,
      18: 1.6, 19: 1.8, 20: 2.0, 21: 1.8, 22: 1.4, 23: 0.8
    };
    return activityPattern[hour] || 1.0;
  }

  async submitRun(runData) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(runData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    return response.json();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Executar simulação contínua
  startContinuousSimulation() {
    console.log('🚀 Iniciando simulação contínua...');
    
    // Simular a cada 10-30 minutos
    setInterval(async () => {
      await this.simulateRealisticActivity();
    }, this.randomBetween(10, 30) * 60 * 1000);
    
    // Primeira execução imediata
    this.simulateRealisticActivity();
  }
}

// Uso
const simulator = new AgentSimulator();
// simulator.startContinuousSimulation();

export default AgentSimulator;