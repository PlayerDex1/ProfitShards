import React from "react";
import { Gamepad2, ShoppingCart, HelpCircle, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <div className="hidden lg:block w-80 bg-background/80 backdrop-blur-md border-l border-border/50 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header da Sidebar */}
        <div className="text-center pb-6 border-b border-border/30">
          <h3 className="text-xl font-bold text-foreground">🔗 Links Rápidos</h3>
          <p className="text-sm text-muted-foreground">Acesso direto às ferramentas</p>
        </div>

        {/* Play Now */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 rounded-xl p-6 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200 group">
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-500/20 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
              <Gamepad2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-green-900 dark:text-green-100 mb-3 text-xl">
                🎮 Play Now
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Acesse o WorldShards e comece sua aventura
              </p>
              <a 
                href="https://www.worldshards.online/en" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 text-sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Jogar Agora
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Marketplace */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200 group">
          <div className="text-center space-y-4">
            <div className="p-4 bg-blue-500/20 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 text-xl">
                🛒 Marketplace
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                Compre e venda itens, equipamentos e tokens
              </p>
              <a 
                href="https://openloot.com/games/worldshards" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  OpenLoot
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* FAQ & Help */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 rounded-xl p-6 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-200 group">
          <div className="text-center space-y-4">
            <div className="p-4 bg-purple-500/20 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
              <HelpCircle className="h-10 w-10 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-3 text-xl">
                ❓ FAQ & Ajuda
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                Perguntas frequentes e guias de uso
              </p>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 text-sm"
                onClick={() => {
                  try {
                    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
                      const element = document.getElementById('faq-section');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  } catch (error) {
                    console.error('Error scrolling to FAQ:', error);
                  }
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Ver FAQ
              </Button>
            </div>
          </div>
        </div>

        {/* Footer da Sidebar */}
        <div className="pt-6 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            WorldShards Calculator
          </p>
          <p className="text-xs text-muted-foreground">
            Ferramentas essenciais para o jogo
          </p>
        </div>
      </div>
    </div>
  );
}
