import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { register, login, requestReset, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setInfo(null);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) setError(res.error || "Erro ao autenticar");
    else onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setInfo(null);
    const res = await register(email, password);
    setLoading(false);
    if (!res.ok) setError(res.error || "Erro ao registrar");
    else { setInfo("Conta criada. Faça login."); setMode('login'); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setInfo(null);
    const res = await requestReset(email).catch(() => ({ ok: true }));
    setLoading(false);
    setInfo("Se o e-mail existir, enviamos o link de reset. Para testes, um token pode ser retornado pela API.");
    if ((res as any)?.token) setToken((res as any).token);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setInfo(null);
    const res = await resetPassword(token, password).catch(() => ({ ok: false, error: 'reset_failed' }));
    setLoading(false);
    if (!(res as any).ok) setError((res as any).error || 'reset_failed');
    else { setInfo("Senha alterada. Faça login."); setMode('login'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <Card className="w-full max-w-sm bg-black border-gray-800">
        <CardHeader className="py-3">
          <CardTitle className="text-white text-base">{t('auth.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/10 border-white/20 text-white h-9" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">{t('auth.password')}</label>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="bg-white/10 border-white/20 text-white h-9" placeholder={t('auth.password')} />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              {info && <p className="text-xs text-green-400">{info}</p>}
              <div className="flex gap-2 pt-1">
                <Button type="button" onClick={onClose} className="bg-white/10 text-white hover:bg-white/20 h-9 px-4">{t('auth.cancel')}</Button>
                <Button type="submit" className="bg-white text-black hover:bg-white/90 h-9 px-4" disabled={loading}>{loading ? '...' : t('auth.login')}</Button>
              </div>
              <div className="flex justify-between text-xs text-white/70 pt-1">
                <button type="button" onClick={() => setMode('register')} className="underline">Criar conta</button>
                <button type="button" onClick={() => setMode('forgot')} className="underline">Esqueci a senha</button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/10 border-white/20 text-white h-9" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">{t('auth.password')}</label>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="bg-white/10 border-white/20 text-white h-9" placeholder={t('auth.password')} />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              {info && <p className="text-xs text-green-400">{info}</p>}
              <div className="flex gap-2 pt-1">
                <Button type="button" onClick={() => setMode('login')} className="bg-white/10 text-white hover:bg-white/20 h-9 px-4">Voltar</Button>
                <Button type="submit" className="bg-white text-black hover:bg-white/90 h-9 px-4" disabled={loading}>{loading ? '...' : 'Criar conta'}</Button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/10 border-white/20 text-white h-9" placeholder="you@example.com" />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              {info && <p className="text-xs text-green-400">{info}</p>}
              <div className="flex gap-2 pt-1">
                <Button type="button" onClick={() => setMode('login')} className="bg-white/10 text-white hover:bg-white/20 h-9 px-4">Voltar</Button>
                <Button type="submit" className="bg-white text-black hover:bg-white/90 h-9 px-4" disabled={loading}>{loading ? '...' : 'Enviar link'}</Button>
              </div>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">Token</label>
                <Input value={token} onChange={(e) => setToken(e.target.value)} className="bg-white/10 border-white/20 text-white h-9" placeholder="token de reset" />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">Nova senha</label>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="bg-white/10 border-white/20 text-white h-9" placeholder="nova senha" />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              {info && <p className="text-xs text-green-400">{info}</p>}
              <div className="flex gap-2 pt-1">
                <Button type="button" onClick={() => setMode('login')} className="bg-white/10 text-white hover:bg-white/20 h-9 px-4">Voltar</Button>
                <Button type="submit" className="bg-white text-black hover:bg-white/90 h-9 px-4" disabled={loading}>{loading ? '...' : 'Alterar senha'}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}