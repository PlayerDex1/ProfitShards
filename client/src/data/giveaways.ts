import { Giveaway } from "@/types/giveaway";

// Configuração centralizada de giveaways
// Edite este arquivo e faça deploy para atualizar os giveaways para todos os usuários

export const ACTIVE_GIVEAWAYS: Giveaway[] = [
  {
    id: "giveaway_main_2024_01",
    title: "🎁 Primeiro Giveaway Oficial",
    description: "Participe do nosso primeiro giveaway oficial e concorra a prêmios incríveis!",
    prize: "1x Game Box + Bonus Items",
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2025-03-31T23:59:59Z",
    status: "active",
    maxParticipants: 1000,
    currentParticipants: 0,
    rules: [
      "Apenas uma entrada por pessoa",
      "Deve ter 18+ anos para participar",
      "Vencedor será anunciado no Discord",
      "Prêmio deve ser reclamado em 7 dias"
    ],
    requirements: [
      {
        id: "daily_login",
        type: "daily_login",
        description: "Fazer login diário no site",
        points: 1,
        isRequired: true,
        url: ""
      },
      {
        id: "calculator_use",
        type: "calculator_use", 
        description: "Usar a calculadora de lucros",
        points: 2,
        isRequired: false,
        url: ""
      },
      {
        id: "planner_use",
        type: "planner_use",
        description: "Usar o planejador de mapas",
        points: 3,
        isRequired: false,
        url: ""
      },
      {
        id: "twitter_follow",
        type: "twitter_follow",
        description: "Seguir @playerhold no Twitter/X",
        points: 5,
        isRequired: true,
        url: "https://x.com/playerhold"
      },
      {
        id: "discord_join",
        type: "discord_join",
        description: "Entrar no Discord oficial",
        points: 5,
        isRequired: false,
        url: "https://discord.gg/VzYJCRke"
      },
      {
        id: "social_share",
        type: "social_share",
        description: "Compartilhar o giveaway nas redes sociais",
        points: 3,
        isRequired: false,
        url: ""
      }
    ],
    winnerAnnouncement: "2024-02-16T12:00:00Z",
    imageUrl: "",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

// Função para obter giveaways do localStorage (dinâmicos) ou fallback para padrão
function getDynamicGiveaways(): Giveaway[] {
  try {
    const stored = localStorage.getItem('main_giveaways_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : ACTIVE_GIVEAWAYS;
    }
  } catch (error) {
    console.error('Erro ao carregar giveaways dinâmicos:', error);
  }
  return ACTIVE_GIVEAWAYS;
}

// Função para obter o giveaway ativo principal (agora via API)
export async function getMainActiveGiveaway(): Promise<Giveaway | null> {
  try {
    console.log('🎯 BUSCANDO GIVEAWAY DA API...');
    
    const response = await fetch('/api/giveaways/active');
    console.log('📡 RESPOSTA /active:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ERRO API /active:', response.status, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📦 DADOS RECEBIDOS:', data);
    
    const giveaway = data.giveaway;
    
    if (giveaway) {
      console.log('✅ GIVEAWAY ENCONTRADO:', {
        id: giveaway.id,
        title: giveaway.title,
        status: giveaway.status,
        startDate: giveaway.startDate,
        endDate: giveaway.endDate,
        now: new Date().toISOString()
      });
    } else {
      console.log('❌ NENHUM GIVEAWAY ATIVO NO BANCO');
    }
    
    return giveaway;
  } catch (error) {
    console.error('💥 ERRO COMPLETO NA API:', error);
    
    // Fallback para dados locais
    const now = new Date();
    const allGiveaways = getDynamicGiveaways();
    
    console.log('🔄 USANDO FALLBACK - Giveaways locais:', allGiveaways.length);
    
    const activeGiveaway = allGiveaways.find(giveaway => {
      const startDate = new Date(giveaway.startDate);
      const endDate = new Date(giveaway.endDate);
      
      const isActive = giveaway.status === 'active' && 
             now >= startDate && 
             now <= endDate;
             
      console.log(`🔍 Testando ${giveaway.title}:`, {
        status: giveaway.status,
        isActive,
        now: now.toISOString(),
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });
      
      return isActive;
    });
    
    console.log('🔄 GIVEAWAY FALLBACK:', activeGiveaway ? activeGiveaway.title : 'Nenhum ativo');
    
    return activeGiveaway || null;
  }
}

// Função para verificar se um giveaway específico está ativo
export function isGiveawayActive(giveawayId: string): boolean {
  const giveaway = ACTIVE_GIVEAWAYS.find(g => g.id === giveawayId);
  if (!giveaway) return false;
  
  const now = new Date();
  const startDate = new Date(giveaway.startDate);
  const endDate = new Date(giveaway.endDate);
  
  return giveaway.status === 'active' && now >= startDate && now <= endDate;
}