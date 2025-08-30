import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, Users, TrendingUp, Mail, Trophy, 
  RefreshCw, Calendar, Target, Award, Clock
} from 'lucide-react';
import { useI18n } from '@/i18n';

interface GiveawayStats {
  totalGiveaways: number;
  totalParticipants: number;
  totalWinners: number;
  conversionRate: number;
  emailsSent: number;
  emailResponseRate: number;
  avgTimeToClaimHours: number;
  recentGiveaways: {
    id: string;
    title: string;
    participants: number;
    winners: number;
    createdAt: string;
    status: string;
  }[];
}

interface EmailMetrics {
  totalSent: number;
  responded: number;
  pending: number;
  responseRate: number;
  avgResponseTimeHours: number;
}

export function GiveawayAnalytics() {
  const { t } = useI18n();
  const [stats, setStats] = useState<GiveawayStats | null>(null);
  const [emailMetrics, setEmailMetrics] = useState<EmailMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas de giveaways
      const giveawayResponse = await fetch('/api/admin/giveaway-analytics');
      const giveawayData = await giveawayResponse.json();
      
      if (giveawayData.success) {
        setStats(giveawayData.stats);
      }

      // Carregar métricas de email
      const emailResponse = await fetch('/api/admin/email-metrics');
      const emailData = await emailResponse.json();
      
      if (emailData.success) {
        setEmailMetrics(emailData.metrics);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatPercent = (num: number): string => {
    return num.toFixed(1) + '%';
  };

  const formatTime = (hours: number): string => {
    if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours.toFixed(0)}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-blue-500" />
            📊 Analytics de Giveaways
          </h3>
          <p className="text-muted-foreground mt-1">
            Métricas e insights dos seus sorteios
          </p>
        </div>
        <Button
          onClick={loadAnalytics}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalGiveaways || 0}</p>
                <p className="text-sm text-muted-foreground">Total Giveaways</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats?.totalParticipants || 0)}</p>
                <p className="text-sm text-muted-foreground">Total Participantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPercent(stats?.conversionRate || 0)}</p>
                <p className="text-sm text-muted-foreground">Taxa Conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalWinners || 0}</p>
                <p className="text-sm text-muted-foreground">Total Ganhadores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Metrics */}
      {emailMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              📧 Métricas de Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {emailMetrics.totalSent}
                </div>
                <div className="text-sm text-muted-foreground">Emails Enviados</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {emailMetrics.responded}
                </div>
                <div className="text-sm text-muted-foreground">Responderam</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatPercent(emailMetrics.responseRate)}
                </div>
                <div className="text-sm text-muted-foreground">Taxa Resposta</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {formatTime(emailMetrics.avgResponseTimeHours)}
                </div>
                <div className="text-sm text-muted-foreground">Tempo Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Giveaways Performance */}
      {stats?.recentGiveaways && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              📈 Performance Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentGiveaways.map((giveaway) => (
                <div key={giveaway.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium">{giveaway.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(giveaway.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{giveaway.participants}</div>
                      <div className="text-muted-foreground">Participantes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{giveaway.winners}</div>
                      <div className="text-muted-foreground">Ganhadores</div>
                    </div>
                    <Badge className={
                      giveaway.status === 'active' ? 'bg-green-500' :
                      giveaway.status === 'finished' ? 'bg-blue-500' : 'bg-gray-500'
                    }>
                      {giveaway.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      )}
    </div>
  );
}