// 📊 SISTEMA DE LOGS ESTRUTURADOS
// Para melhor monitoramento e debug

export interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

class StructuredLogger {
  private static instance: StructuredLogger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  log(level: LogEntry['level'], category: string, message: string, data?: any, userId?: string) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      userId,
      sessionId: this.getSessionId()
    };

    this.logs.push(entry);
    
    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log no console com formatação
    this.logToConsole(entry);
  }

  private logToConsole(entry: LogEntry) {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    
    switch (entry.level) {
      case 'error':
        console.error(prefix, entry.message, entry.data);
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.data);
        break;
      case 'debug':
        console.debug(prefix, entry.message, entry.data);
        break;
      default:
        console.log(prefix, entry.message, entry.data);
    }
  }

  private getSessionId(): string {
    // Gerar um ID de sessão simples baseado no timestamp
    return `session_${Math.floor(Date.now() / (1000 * 60 * 5))}`; // 5 minutos
  }

  // Métodos de conveniência
  info(category: string, message: string, data?: any, userId?: string) {
    this.log('info', category, message, data, userId);
  }

  warn(category: string, message: string, data?: any, userId?: string) {
    this.log('warn', category, message, data, userId);
  }

  error(category: string, message: string, data?: any, userId?: string) {
    this.log('error', category, message, data, userId);
  }

  debug(category: string, message: string, data?: any, userId?: string) {
    this.log('debug', category, message, data, userId);
  }

  // Obter logs por categoria
  getLogsByCategory(category: string, limit = 50): LogEntry[] {
    return this.logs
      .filter(log => log.category === category)
      .slice(-limit);
  }

  // Obter logs por usuário
  getLogsByUser(userId: string, limit = 50): LogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }

  // Obter estatísticas
  getStats() {
    const now = Date.now();
    const last1h = this.logs.filter(log => now - log.timestamp < 60 * 60 * 1000);
    const last24h = this.logs.filter(log => now - log.timestamp < 24 * 60 * 60 * 1000);

    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = this.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.logs.length,
      last1h: last1h.length,
      last24h: last24h.length,
      byLevel,
      byCategory: Object.entries(byCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    };
  }

  // Limpar logs antigos
  clearOldLogs() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 horas
    this.logs = this.logs.filter(log => log.timestamp > cutoff);
  }

  // Exportar logs para debug
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = 'timestamp,level,category,message,userId,sessionId';
      const rows = this.logs.map(log => 
        `${log.timestamp},${log.level},${log.category},"${log.message}",${log.userId || ''},${log.sessionId}`
      );
      return [headers, ...rows].join('\n');
    }
    
    return JSON.stringify(this.logs, null, 2);
  }
}

// Exportar instância singleton
export const logger = StructuredLogger.getInstance();

// Funções de conveniência para uso global
export const logInfo = (category: string, message: string, data?: any, userId?: string) => 
  logger.info(category, message, data, userId);

export const logWarn = (category: string, message: string, data?: any, userId?: string) => 
  logger.warn(category, message, data, userId);

export const logError = (category: string, message: string, data?: any, userId?: string) => 
  logger.error(category, message, data, userId);

export const logDebug = (category: string, message: string, data?: any, userId?: string) => 
  logger.debug(category, message, data, userId);