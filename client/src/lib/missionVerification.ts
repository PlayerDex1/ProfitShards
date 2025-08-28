import { GiveawayRequirement } from "@/types/giveaway";

interface UserMissionProgress {
  userId: string;
  giveawayId: string;
  completedRequirements: string[];
  totalPoints: number;
  lastUpdated: string;
  activityLog: {
    requirementId: string;
    completedAt: string;
    verificationMethod: string;
    data?: any;
  }[];
}

const MISSION_PROGRESS_KEY = 'user_mission_progress';

// Função para obter progresso do usuário
export function getUserMissionProgress(userId: string, giveawayId: string): UserMissionProgress {
  if (typeof window === 'undefined') {
    return {
      userId,
      giveawayId,
      completedRequirements: [],
      totalPoints: 0,
      lastUpdated: new Date().toISOString(),
      activityLog: []
    };
  }

  try {
    const stored = localStorage.getItem(`${MISSION_PROGRESS_KEY}_${userId}_${giveawayId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading mission progress:', error);
  }

  return {
    userId,
    giveawayId,
    completedRequirements: [],
    totalPoints: 0,
    lastUpdated: new Date().toISOString(),
    activityLog: []
  };
}

// Função para salvar progresso
export function saveMissionProgress(progress: UserMissionProgress): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      `${MISSION_PROGRESS_KEY}_${progress.userId}_${progress.giveawayId}`,
      JSON.stringify({
        ...progress,
        lastUpdated: new Date().toISOString()
      })
    );
    
    // Disparar evento para atualizações em tempo real
    window.dispatchEvent(new CustomEvent('mission-progress-updated', { 
      detail: progress 
    }));
  } catch (error) {
    console.error('Error saving mission progress:', error);
  }
}

// Função para marcar missão como completada
export function completeMission(
  userId: string, 
  giveawayId: string, 
  requirement: GiveawayRequirement,
  verificationData?: any
): void {
  const progress = getUserMissionProgress(userId, giveawayId);
  
  // Se já foi completada, não fazer nada
  if (progress.completedRequirements.includes(requirement.id)) {
    return;
  }
  
  // Adicionar à lista de completadas
  progress.completedRequirements.push(requirement.id);
  progress.totalPoints += requirement.points;
  
  // Adicionar ao log de atividades
  progress.activityLog.push({
    requirementId: requirement.id,
    completedAt: new Date().toISOString(),
    verificationMethod: getVerificationMethod(requirement.type),
    data: verificationData
  });
  
  saveMissionProgress(progress);
}

// Função para verificar se missão está completada
export function isMissionCompleted(userId: string, giveawayId: string, requirementId: string): boolean {
  const progress = getUserMissionProgress(userId, giveawayId);
  return progress.completedRequirements.includes(requirementId);
}

// Função para verificar login diário
export function checkDailyLogin(userId: string, giveawayId: string, requirement: GiveawayRequirement): void {
  const today = new Date().toDateString();
  const lastLoginKey = `last_login_${userId}`;
  const lastLogin = localStorage.getItem(lastLoginKey);
  
  if (lastLogin !== today) {
    localStorage.setItem(lastLoginKey, today);
    completeMission(userId, giveawayId, requirement, { loginDate: today });
  }
}

// Função para verificar uso da calculadora
export function checkCalculatorUsage(userId: string, giveawayId: string, requirement: GiveawayRequirement): void {
  completeMission(userId, giveawayId, requirement, { 
    action: 'calculator_used',
    timestamp: new Date().toISOString()
  });
}

// Função para verificar uso do planejador
export function checkPlannerUsage(userId: string, giveawayId: string, requirement: GiveawayRequirement): void {
  completeMission(userId, giveawayId, requirement, { 
    action: 'planner_used',
    timestamp: new Date().toISOString()
  });
}

// Função para marcar compartilhamento social
export function markSocialShare(userId: string, giveawayId: string, requirement: GiveawayRequirement, platform: string): void {
  completeMission(userId, giveawayId, requirement, { 
    platform,
    sharedAt: new Date().toISOString()
  });
}

// Função para verificação manual (Twitter/Discord)
export function manualVerification(
  userId: string, 
  giveawayId: string, 
  requirement: GiveawayRequirement,
  userInput: string
): Promise<boolean> {
  return new Promise((resolve) => {
    // Simular verificação (em produção seria uma API call)
    setTimeout(() => {
      if (requirement.type === 'twitter_follow') {
        // Verificar se o input parece um handle do Twitter
        const isValidHandle = /^@?[a-zA-Z0-9_]{1,15}$/.test(userInput.trim());
        if (isValidHandle) {
          completeMission(userId, giveawayId, requirement, {
            userHandle: userInput.trim(),
            verifiedAt: new Date().toISOString(),
            method: 'manual_input'
          });
          resolve(true);
        } else {
          resolve(false);
        }
      } else if (requirement.type === 'discord_join') {
        // Verificar se o input parece um username do Discord
        const isValidDiscord = /^.{2,32}#[0-9]{4}$|^.{2,32}$/.test(userInput.trim());
        if (isValidDiscord) {
          completeMission(userId, giveawayId, requirement, {
            discordUser: userInput.trim(),
            verifiedAt: new Date().toISOString(),
            method: 'manual_input'
          });
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    }, 1000); // Simular delay de verificação
  });
}

// Função para obter método de verificação
function getVerificationMethod(type: GiveawayRequirement['type']): string {
  switch (type) {
    case 'login': return 'automatic_daily_check';
    case 'twitter_follow': return 'manual_verification';
    case 'discord_join': return 'manual_verification';
    case 'use_calculator': return 'activity_tracking';
    case 'use_planner': return 'activity_tracking';
    case 'share_social': return 'manual_action';
    default: return 'unknown';
  }
}

// Função para resetar progresso (admin only)
export function resetUserProgress(userId: string, giveawayId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(`${MISSION_PROGRESS_KEY}_${userId}_${giveawayId}`);
    window.dispatchEvent(new CustomEvent('mission-progress-updated'));
  } catch (error) {
    console.error('Error resetting progress:', error);
  }
}

// Função para obter estatísticas gerais
export function getMissionStats(giveawayId: string): {
  totalUsers: number;
  averagePoints: number;
  completionRates: { [requirementId: string]: number };
} {
  // Em produção, isso viria da API
  // Por enquanto, retornar dados simulados
  return {
    totalUsers: 247,
    averagePoints: 18.5,
    completionRates: {
      'req_0': 0.95, // Login - 95%
      'req_1': 0.78, // Twitter player - 78%
      'req_2': 0.65, // Twitter oficial - 65%
      'req_3': 0.42, // Discord - 42%
      'req_4': 0.55, // Calculator - 55%
      'req_5': 0.33, // Planner - 33%
      'req_6': 0.28, // Share - 28%
    }
  };
}

// Hook para integração com calculadora
export function setupCalculatorTracking(userId: string, giveawayId: string) {
  if (typeof window === 'undefined') return;
  
  // Escutar evento de cálculo realizado
  const handleCalculation = () => {
    // Buscar requirement de calculadora
    const progress = getUserMissionProgress(userId, giveawayId);
    // Se não completou ainda, marcar como completo
    // (será implementado quando integrar com o sistema de giveaway)
  };
  
  window.addEventListener('calculation-completed', handleCalculation);
  
  return () => {
    window.removeEventListener('calculation-completed', handleCalculation);
  };
}

// Hook para integração com planejador
export function setupPlannerTracking(userId: string, giveawayId: string) {
  if (typeof window === 'undefined') return;
  
  const handlePlannerUse = () => {
    // Similar ao calculadora
  };
  
  window.addEventListener('planner-used', handlePlannerUse);
  
  return () => {
    window.removeEventListener('planner-used', handlePlannerUse);
  };
}