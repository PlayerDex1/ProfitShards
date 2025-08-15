import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(username, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Erro ao autenticar");
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <Card className="w-full max-w-sm bg-black border-gray-800">
        <CardHeader className="py-3">
          <CardTitle className="text-white text-base">Entrar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-white/70 mb-1">Nick</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/10 border-white/20 text-white h-9"
                placeholder="Seu nick"
              />
            </div>
            <div>
              <label className="block text-xs text-white/70 mb-1">Senha</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="bg-white/10 border-white/20 text-white h-9"
                placeholder="Sua senha"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2 pt-1">
              <Button type="button" onClick={onClose} className="bg-white/10 text-white hover:bg-white/20 h-9 px-4">Cancelar</Button>
              <Button type="submit" className="bg-white text-black hover:bg-white/90 h-9 px-4" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
            <p className="text-[11px] text-white/60">As credenciais ficam apenas no seu navegador.</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}