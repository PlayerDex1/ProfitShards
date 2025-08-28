import { useState, useEffect } from "react";
import { Giveaway, GiveawayParticipant, DEFAULT_REQUIREMENTS } from "@/types/giveaway";
import { getActiveGiveaway, initializeGiveawayData } from "@/lib/giveawayStorage";
import { getMainActiveGiveaway } from "@/data/giveaways";

// Hook para gerenciar giveaways
export function useGiveaway() {
  const [activeGiveaway, setActiveGiveaway] = useState<Giveaway | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar giveaway ativo
  useEffect(() => {
    fetchActiveGiveaway();
    
    // Escutar mudanças no localStorage
    const handleStorageChange = () => {
      fetchActiveGiveaway();
    };
    
    window.addEventListener('giveaway-data-updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('giveaway-data-updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchActiveGiveaway = async () => {
    try {
      setLoading(true);
      
      // Buscar primeiro do arquivo de configuração (principal)
      const mainGiveaway = getMainActiveGiveaway();
      if (mainGiveaway) {
        setActiveGiveaway(mainGiveaway);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Se não houver giveaway principal, tentar localStorage (admin)
      initializeGiveawayData();
      const { getActiveGiveawaySync } = await import("@/lib/giveawayStorage");
      const localGiveaway = getActiveGiveawaySync();
      
      // Se há giveaway ativo, adicionar requirements se não existir
      if (localGiveaway && (!localGiveaway.requirements || localGiveaway.requirements.length === 0)) {
        localGiveaway.requirements = DEFAULT_REQUIREMENTS.map((req, index) => ({
          ...req,
          id: `req_${index}`,
        }));
      }

      setActiveGiveaway(localGiveaway);
      setError(null);
    } catch (err) {
      console.error('Error fetching active giveaway:', err);
      setError('Erro ao carregar giveaway');
      setActiveGiveaway(null);
    } finally {
      setLoading(false);
    }
  };

  const joinGiveaway = async (giveawayId: string, userId: string) => {
    try {
      // TODO: API call
      const response = await fetch('/api/giveaway/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giveawayId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join giveaway');
      }

      const participant = await response.json();
      
      // Atualizar contador de participantes
      if (activeGiveaway) {
        setActiveGiveaway({
          ...activeGiveaway,
          currentParticipants: activeGiveaway.currentParticipants + 1,
        });
      }

      return participant;
    } catch (err) {
      console.error('Error joining giveaway:', err);
      throw err;
    }
  };

  const completeRequirement = async (giveawayId: string, userId: string, requirementId: string) => {
    try {
      // TODO: API call
      const response = await fetch('/api/giveaway/complete-requirement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giveawayId,
          userId,
          requirementId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete requirement');
      }

      return await response.json();
    } catch (err) {
      console.error('Error completing requirement:', err);
      throw err;
    }
  };

  const getParticipant = async (giveawayId: string, userId: string): Promise<GiveawayParticipant | null> => {
    try {
      // TODO: API call
      const response = await fetch(`/api/giveaway/${giveawayId}/participant/${userId}`);
      
      if (response.status === 404) {
        return null; // Usuário não está participando
      }

      if (!response.ok) {
        throw new Error('Failed to get participant');
      }

      return await response.json();
    } catch (err) {
      console.error('Error getting participant:', err);
      return null;
    }
  };

  const addDailyLoginPoint = async (userId: string) => {
    try {
      // TODO: API call para adicionar ponto de login diário
      const response = await fetch('/api/giveaway/daily-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add daily login point');
      }

      return await response.json();
    } catch (err) {
      console.error('Error adding daily login point:', err);
      throw err;
    }
  };

  const addActivityPoint = async (userId: string, activity: 'calculator' | 'planner' | 'share') => {
    try {
      // TODO: API call para adicionar pontos de atividade
      const response = await fetch('/api/giveaway/activity-point', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, activity }),
      });

      if (!response.ok) {
        throw new Error('Failed to add activity point');
      }

      return await response.json();
    } catch (err) {
      console.error('Error adding activity point:', err);
      throw err;
    }
  };

  return {
    activeGiveaway,
    loading,
    error,
    joinGiveaway,
    completeRequirement,
    getParticipant,
    addDailyLoginPoint,
    addActivityPoint,
    refetch: fetchActiveGiveaway,
  };
}