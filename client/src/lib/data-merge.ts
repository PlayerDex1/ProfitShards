import { HistoryItem } from '@/types/calculator';

interface ConflictResolution {
  strategy: 'server' | 'client' | 'merge' | 'newest';
  resolved: boolean;
  data: any;
}

export class DataMerger {
  // Resolver conflitos entre dados locais e do servidor
  static resolveConflicts(
    localData: any[],
    serverData: any[],
    dataType: 'calculations' | 'mapDrops' | 'equipment'
  ): { merged: any[], conflicts: ConflictResolution[] } {
    const conflicts: ConflictResolution[] = [];
    const merged: any[] = [];
    const seen = new Set<string>();

    // Estratégia baseada no tipo de dados
    const strategy = this.getStrategy(dataType);

    // Adicionar dados do servidor primeiro (prioridade)
    serverData.forEach(item => {
      const key = this.getItemKey(item, dataType);
      if (key) {
        seen.add(key);
        merged.push(item);
      }
    });

    // Adicionar dados locais que não existem no servidor
    localData.forEach(item => {
      const key = this.getItemKey(item, dataType);
      if (key && !seen.has(key)) {
        // Verificar se há conflito temporal
        const serverItem = serverData.find(s => this.getItemKey(s, dataType) === key);
        if (serverItem) {
          const conflict = this.resolveTemporalConflict(item, serverItem, strategy);
          conflicts.push(conflict);
          
          if (conflict.resolved) {
            merged.push(conflict.data);
          }
        } else {
          merged.push(item);
        }
      }
    });

    // Ordenar por timestamp (mais recente primeiro)
    merged.sort((a, b) => {
      const timestampA = this.getTimestamp(a, dataType);
      const timestampB = this.getTimestamp(b, dataType);
      return timestampB - timestampA;
    });

    return { merged, conflicts };
  }

  // Estratégia de resolução baseada no tipo de dados
  private static getStrategy(dataType: string): 'server' | 'client' | 'merge' | 'newest' {
    switch (dataType) {
      case 'calculations':
        return 'newest'; // Usar o mais recente para cálculos
      case 'mapDrops':
        return 'server'; // Priorizar servidor para map drops
      case 'equipment':
        return 'merge'; // Fazer merge para equipamentos
      default:
        return 'newest';
    }
  }

  // Gerar chave única para o item
  private static getItemKey(item: any, dataType: string): string | null {
    switch (dataType) {
      case 'calculations':
        return item.timestamp ? item.timestamp.toString() : null;
      case 'mapDrops':
        return item.timestamp ? item.timestamp.toString() : null;
      case 'equipment':
        return item.id || item.timestamp?.toString() || null;
      default:
        return item.timestamp ? item.timestamp.toString() : null;
    }
  }

  // Obter timestamp do item
  private static getTimestamp(item: any, dataType: string): number {
    switch (dataType) {
      case 'calculations':
        return item.timestamp || item.createdAt || 0;
      case 'mapDrops':
        return item.timestamp || item.createdAt || 0;
      case 'equipment':
        return item.createdAt || item.timestamp || 0;
      default:
        return item.timestamp || item.createdAt || 0;
    }
  }

  // Resolver conflito temporal entre dados locais e do servidor
  private static resolveTemporalConflict(
    localItem: any,
    serverItem: any,
    strategy: string
  ): ConflictResolution {
    const localTimestamp = this.getTimestamp(localItem, 'calculations');
    const serverTimestamp = this.getTimestamp(serverItem, 'calculations');

    switch (strategy) {
      case 'server':
        return {
          strategy: 'server',
          resolved: true,
          data: serverItem
        };

      case 'client':
        return {
          strategy: 'client',
          resolved: true,
          data: localItem
        };

      case 'newest':
        const newestItem = localTimestamp > serverTimestamp ? localItem : serverItem;
        return {
          strategy: 'newest',
          resolved: true,
          data: newestItem
        };

      case 'merge':
        return {
          strategy: 'merge',
          resolved: true,
          data: this.mergeItems(localItem, serverItem)
        };

      default:
        return {
          strategy: 'newest',
          resolved: true,
          data: localTimestamp > serverTimestamp ? localItem : serverItem
        };
    }
  }

  // Fazer merge de dois itens
  private static mergeItems(localItem: any, serverItem: any): any {
    // Estratégia de merge: combinar campos únicos, priorizar servidor para conflitos
    const merged = { ...localItem, ...serverItem };
    
    // Para cálculos, manter o timestamp mais recente
    if (localItem.timestamp && serverItem.timestamp) {
      merged.timestamp = Math.max(localItem.timestamp, serverItem.timestamp);
    }
    
    return merged;
  }

  // Detectar mudanças significativas nos dados
  static detectSignificantChanges(oldData: any[], newData: any[]): boolean {
    if (oldData.length !== newData.length) return true;
    
    // Verificar se há mudanças nos primeiros 10 itens (mais recentes)
    const checkCount = Math.min(10, oldData.length);
    
    for (let i = 0; i < checkCount; i++) {
      const oldItem = oldData[i];
      const newItem = newData[i];
      
      if (!this.itemsEqual(oldItem, newItem)) {
        return true;
      }
    }
    
    return false;
  }

  // Comparar se dois itens são iguais
  private static itemsEqual(item1: any, item2: any): boolean {
    if (!item1 || !item2) return false;
    
    // Comparar campos principais
    const fields = ['timestamp', 'tokensDropped', 'finalProfit', 'roi', 'mapSize'];
    
    for (const field of fields) {
      if (item1[field] !== item2[field]) {
        return false;
      }
    }
    
    return true;
  }

  // Otimizar dados para sincronização (remover duplicatas, ordenar)
  static optimizeForSync(data: any[], dataType: string): any[] {
    const seen = new Set<string>();
    const optimized: any[] = [];
    
    // Ordenar por timestamp (mais recente primeiro)
    const sorted = [...data].sort((a, b) => {
      const timestampA = this.getTimestamp(a, dataType);
      const timestampB = this.getTimestamp(b, dataType);
      return timestampB - timestampA;
    });
    
    // Remover duplicatas
    sorted.forEach(item => {
      const key = this.getItemKey(item, dataType);
      if (key && !seen.has(key)) {
        seen.add(key);
        optimized.push(item);
      }
    });
    
    return optimized;
  }

  // Validar integridade dos dados
  static validateData(data: any[], dataType: string): { valid: any[], invalid: any[] } {
    const valid: any[] = [];
    const invalid: any[] = [];
    
    data.forEach(item => {
      if (this.isValidItem(item, dataType)) {
        valid.push(item);
      } else {
        invalid.push(item);
      }
    });
    
    return { valid, invalid };
  }

  // Verificar se um item é válido
  private static isValidItem(item: any, dataType: string): boolean {
    if (!item || typeof item !== 'object') return false;
    
    switch (dataType) {
      case 'calculations':
        return !!(
          item.timestamp &&
          typeof item.timestamp === 'number' &&
          item.formData &&
          item.results &&
          typeof item.results.finalProfit === 'number'
        );
        
      case 'mapDrops':
        return !!(
          item.timestamp &&
          typeof item.timestamp === 'number' &&
          typeof item.tokensDropped === 'number' &&
          item.mapSize
        );
        
      case 'equipment':
        return !!(
          item.id &&
          item.name &&
          item.session
        );
        
      default:
        return !!(item.timestamp && typeof item.timestamp === 'number');
    }
  }
}