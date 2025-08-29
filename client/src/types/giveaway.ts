// Tipos para o sistema de giveaway
export interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  maxParticipants?: number;
  currentParticipants: number;
  rules: string[];
  requirements: GiveawayRequirement[];
  winnerAnnouncement?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface GiveawayRequirement {
  id: string;
  type: 'login' | 'twitter_follow' | 'discord_join' | 'use_calculator' | 'use_planner' | 'share_social' | 'external_link';
  description: string;
  points: number;
  url?: string;
  required: boolean;
}

export interface GiveawayParticipant {
  id: string;
  giveawayId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  participatedAt: string;
  totalPoints: number;
  completedRequirements: string[];
  dailyLogins: number;
  lastLoginDate?: string;
}

export interface GiveawayStats {
  totalParticipants: number;
  averagePoints: number;
  topParticipants: {
    userName: string;
    points: number;
  }[];
  requirementCompletion: {
    requirementId: string;
    completionRate: number;
  }[];
}

// Pontos por ação
export const GIVEAWAY_POINTS = {
  DAILY_LOGIN: 1,
  USE_CALCULATOR: 2,
  USE_PLANNER: 3,
  SHARE_SOCIAL: 5,
  TWITTER_FOLLOW_PLAYER: 10,
  TWITTER_FOLLOW_OFFICIAL: 10,
  DISCORD_JOIN: 15,
} as const;

// Requirements padrão para giveaways
export const DEFAULT_REQUIREMENTS: Omit<GiveawayRequirement, 'id'>[] = [
  {
    type: 'login',
    description: 'Fazer login no site',
    points: GIVEAWAY_POINTS.DAILY_LOGIN,
    required: true,
  },
  {
    type: 'twitter_follow',
    description: 'Seguir @playerhold no Twitter',
    points: GIVEAWAY_POINTS.TWITTER_FOLLOW_PLAYER,
    url: 'https://x.com/playerhold',
    required: true,
  },
  {
    type: 'twitter_follow',
    description: 'Seguir @WorldShardsGame no Twitter',
    points: GIVEAWAY_POINTS.TWITTER_FOLLOW_OFFICIAL,
    url: 'https://x.com/WorldShardsGame',
    required: true,
  },
  {
    type: 'discord_join',
    description: 'Entrar no Discord oficial do WorldShards',
    points: GIVEAWAY_POINTS.DISCORD_JOIN,
    url: 'https://discord.gg/VzYJCRke',
    required: false,
  },
  {
    type: 'use_calculator',
    description: 'Usar a calculadora do site',
    points: GIVEAWAY_POINTS.USE_CALCULATOR,
    required: false,
  },
  {
    type: 'use_planner',
    description: 'Usar o planejador de mapa',
    points: GIVEAWAY_POINTS.USE_PLANNER,
    required: false,
  },
  {
    type: 'share_social',
    description: 'Compartilhar nas redes sociais',
    points: GIVEAWAY_POINTS.SHARE_SOCIAL,
    required: false,
  },
];