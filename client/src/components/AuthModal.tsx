import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

interface AuthModalProps {
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'forgot' | 'reset';
  defaultToken?: string;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const googleLogin = () => {
    setLoading(true);
    window.location.href = '/api/auth/google/start';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <Card className="w-full max-w-sm bg-black border-gray-800">
        <CardHeader className="py-3">
          <CardTitle className="text-white text-base">{t('auth.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-2">
            <Button type="button" onClick={googleLogin} className="w-full bg-white text-black hover:bg-white/90 h-9 px-4" disabled={loading}>
              {loading ? '...' : 'Continuar com Google'}
            </Button>
            <Button type="button" onClick={onClose} className="w-full bg-white/10 text-white hover:bg-white/20 h-9 px-4">
              {t('auth.cancel')}
            </Button>
            <p className="text-[11px] text-white/60 text-center">Use sua conta Google para entrar com segurança.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
