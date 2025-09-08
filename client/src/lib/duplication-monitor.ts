// 🛡️ SISTEMA DE MONITORAMENTO DE DUPLICAÇÃO
// Previne e monitora duplicações no sistema

interface DuplicationAlert {
  timestamp: number;
  userEmail: string;
  mapSize: string;
  tokens: number;
  source: string;
  reason: string;
}

class DuplicationMonitor {
  private static instance: DuplicationMonitor;
  private alerts: DuplicationAlert[] = [];
  private maxAlerts = 50;

  static getInstance(): DuplicationMonitor {
    if (!DuplicationMonitor.instance) {
      DuplicationMonitor.instance = new DuplicationMonitor();
    }
    return DuplicationMonitor.instance;
  }

  // Registrar tentativa de duplicação
  logDuplicationAttempt(userEmail: string, mapSize: string, tokens: number, source: string, reason: string) {
    const alert: DuplicationAlert = {
      timestamp: Date.now(),
      userEmail,
      mapSize,
      tokens,
      source,
      reason
    };

    this.alerts.push(alert);
    
    // Manter apenas os últimos alertas
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }

    console.warn(`🛡️ DUPLICAÇÃO PREVENIDA: ${userEmail} - ${mapSize} - ${tokens} tokens (${source}: ${reason})`);
    
    // Se muitas duplicações, alertar
    this.checkForPatterns();
  }

  // Verificar padrões de duplicação
  private checkForPatterns() {
    const recentAlerts = this.alerts.filter(alert => 
      Date.now() - alert.timestamp < 5 * 60 * 1000 // Últimos 5 minutos
    );

    if (recentAlerts.length > 10) {
      console.error(`🚨 ALERTA: ${recentAlerts.length} tentativas de duplicação nos últimos 5 minutos!`);
      this.reportToAdmin(recentAlerts);
    }
  }

  // Reportar para admin
  private reportToAdmin(alerts: DuplicationAlert[]) {
    const summary = alerts.reduce((acc, alert) => {
      const key = `${alert.userEmail}-${alert.source}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.error('🚨 RELATÓRIO DE DUPLICAÇÃO:', summary);
  }

  // Obter estatísticas
  getStats() {
    const now = Date.now();
    const last24h = this.alerts.filter(alert => now - alert.timestamp < 24 * 60 * 60 * 1000);
    const last1h = this.alerts.filter(alert => now - alert.timestamp < 60 * 60 * 1000);

    return {
      total: this.alerts.length,
      last24h: last24h.length,
      last1h: last1h.length,
      topSources: this.getTopSources(),
      topUsers: this.getTopUsers()
    };
  }

  private getTopSources() {
    const sources = this.alerts.reduce((acc, alert) => {
      acc[alert.source] = (acc[alert.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sources)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }

  private getTopUsers() {
    const users = this.alerts.reduce((acc, alert) => {
      acc[alert.userEmail] = (acc[alert.userEmail] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(users)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }

  // Limpar alertas antigos
  clearOldAlerts() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 horas
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
  }
}

// Exportar instância singleton
export const duplicationMonitor = DuplicationMonitor.getInstance();

// Função utilitária para verificar duplicação antes de salvar
export function checkForDuplication(userEmail: string, mapSize: string, tokens: number, source: string): boolean {
  const monitor = duplicationMonitor;
  
  // Verificar se há tentativa recente similar
  const recentSimilar = monitor['alerts'].filter(alert => 
    alert.userEmail === userEmail &&
    alert.mapSize === mapSize &&
    alert.tokens === tokens &&
    Date.now() - alert.timestamp < 30000 // 30 segundos
  );

  if (recentSimilar.length > 0) {
    monitor.logDuplicationAttempt(userEmail, mapSize, tokens, source, 'similar_attempt_recent');
    return true; // Duplicação detectada
  }

  return false; // Não é duplicação
}

// Função para obter estatísticas (útil para debug)
export function getDuplicationStats() {
  return duplicationMonitor.getStats();
}