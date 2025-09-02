import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Gift, Mail, Trophy, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";

interface PushNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  notification: {
    type: 'winner' | 'email_sent' | 'reward_claimed';
    title: string;
    message: string;
    giveawayName?: string;
    prize?: string;
    email?: string;
  } | null;
}

export function PushNotification({ isVisible, onClose, notification }: PushNotificationProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible && notification) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, notification, onClose]);

  if (!isVisible || !notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'winner':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'email_sent':
        return <Mail className="h-6 w-6 text-blue-500" />;
      case 'reward_claimed':
        return <Gift className="h-6 w-6 text-green-500" />;
      default:
        return <Star className="h-6 w-6 text-purple-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'winner':
        return 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30';
      case 'email_sent':
        return 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30';
      case 'reward_claimed':
        return 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30';
      default:
        return 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-500">
      <Card className={`w-96 shadow-2xl border-2 ${getBackgroundColor()} backdrop-blur-md`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <h3 className="font-semibold text-foreground">{notification.title}</h3>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {notification.giveawayName && (
            <div className="mb-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                🎁 {notification.giveawayName}
              </p>
              {notification.prize && (
                <p className="text-xs text-muted-foreground mt-1">
                  Prêmio: {notification.prize}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={onClose}
            >
              Ver Detalhes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}