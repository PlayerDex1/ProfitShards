import { Giveaway } from "@/types/giveaway";

const STORAGE_KEY = 'giveaway_admin_data';

export interface GiveawayStorage {
  giveaways: Giveaway[];
  activeGiveawayId: string | null;
  lastUpdated: string;
}

// Função para obter dados do localStorage
export function getGiveawayData(): GiveawayStorage {
  if (typeof window === 'undefined') {
    return { giveaways: [], activeGiveawayId: null, lastUpdated: new Date().toISOString() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading giveaway data from localStorage:', error);
  }

  return { giveaways: [], activeGiveawayId: null, lastUpdated: new Date().toISOString() };
}

// Função para salvar dados no localStorage
export function saveGiveawayData(data: GiveawayStorage): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString()
    }));
    
    // Disparar evento customizado para notificar outras partes da aplicação
    window.dispatchEvent(new CustomEvent('giveaway-data-updated', { detail: data }));
  } catch (error) {
    console.error('Error saving giveaway data to localStorage:', error);
  }
}

// Função para obter giveaway ativo
export function getActiveGiveaway(): Giveaway | null {
  const data = getGiveawayData();
  if (!data.activeGiveawayId) return null;
  
  return data.giveaways.find(g => g.id === data.activeGiveawayId && g.status === 'active') || null;
}

// Função para definir giveaway ativo
export function setActiveGiveaway(giveawayId: string): void {
  const data = getGiveawayData();
  const updatedData = { ...data, activeGiveawayId: giveawayId };
  saveGiveawayData(updatedData);
}

// Função para adicionar/atualizar giveaway
export function upsertGiveaway(giveaway: Giveaway): void {
  const data = getGiveawayData();
  const existingIndex = data.giveaways.findIndex(g => g.id === giveaway.id);
  
  if (existingIndex >= 0) {
    data.giveaways[existingIndex] = giveaway;
  } else {
    data.giveaways.push(giveaway);
  }
  
  // Se este giveaway está ativo, definir como ativo
  if (giveaway.status === 'active') {
    data.activeGiveawayId = giveaway.id;
  }
  
  saveGiveawayData(data);
}

// Função para deletar giveaway
export function deleteGiveaway(giveawayId: string): void {
  const data = getGiveawayData();
  data.giveaways = data.giveaways.filter(g => g.id !== giveawayId);
  
  // Se estava ativo, remover a referência
  if (data.activeGiveawayId === giveawayId) {
    data.activeGiveawayId = null;
  }
  
  saveGiveawayData(data);
}

// Função para obter todos os giveaways
export function getAllGiveaways(): Giveaway[] {
  return getGiveawayData().giveaways;
}

// Função para inicializar com dados padrão se necessário
export function initializeGiveawayData(): void {
  const data = getGiveawayData();
  
  // Se não há dados, criar um giveaway padrão
  if (data.giveaways.length === 0) {
    const defaultGiveaway: Giveaway = {
      id: 'giveaway_worldshards_box_001',
      title: 'Box WorldShards Grátis!',
      description: 'Ganhe uma box oficial do WorldShards com cartas exclusivas e itens raros!',
      prize: '1x Box WorldShards Oficial',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      maxParticipants: 1000,
      currentParticipants: 247,
      rules: [
        'Apenas uma participação por pessoa',
        'Conta deve estar ativa no site',
        'Ganhador será selecionado aleatoriamente com base nos pontos',
        'Prêmio será enviado via correios (Brasil apenas)',
        'Resultados serão anunciados após o término',
      ],
      requirements: [],
      winnerAnnouncement: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    const initialData: GiveawayStorage = {
      giveaways: [defaultGiveaway],
      activeGiveawayId: defaultGiveaway.id,
      lastUpdated: new Date().toISOString()
    };
    
    saveGiveawayData(initialData);
  }
}