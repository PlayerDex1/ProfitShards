import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";

export interface PushNotificationData {
  id: string;
  type: 'winner' | 'email_sent' | 'reward_claimed';
  title: string;
  message: string;
  giveawayName?: string;
  prize?: string;
  email?: string;
  timestamp: number;
  userId: string;
  isRead: boolean;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PushNotificationData[]>([]);
  const [currentNotification, setCurrentNotification] = useState<PushNotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Carregar notificações do localStorage
  useEffect(() => {
    if (user?.uid) {
      try {
        const saved = localStorage.getItem(`push-notifications-${user.uid}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setNotifications(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    }
  }, [user?.uid]);

  // Salvar notificações no localStorage
  const saveNotifications = useCallback((newNotifications: PushNotificationData[]) => {
    if (user?.uid) {
      try {
        localStorage.setItem(`push-notifications-${user.uid}`, JSON.stringify(newNotifications));
      } catch (error) {
        console.error('Erro ao salvar notificações:', error);
      }
    }
  }, [user?.uid]);

  // Adicionar nova notificação
  const addNotification = useCallback((notification: Omit<PushNotificationData, 'id' | 'timestamp' | 'userId' | 'isRead'>) => {
    if (!user?.uid) return;

    const newNotification: PushNotificationData = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      userId: user.uid,
      isRead: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 100); // Limitar a 100 notificações
      saveNotifications(updated);
      return updated;
    });

    // Mostrar notificação atual
    setCurrentNotification(newNotification);
    setIsVisible(true);
  }, [user?.uid, saveNotifications]);

  // Marcar como lida
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Fechar notificação atual
  const closeCurrentNotification = useCallback(() => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
    }
    setIsVisible(false);
    setCurrentNotification(null);
  }, [currentNotification, markAsRead]);

  // Limpar todas as notificações
  const clearAllNotifications = useCallback(() => {
    if (user?.uid) {
      setNotifications([]);
      localStorage.removeItem(`push-notifications-${user.uid}`);
    }
  }, [user?.uid]);

  // Verificar se usuário é ganhador de um giveaway
  const checkForWinnerNotification = useCallback(async (giveawayId: string) => {
    if (!user?.uid || !user?.email) return;

    try {
      const response = await fetch(`/api/winners/check-winner?giveawayId=${giveawayId}&userEmail=${encodeURIComponent(user.email)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.isWinner) {
          addNotification({
            type: 'winner',
            title: '🎉 Parabéns! Você ganhou!',
            message: `Você foi selecionado como ganhador do giveaway "${data.giveawayName}"!`,
            giveawayName: data.giveawayName,
            prize: data.prizeDescription,
            email: user.email
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar se é ganhador:', error);
    }
  }, [user?.uid, user?.email, addNotification]);

  // Notificar que email foi enviado
  const notifyEmailSent = useCallback((giveawayName: string, prize: string) => {
    addNotification({
      type: 'email_sent',
      title: '📧 Email enviado!',
      message: `Email de notificação enviado para o ganhador do giveaway "${giveawayName}"`,
      giveawayName,
      prize
    });
  }, [addNotification]);

  // Notificar que recompensa foi reclamada
  const notifyRewardClaimed = useCallback((giveawayName: string, prize: string) => {
    addNotification({
      type: 'reward_claimed',
      title: '🎁 Recompensa reclamada!',
      message: `O ganhador reclamou sua recompensa do giveaway "${giveawayName}"`,
      giveawayName,
      prize
    });
  }, [addNotification]);

  return {
    notifications,
    currentNotification,
    isVisible,
    addNotification,
    markAsRead,
    closeCurrentNotification,
    clearAllNotifications,
    checkForWinnerNotification,
    notifyEmailSent,
    notifyRewardClaimed,
  };
}