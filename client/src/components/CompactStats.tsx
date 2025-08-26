import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

interface CompactStatsData {
  totalRuns: number;
  totalProfit: number;
  activePlayers: number;
}

export function CompactStats() {
  const [stats, setStats] = useState<CompactStatsData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/community-metrics');
        const data = await response.json();
        if (data.success) {
          setStats({
            totalRuns: data.stats.totalRuns,
            totalProfit: data.stats.totalProfit,
            activePlayers: data.stats.activePlayers
          });
        }
      } catch (error) {
        console.error('Error fetching compact stats:', error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return null;

  return (
    <div className="flex items-center space-x-3">
      <Badge variant="secondary" className="flex items-center space-x-1 bg-orange-500/10 text-orange-700 border-orange-500/20">
        <TrendingUp className="h-3 w-3" />
        <span className="text-xs font-medium">{stats.totalRuns} runs</span>
      </Badge>
      
      <Badge variant="secondary" className="flex items-center space-x-1 bg-green-500/10 text-green-700 border-green-500/20">
        <DollarSign className="h-3 w-3" />
        <span className="text-xs font-medium">${(stats.totalProfit / 1000).toFixed(0)}k</span>
      </Badge>
      
      <Badge variant="secondary" className="flex items-center space-x-1 bg-blue-500/10 text-blue-700 border-blue-500/20">
        <Users className="h-3 w-3" />
        <span className="text-xs font-medium">{stats.activePlayers} ativos</span>
      </Badge>
    </div>
  );
}