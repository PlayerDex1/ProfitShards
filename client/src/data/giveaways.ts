import { Giveaway } from "@/types/giveaway";

// Configuração centralizada de giveaways
// Edite este arquivo e faça deploy para atualizar os giveaways para todos os usuários

export const ACTIVE_GIVEAWAYS: Giveaway[] = [
  {
    id: "giveaway_main_2024_01",
    title: "🎁 Primeiro Giveaway Oficial",
    description: "Participe do nosso primeiro giveaway oficial e concorra a prêmios incríveis!",
    prize: "1x Game Box + Bonus Items",
    startDate: "2024-01-15T00:00:00Z",
    endDate: "2024-02-15T23:59:59Z",
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

// Função para obter o giveaway ativo principal
export function getMainActiveGiveaway(): Giveaway | null {
  const now = new Date();
  
  const activeGiveaway = ACTIVE_GIVEAWAYS.find(giveaway => {
    const startDate = new Date(giveaway.startDate);
    const endDate = new Date(giveaway.endDate);
    
    return giveaway.status === 'active' && 
           now >= startDate && 
           now <= endDate;
  });
  
  return activeGiveaway || null;
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