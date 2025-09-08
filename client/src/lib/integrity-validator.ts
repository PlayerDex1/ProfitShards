// 🔍 SISTEMA DE VALIDAÇÃO DE INTEGRIDADE
// Verifica consistência dos dados antes de salvar

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MapDropData {
  mapSize: string;
  tokensDropped: number;
  timestamp: number;
  luck?: number;
  loads?: number;
  level?: string;
  tier?: string;
  charge?: number;
}

class IntegrityValidator {
  private static instance: IntegrityValidator;

  static getInstance(): IntegrityValidator {
    if (!IntegrityValidator.instance) {
      IntegrityValidator.instance = new IntegrityValidator();
    }
    return IntegrityValidator.instance;
  }

  validateMapDrop(data: MapDropData, userId?: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validações obrigatórias
    if (!data.mapSize) {
      errors.push('mapSize é obrigatório');
    } else if (!['small', 'medium', 'large', 'xlarge'].includes(data.mapSize)) {
      errors.push('mapSize deve ser: small, medium, large ou xlarge');
    }

    if (!data.tokensDropped || data.tokensDropped <= 0) {
      errors.push('tokensDropped deve ser maior que 0');
    } else if (data.tokensDropped > 10000) {
      warnings.push('tokensDropped muito alto (>10k) - verificar se é correto');
    }

    if (!data.timestamp || data.timestamp <= 0) {
      errors.push('timestamp é obrigatório e deve ser válido');
    } else {
      const now = Date.now();
      const diff = Math.abs(now - data.timestamp);
      if (diff > 24 * 60 * 60 * 1000) { // 24 horas
        warnings.push('timestamp muito antigo ou futuro');
      }
    }

    // Validações opcionais
    if (data.luck !== undefined) {
      if (data.luck < 0 || data.luck > 10000) {
        warnings.push('luck fora do range esperado (0-10000)');
      }
    }

    if (data.loads !== undefined) {
      if (data.loads < 0 || data.loads > 1000) {
        warnings.push('loads fora do range esperado (0-1000)');
      }
    }

    if (data.charge !== undefined) {
      if (data.charge < 0 || data.charge > 1000) {
        warnings.push('charge fora do range esperado (0-1000)');
      }
    }

    // Validações de consistência
    if (data.luck && data.tokensDropped) {
      const efficiency = data.tokensDropped / data.luck;
      if (efficiency > 100) {
        warnings.push('Eficiência muito alta (>100) - verificar dados');
      }
    }

    // Validações específicas por usuário (se necessário)
    if (userId) {
      this.validateUserSpecific(data, userId, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateUserSpecific(data: MapDropData, userId: string, warnings: string[]) {
    // Aqui podem ser adicionadas validações específicas por usuário
    // Por exemplo, verificar se o usuário tem histórico de dados suspeitos
    
    // Exemplo: verificar se o usuário está fazendo muitas runs em pouco tempo
    const recentRuns = this.getRecentRunsForUser(userId);
    if (recentRuns > 10) {
      warnings.push('Usuário com muitas runs recentes - verificar se não é bot');
    }
  }

  private getRecentRunsForUser(userId: string): number {
    // Implementar lógica para contar runs recentes do usuário
    // Por enquanto, retorna 0
    return 0;
  }

  // Validar dados antes de enviar para o servidor
  validateBeforeServerSave(data: MapDropData, userId?: string): ValidationResult {
    const result = this.validateMapDrop(data, userId);
    
    if (!result.isValid) {
      console.error('🚫 DADOS INVÁLIDOS - Salvamento bloqueado:', result.errors);
    }
    
    if (result.warnings.length > 0) {
      console.warn('⚠️ AVISOS DE VALIDAÇÃO:', result.warnings);
    }

    return result;
  }

  // Validar resposta do servidor
  validateServerResponse(response: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!response) {
      errors.push('Resposta do servidor vazia');
      return { isValid: false, errors, warnings };
    }

    if (!response.success) {
      errors.push(`Servidor retornou erro: ${response.error || 'Erro desconhecido'}`);
    }

    if (response.duplicate) {
      warnings.push('Servidor detectou duplicação');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Exportar instância singleton
export const integrityValidator = IntegrityValidator.getInstance();

// Funções de conveniência
export function validateMapDrop(data: MapDropData, userId?: string): ValidationResult {
  return integrityValidator.validateMapDrop(data, userId);
}

export function validateBeforeServerSave(data: MapDropData, userId?: string): ValidationResult {
  return integrityValidator.validateBeforeServerSave(data, userId);
}

export function validateServerResponse(response: any): ValidationResult {
  return integrityValidator.validateServerResponse(response);
}