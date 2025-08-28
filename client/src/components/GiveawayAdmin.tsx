import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/i18n";
import { 
  Gift, Plus, Edit, Trash2, Users, Trophy, Calendar, 
  Clock, Target, Sparkles, Crown, Download, Upload,
  Eye, EyeOff, Play, Pause, Square, BarChart3
} from "lucide-react";
import { Giveaway } from "@/types/giveaway";
import { WinnerManager } from "@/components/WinnerManager";
import { RequirementsEditor } from "@/components/RequirementsEditor";
import { MainGiveawaysEditor } from "@/components/MainGiveawaysEditor";
import { LotteryManager } from "@/components/LotteryManager";
import { LotteryHistory } from "@/components/LotteryHistory";

interface GiveawayAdminProps {
  className?: string;
}

export function GiveawayAdmin({ className }: GiveawayAdminProps) {
  const { t } = useI18n();

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                🎁 Gerenciamento de Giveaways
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie giveaways principais e vencedores
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="main-giveaways" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="main-giveaways" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Principais
            </TabsTrigger>
            <TabsTrigger value="lottery" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Sorteio Atual
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="winners" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Ganhadores
            </TabsTrigger>
          </TabsList>

          {/* Aba Giveaways Principais */}
          <TabsContent value="main-giveaways" className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    Giveaways Principais
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    Edite os giveaways que todos os usuários verão na Home
                  </p>
                </div>
              </div>
              
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded border border-purple-200 dark:border-purple-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
                    <Target className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                      Como funciona:
                    </h4>
                    <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                      <li>• Edite os giveaways diretamente aqui</li>
                      <li>• Clique "Salvar" para aplicar na Home</li>
                      <li>• Todos os usuários verão instantaneamente</li>
                      <li>• Não precisa mexer em código!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <MainGiveawaysEditor />
          </TabsContent>

          <TabsContent value="lottery">
            <LotteryManager />
          </TabsContent>

          <TabsContent value="history">
            <LotteryHistory />
          </TabsContent>

          <TabsContent value="winners">
            <WinnerManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}