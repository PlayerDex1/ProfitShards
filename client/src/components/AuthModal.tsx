import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <Card className="w-full max-w-md bg-black border-gray-800">
        <CardHeader className="py-4">
          <CardTitle className="text-white text-lg text-center">🎮 Calculadora Worldshards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="text-center space-y-3">
            <p className="text-white/80 text-sm">
              Esta calculadora funciona <strong>100% offline</strong> no seu navegador!
            </p>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-left">
              <p className="text-green-300 text-xs mb-2">
                <strong>✅ Funcionalidades Completas:</strong>
              </p>
              <ul className="text-green-200/80 text-xs space-y-1 ml-2">
                <li>• Calculadora de lucro avançada</li>
                <li>• Gráficos interativos e análises</li>
                <li>• Histórico de cálculos salvo</li>
                <li>• Modo escuro/claro</li>
                <li>• Interface responsiva</li>
                <li>• Dados salvos no navegador</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-left">
              <p className="text-blue-300 text-xs mb-2">
                <strong>💡 Como funciona:</strong>
              </p>
              <p className="text-blue-200/80 text-xs">
                Todos os seus dados ficam salvos localmente no navegador. 
                Não precisamos de login ou internet após o carregamento inicial!
              </p>
            </div>
            
            <Button 
              type="button" 
              onClick={onClose} 
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 h-10 font-medium"
            >
              🚀 Começar a Calcular
            </Button>
            
            <p className="text-[11px] text-white/50 text-center">
              Seus cálculos são salvos automaticamente no navegador
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
