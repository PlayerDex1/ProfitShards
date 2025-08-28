// Base de dados de equipamentos IDÊNTICOS à Wiki oficial do WorldShards
// Baseado em: https://wiki.worldshards.online/game/gameplay-overview/crafting

export interface WorldShardsEquipment {
  id: string;
  name: string;
  type: 'chestplate' | 'helmet' | 'gloves' | 'boots' | 'weapon' | 'tool';
  weaponType?: 'club' | 'sword_shield' | 'claws' | 'giant_hammer' | 'greatsword' | 'dual_axes';
  toolType?: 'axe' | 'pickaxe' | 'scythe';
  tier: 1 | 2 | 3 | 4 | 5;
  level: 1 | 2 | 3 | 4 | 5;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  luck: number; // Apenas itens coletáveis têm luck > 0
  price: number; // Custo estimado de crafting
  description: string;
  craftingMaterials?: string[];
  isCollectible: boolean; // True = tem luck, False = sem luck
}

// EQUIPAMENTOS EXATOS DA WIKI DO WORLDSHARDS
export const WORLDSHARDS_EQUIPMENT: WorldShardsEquipment[] = [
  
  // ===============================================
  // WEAPONS - 6 TIPOS EXATOS DA WIKI
  // ===============================================
  
  // CLUBS (Clavas) - Tier 1-3, Coletáveis e Não-Coletáveis
  
  // Non-Collectible Clubs (sem luck, mais baratas)
  { 
    id: 'club_t1_basic', 
    name: 'Clava T1', 
    type: 'weapon', 
    weaponType: 'club',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 120, 
    description: 'Clava básica Tier 1 - versão não coletável',
    craftingMaterials: ['Wood', 'Stone'],
    isCollectible: false
  },
  { 
    id: 'club_t2_basic', 
    name: 'Clava T2', 
    type: 'weapon', 
    weaponType: 'club',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 280, 
    description: 'Clava aprimorada Tier 2 - versão não coletável',
    craftingMaterials: ['Iron', 'Wood'],
    isCollectible: false
  },
  { 
    id: 'club_t3_basic', 
    name: 'Clava T3', 
    type: 'weapon', 
    weaponType: 'club',
    tier: 3, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 520, 
    description: 'Clava avançada Tier 3 - versão não coletável',
    craftingMaterials: ['Steel', 'Hardwood'],
    isCollectible: false
  },

  // Collectible Clubs (com luck, mais caras)
  { 
    id: 'club_t1_collectible_common', 
    name: 'Clava Coletável T1 (Comum)', 
    type: 'weapon', 
    weaponType: 'club',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 25, 
    price: 250, 
    description: 'Clava coletável com 25 de sorte',
    craftingMaterials: ['Wood', 'Stone', 'Lucky Crystal'],
    isCollectible: true
  },
  { 
    id: 'club_t1_collectible_uncommon', 
    name: 'Clava Coletável T1 (Incomum)', 
    type: 'weapon', 
    weaponType: 'club',
    tier: 1, 
    level: 1, 
    rarity: 'uncommon', 
    luck: 45, 
    price: 450, 
    description: 'Clava coletável incomum com 45 de sorte',
    craftingMaterials: ['Wood', 'Stone', 'Enhanced Crystal'],
    isCollectible: true
  },
  { 
    id: 'club_t2_collectible_rare', 
    name: 'Clava Coletável T2 (Rara)', 
    type: 'weapon', 
    weaponType: 'club',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 80, 
    price: 950, 
    description: 'Clava coletável rara com 80 de sorte',
    craftingMaterials: ['Iron', 'Wood', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'club_t3_collectible_epic', 
    name: 'Clava Coletável T3 (Épica)', 
    type: 'weapon', 
    weaponType: 'club',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 130, 
    price: 1800, 
    description: 'Clava coletável épica com 130 de sorte',
    craftingMaterials: ['Steel', 'Hardwood', 'Epic Crystal'],
    isCollectible: true
  },

  // SWORD & SHIELD (Espada e Escudo) - Combo balanceado
  
  // Non-Collectible Sword & Shield
  { 
    id: 'sword_shield_t1_basic', 
    name: 'Espada e Escudo T1', 
    type: 'weapon', 
    weaponType: 'sword_shield',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 180, 
    description: 'Combo básico de espada e escudo - não coletável',
    craftingMaterials: ['Iron', 'Leather'],
    isCollectible: false
  },
  { 
    id: 'sword_shield_t2_basic', 
    name: 'Espada e Escudo T2', 
    type: 'weapon', 
    weaponType: 'sword_shield',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 380, 
    description: 'Combo aprimorado de espada e escudo - não coletável',
    craftingMaterials: ['Steel', 'Iron'],
    isCollectible: false
  },
  { 
    id: 'sword_shield_t3_basic', 
    name: 'Espada e Escudo T3', 
    type: 'weapon', 
    weaponType: 'sword_shield',
    tier: 3, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 750, 
    description: 'Combo avançado de espada e escudo - não coletável',
    craftingMaterials: ['Mithril', 'Steel'],
    isCollectible: false
  },

  // Collectible Sword & Shield
  { 
    id: 'sword_shield_t1_collectible_common', 
    name: 'Espada e Escudo Coletável T1 (Comum)', 
    type: 'weapon', 
    weaponType: 'sword_shield',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 35, 
    price: 350, 
    description: 'Combo coletável com 35 de sorte',
    craftingMaterials: ['Iron', 'Leather', 'Balance Crystal'],
    isCollectible: true
  },
  { 
    id: 'sword_shield_t2_collectible_rare', 
    name: 'Espada e Escudo Coletável T2 (Raro)', 
    type: 'weapon', 
    weaponType: 'sword_shield',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 90, 
    price: 1200, 
    description: 'Combo coletável raro com 90 de sorte',
    craftingMaterials: ['Steel', 'Iron', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'sword_shield_t3_collectible_epic', 
    name: 'Espada e Escudo Coletável T3 (Épico)', 
    type: 'weapon', 
    weaponType: 'sword_shield',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 150, 
    price: 2500, 
    description: 'Combo coletável épico com 150 de sorte',
    craftingMaterials: ['Mithril', 'Steel', 'Epic Crystal'],
    isCollectible: true
  },

  // CLAWS (Garras) - Ataques rápidos
  
  // Non-Collectible Claws
  { 
    id: 'claws_t1_basic', 
    name: 'Garras T1', 
    type: 'weapon', 
    weaponType: 'claws',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 150, 
    description: 'Garras básicas para ataques rápidos - não coletável',
    craftingMaterials: ['Iron', 'Monster Parts'],
    isCollectible: false
  },
  { 
    id: 'claws_t2_basic', 
    name: 'Garras T2', 
    type: 'weapon', 
    weaponType: 'claws',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 320, 
    description: 'Garras aprimoradas para ataques rápidos - não coletável',
    craftingMaterials: ['Steel', 'Enhanced Parts'],
    isCollectible: false
  },

  // Collectible Claws
  { 
    id: 'claws_t1_collectible_uncommon', 
    name: 'Garras Coletáveis T1 (Incomum)', 
    type: 'weapon', 
    weaponType: 'claws',
    tier: 1, 
    level: 1, 
    rarity: 'uncommon', 
    luck: 42, 
    price: 480, 
    description: 'Garras coletáveis velozes com 42 de sorte',
    craftingMaterials: ['Iron', 'Monster Parts', 'Speed Crystal'],
    isCollectible: true
  },
  { 
    id: 'claws_t2_collectible_rare', 
    name: 'Garras Coletáveis T2 (Rara)', 
    type: 'weapon', 
    weaponType: 'claws',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 75, 
    price: 980, 
    description: 'Garras coletáveis letais com 75 de sorte',
    craftingMaterials: ['Steel', 'Enhanced Parts', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'claws_t3_collectible_epic', 
    name: 'Garras Coletáveis T3 (Épica)', 
    type: 'weapon', 
    weaponType: 'claws',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 125, 
    price: 2100, 
    description: 'Garras coletáveis devastadoras com 125 de sorte',
    craftingMaterials: ['Mithril', 'Legendary Parts', 'Epic Crystal'],
    isCollectible: true
  },

  // GIANT HAMMER (Martelo Grande) - Alto dano
  
  // Non-Collectible Giant Hammer
  { 
    id: 'giant_hammer_t1_basic', 
    name: 'Martelo Grande T1', 
    type: 'weapon', 
    weaponType: 'giant_hammer',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 200, 
    description: 'Martelo pesado básico - não coletável',
    craftingMaterials: ['Iron', 'Stone', 'Wood'],
    isCollectible: false
  },
  { 
    id: 'giant_hammer_t2_basic', 
    name: 'Martelo Grande T2', 
    type: 'weapon', 
    weaponType: 'giant_hammer',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 420, 
    description: 'Martelo pesado aprimorado - não coletável',
    craftingMaterials: ['Steel', 'Heavy Stone'],
    isCollectible: false
  },

  // Collectible Giant Hammer
  { 
    id: 'giant_hammer_t1_collectible_common', 
    name: 'Martelo Grande Coletável T1 (Comum)', 
    type: 'weapon', 
    weaponType: 'giant_hammer',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 38, 
    price: 400, 
    description: 'Martelo coletável devastador com 38 de sorte',
    craftingMaterials: ['Iron', 'Stone', 'Wood', 'Power Crystal'],
    isCollectible: true
  },
  { 
    id: 'giant_hammer_t2_collectible_rare', 
    name: 'Martelo Grande Coletável T2 (Raro)', 
    type: 'weapon', 
    weaponType: 'giant_hammer',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 85, 
    price: 1300, 
    description: 'Martelo coletável esmagador com 85 de sorte',
    craftingMaterials: ['Steel', 'Heavy Stone', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'giant_hammer_t3_collectible_epic', 
    name: 'Martelo Grande Coletável T3 (Épico)', 
    type: 'weapon', 
    weaponType: 'giant_hammer',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 140, 
    price: 2400, 
    description: 'Martelo coletável titânico com 140 de sorte',
    craftingMaterials: ['Mithril', 'Titan Stone', 'Epic Crystal'],
    isCollectible: true
  },

  // GREATSWORD (Espada Grande) - Duas mãos
  
  // Non-Collectible Greatsword
  { 
    id: 'greatsword_t1_basic', 
    name: 'Espada Grande T1', 
    type: 'weapon', 
    weaponType: 'greatsword',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 170, 
    description: 'Espada de duas mãos básica - não coletável',
    craftingMaterials: ['Steel', 'Iron'],
    isCollectible: false
  },
  { 
    id: 'greatsword_t2_basic', 
    name: 'Espada Grande T2', 
    type: 'weapon', 
    weaponType: 'greatsword',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 400, 
    description: 'Espada de duas mãos aprimorada - não coletável',
    craftingMaterials: ['Mithril', 'Steel'],
    isCollectible: false
  },

  // Collectible Greatsword
  { 
    id: 'greatsword_t1_collectible_uncommon', 
    name: 'Espada Grande Coletável T1 (Incomum)', 
    type: 'weapon', 
    weaponType: 'greatsword',
    tier: 1, 
    level: 1, 
    rarity: 'uncommon', 
    luck: 48, 
    price: 550, 
    description: 'Espada grande coletável afiada com 48 de sorte',
    craftingMaterials: ['Steel', 'Iron', 'Sharp Crystal'],
    isCollectible: true
  },
  { 
    id: 'greatsword_t2_collectible_rare', 
    name: 'Espada Grande Coletável T2 (Rara)', 
    type: 'weapon', 
    weaponType: 'greatsword',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 88, 
    price: 1150, 
    description: 'Espada grande coletável cortante com 88 de sorte',
    craftingMaterials: ['Mithril', 'Steel', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'greatsword_t3_collectible_epic', 
    name: 'Espada Grande Coletável T3 (Épica)', 
    type: 'weapon', 
    weaponType: 'greatsword',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 135, 
    price: 2300, 
    description: 'Espada grande coletável lendária com 135 de sorte',
    craftingMaterials: ['Dragon Steel', 'Mithril', 'Epic Crystal'],
    isCollectible: true
  },

  // DUAL AXES (Machados Duplos) - Par balanceado
  
  // Non-Collectible Dual Axes
  { 
    id: 'dual_axes_t1_basic', 
    name: 'Machados Duplos T1', 
    type: 'weapon', 
    weaponType: 'dual_axes',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 160, 
    description: 'Par de machados básico - não coletável',
    craftingMaterials: ['Iron', 'Hardwood'],
    isCollectible: false
  },
  { 
    id: 'dual_axes_t2_basic', 
    name: 'Machados Duplos T2', 
    type: 'weapon', 
    weaponType: 'dual_axes',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 350, 
    description: 'Par de machados aprimorado - não coletável',
    craftingMaterials: ['Steel', 'Ironwood'],
    isCollectible: false
  },

  // Collectible Dual Axes
  { 
    id: 'dual_axes_t1_collectible_common', 
    name: 'Machados Duplos Coletáveis T1 (Comum)', 
    type: 'weapon', 
    weaponType: 'dual_axes',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 32, 
    price: 400, 
    description: 'Machados coletáveis balanceados com 32 de sorte',
    craftingMaterials: ['Iron', 'Hardwood', 'Balance Crystal'],
    isCollectible: true
  },
  { 
    id: 'dual_axes_t1_collectible_uncommon', 
    name: 'Machados Duplos Coletáveis T1 (Incomum)', 
    type: 'weapon', 
    weaponType: 'dual_axes',
    tier: 1, 
    level: 1, 
    rarity: 'uncommon', 
    luck: 52, 
    price: 650, 
    description: 'Machados coletáveis ferozes com 52 de sorte',
    craftingMaterials: ['Iron', 'Hardwood', 'Ferocity Crystal'],
    isCollectible: true
  },
  { 
    id: 'dual_axes_t2_collectible_rare', 
    name: 'Machados Duplos Coletáveis T2 (Raro)', 
    type: 'weapon', 
    weaponType: 'dual_axes',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 82, 
    price: 1100, 
    description: 'Machados coletáveis devastadores com 82 de sorte',
    craftingMaterials: ['Steel', 'Ironwood', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'dual_axes_t3_collectible_epic', 
    name: 'Machados Duplos Coletáveis T3 (Épico)', 
    type: 'weapon', 
    weaponType: 'dual_axes',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 128, 
    price: 2200, 
    description: 'Machados coletáveis apocalípticos com 128 de sorte',
    craftingMaterials: ['Mithril', 'Dragon Wood', 'Epic Crystal'],
    isCollectible: true
  },

  // ===============================================
  // ARMOR - 4 PEÇAS (Peitoral, Elmo, Luvas, Botas)
  // ===============================================

  // CHESTPLATE (Peitoral) - Proteção do torso
  
  // Non-Collectible Chestplates
  { 
    id: 'chestplate_t1_basic', 
    name: 'Peitoral T1', 
    type: 'chestplate',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 90, 
    description: 'Proteção básica para o torso - não coletável',
    craftingMaterials: ['Leather', 'Thread'],
    isCollectible: false
  },
  { 
    id: 'chestplate_t2_basic', 
    name: 'Peitoral T2', 
    type: 'chestplate',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 220, 
    description: 'Proteção aprimorada para o torso - não coletável',
    craftingMaterials: ['Iron', 'Leather'],
    isCollectible: false
  },
  { 
    id: 'chestplate_t3_basic', 
    name: 'Peitoral T3', 
    type: 'chestplate',
    tier: 3, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 480, 
    description: 'Proteção avançada para o torso - não coletável',
    craftingMaterials: ['Steel', 'Iron'],
    isCollectible: false
  },

  // Collectible Chestplates
  { 
    id: 'chestplate_t1_collectible_common', 
    name: 'Peitoral Coletável T1 (Comum)', 
    type: 'chestplate',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 22, 
    price: 200, 
    description: 'Peitoral coletável com 22 de sorte',
    craftingMaterials: ['Leather', 'Thread', 'Luck Crystal'],
    isCollectible: true
  },
  { 
    id: 'chestplate_t2_collectible_uncommon', 
    name: 'Peitoral Coletável T2 (Incomum)', 
    type: 'chestplate',
    tier: 2, 
    level: 1, 
    rarity: 'uncommon', 
    luck: 38, 
    price: 380, 
    description: 'Peitoral coletável resistente com 38 de sorte',
    craftingMaterials: ['Iron', 'Leather', 'Defense Crystal'],
    isCollectible: true
  },
  { 
    id: 'chestplate_t3_collectible_rare', 
    name: 'Peitoral Coletável T3 (Raro)', 
    type: 'chestplate',
    tier: 3, 
    level: 1, 
    rarity: 'rare', 
    luck: 68, 
    price: 750, 
    description: 'Peitoral coletável robusto com 68 de sorte',
    craftingMaterials: ['Steel', 'Iron', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'chestplate_t4_collectible_epic', 
    name: 'Peitoral Coletável T4 (Épico)', 
    type: 'chestplate',
    tier: 4, 
    level: 1, 
    rarity: 'epic', 
    luck: 105, 
    price: 1500, 
    description: 'Peitoral coletável impenetrável com 105 de sorte',
    craftingMaterials: ['Mithril', 'Steel', 'Epic Crystal'],
    isCollectible: true
  },

  // HELMET (Elmo) - Proteção da cabeça
  
  // Non-Collectible Helmets
  { 
    id: 'helmet_t1_basic', 
    name: 'Elmo T1', 
    type: 'helmet',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 70, 
    description: 'Proteção básica para a cabeça - não coletável',
    craftingMaterials: ['Iron', 'Padding'],
    isCollectible: false
  },
  { 
    id: 'helmet_t2_basic', 
    name: 'Elmo T2', 
    type: 'helmet',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 170, 
    description: 'Proteção aprimorada para a cabeça - não coletável',
    craftingMaterials: ['Steel', 'Leather'],
    isCollectible: false
  },
  { 
    id: 'helmet_t3_basic', 
    name: 'Elmo T3', 
    type: 'helmet',
    tier: 3, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 350, 
    description: 'Proteção avançada para a cabeça - não coletável',
    craftingMaterials: ['Mithril', 'Steel'],
    isCollectible: false
  },

  // Collectible Helmets
  { 
    id: 'helmet_t1_collectible_common', 
    name: 'Elmo Coletável T1 (Comum)', 
    type: 'helmet',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 18, 
    price: 150, 
    description: 'Elmo coletável com 18 de sorte',
    craftingMaterials: ['Iron', 'Padding', 'Luck Crystal'],
    isCollectible: true
  },
  { 
    id: 'helmet_t2_collectible_rare', 
    name: 'Elmo Coletável T2 (Raro)', 
    type: 'helmet',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 48, 
    price: 540, 
    description: 'Elmo coletável nobre com 48 de sorte',
    craftingMaterials: ['Steel', 'Leather', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'helmet_t3_collectible_epic', 
    name: 'Elmo Coletável T3 (Épico)', 
    type: 'helmet',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 78, 
    price: 1100, 
    description: 'Elmo coletável majestoso com 78 de sorte',
    craftingMaterials: ['Mithril', 'Steel', 'Epic Crystal'],
    isCollectible: true
  },

  // GLOVES (Luvas) - Proteção das mãos
  
  // Non-Collectible Gloves
  { 
    id: 'gloves_t1_basic', 
    name: 'Luvas T1', 
    type: 'gloves',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 50, 
    description: 'Proteção básica para as mãos - não coletável',
    craftingMaterials: ['Leather', 'Thread'],
    isCollectible: false
  },
  { 
    id: 'gloves_t2_basic', 
    name: 'Luvas T2', 
    type: 'gloves',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 120, 
    description: 'Proteção aprimorada para as mãos - não coletável',
    craftingMaterials: ['Iron', 'Leather'],
    isCollectible: false
  },

  // Collectible Gloves
  { 
    id: 'gloves_t1_collectible_uncommon', 
    name: 'Luvas Coletáveis T1 (Incomum)', 
    type: 'gloves',
    tier: 1, 
    level: 1, 
    rarity: 'uncommon', 
    luck: 20, 
    price: 220, 
    description: 'Luvas coletáveis hábeis com 20 de sorte',
    craftingMaterials: ['Leather', 'Thread', 'Skill Crystal'],
    isCollectible: true
  },
  { 
    id: 'gloves_t2_collectible_rare', 
    name: 'Luvas Coletáveis T2 (Rara)', 
    type: 'gloves',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 35, 
    price: 450, 
    description: 'Luvas coletáveis precisas com 35 de sorte',
    craftingMaterials: ['Iron', 'Leather', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'gloves_t3_collectible_epic', 
    name: 'Luvas Coletáveis T3 (Épica)', 
    type: 'gloves',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 58, 
    price: 900, 
    description: 'Luvas coletáveis mestras com 58 de sorte',
    craftingMaterials: ['Steel', 'Iron', 'Epic Crystal'],
    isCollectible: true
  },

  // BOOTS (Botas) - Proteção dos pés
  
  // Non-Collectible Boots
  { 
    id: 'boots_t1_basic', 
    name: 'Botas T1', 
    type: 'boots',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 60, 
    description: 'Proteção básica para os pés - não coletável',
    craftingMaterials: ['Leather', 'Sole'],
    isCollectible: false
  },
  { 
    id: 'boots_t2_basic', 
    name: 'Botas T2', 
    type: 'boots',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 140, 
    description: 'Proteção aprimorada para os pés - não coletável',
    craftingMaterials: ['Iron', 'Leather'],
    isCollectible: false
  },

  // Collectible Boots
  { 
    id: 'boots_t1_collectible_common', 
    name: 'Botas Coletáveis T1 (Comum)', 
    type: 'boots',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 15, 
    price: 180, 
    description: 'Botas coletáveis ágeis com 15 de sorte',
    craftingMaterials: ['Leather', 'Sole', 'Speed Crystal'],
    isCollectible: true
  },
  { 
    id: 'boots_t1_collectible_uncommon', 
    name: 'Botas Coletáveis T1 (Incomum)', 
    type: 'boots',
    tier: 1, 
    level: 1, 
    rarity: 'uncommon', 
    luck: 25, 
    price: 280, 
    description: 'Botas coletáveis velozes com 25 de sorte',
    craftingMaterials: ['Leather', 'Sole', 'Swift Crystal'],
    isCollectible: true
  },
  { 
    id: 'boots_t2_collectible_rare', 
    name: 'Botas Coletáveis T2 (Rara)', 
    type: 'boots',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 42, 
    price: 500, 
    description: 'Botas coletáveis relâmpago com 42 de sorte',
    craftingMaterials: ['Iron', 'Leather', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'boots_t3_collectible_epic', 
    name: 'Botas Coletáveis T3 (Épica)', 
    type: 'boots',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 65, 
    price: 1000, 
    description: 'Botas coletáveis sônicas com 65 de sorte',
    craftingMaterials: ['Steel', 'Iron', 'Epic Crystal'],
    isCollectible: true
  },

  // ===============================================
  // TOOLS - 3 TIPOS EXATOS DA WIKI
  // ===============================================

  // AXE (Machado) - Para cortar árvores
  
  // Non-Collectible Axes
  { 
    id: 'axe_t1_basic', 
    name: 'Machado T1', 
    type: 'tool', 
    toolType: 'axe',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 70, 
    description: 'Machado básico para cortar árvores - não coletável',
    craftingMaterials: ['Wood', 'Stone'],
    isCollectible: false
  },
  { 
    id: 'axe_t2_basic', 
    name: 'Machado T2', 
    type: 'tool', 
    toolType: 'axe',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 170, 
    description: 'Machado aprimorado para cortar árvores - não coletável',
    craftingMaterials: ['Iron', 'Wood'],
    isCollectible: false
  },

  // Collectible Axes
  { 
    id: 'axe_t1_collectible_common', 
    name: 'Machado Coletável T1 (Comum)', 
    type: 'tool', 
    toolType: 'axe',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 18, 
    price: 200, 
    description: 'Machado coletável eficiente com 18 de sorte',
    craftingMaterials: ['Wood', 'Stone', 'Luck Crystal'],
    isCollectible: true
  },
  { 
    id: 'axe_t2_collectible_rare', 
    name: 'Machado Coletável T2 (Raro)', 
    type: 'tool', 
    toolType: 'axe',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 45, 
    price: 500, 
    description: 'Machado coletável cortante com 45 de sorte',
    craftingMaterials: ['Iron', 'Wood', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'axe_t3_collectible_epic', 
    name: 'Machado Coletável T3 (Épico)', 
    type: 'tool', 
    toolType: 'axe',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 72, 
    price: 1000, 
    description: 'Machado coletável devastador com 72 de sorte',
    craftingMaterials: ['Steel', 'Ironwood', 'Epic Crystal'],
    isCollectible: true
  },

  // PICKAXE (Picareta) - Para mineração
  
  // Non-Collectible Pickaxes
  { 
    id: 'pickaxe_t1_basic', 
    name: 'Picareta T1', 
    type: 'tool', 
    toolType: 'pickaxe',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 80, 
    description: 'Picareta básica para mineração - não coletável',
    craftingMaterials: ['Iron', 'Wood'],
    isCollectible: false
  },
  { 
    id: 'pickaxe_t2_basic', 
    name: 'Picareta T2', 
    type: 'tool', 
    toolType: 'pickaxe',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 190, 
    description: 'Picareta aprimorada para mineração - não coletável',
    craftingMaterials: ['Steel', 'Iron'],
    isCollectible: false
  },

  // Collectible Pickaxes
  { 
    id: 'pickaxe_t1_collectible_uncommon', 
    name: 'Picareta Coletável T1 (Incomum)', 
    type: 'tool', 
    toolType: 'pickaxe',
    tier: 1, 
    level: 1, 
    rarity: 'uncommon', 
    luck: 28, 
    price: 330, 
    description: 'Picareta coletável perfurante com 28 de sorte',
    craftingMaterials: ['Iron', 'Wood', 'Mining Crystal'],
    isCollectible: true
  },
  { 
    id: 'pickaxe_t2_collectible_rare', 
    name: 'Picareta Coletável T2 (Rara)', 
    type: 'tool', 
    toolType: 'pickaxe',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 52, 
    price: 620, 
    description: 'Picareta coletável penetrante com 52 de sorte',
    craftingMaterials: ['Steel', 'Iron', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'pickaxe_t3_collectible_epic', 
    name: 'Picareta Coletável T3 (Épica)', 
    type: 'tool', 
    toolType: 'pickaxe',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 82, 
    price: 1250, 
    description: 'Picareta coletável perfuradora com 82 de sorte',
    craftingMaterials: ['Mithril', 'Steel', 'Epic Crystal'],
    isCollectible: true
  },

  // SCYTHE (Foice) - Para colheita
  
  // Non-Collectible Scythes
  { 
    id: 'scythe_t1_basic', 
    name: 'Foice T1', 
    type: 'tool', 
    toolType: 'scythe',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 75, 
    description: 'Foice básica para colheita - não coletável',
    craftingMaterials: ['Iron', 'Wood'],
    isCollectible: false
  },
  { 
    id: 'scythe_t2_basic', 
    name: 'Foice T2', 
    type: 'tool', 
    toolType: 'scythe',
    tier: 2, 
    level: 1, 
    rarity: 'common', 
    luck: 0, 
    price: 180, 
    description: 'Foice aprimorada para colheita - não coletável',
    craftingMaterials: ['Steel', 'Hardwood'],
    isCollectible: false
  },

  // Collectible Scythes
  { 
    id: 'scythe_t1_collectible_common', 
    name: 'Foice Coletável T1 (Comum)', 
    type: 'tool', 
    toolType: 'scythe',
    tier: 1, 
    level: 1, 
    rarity: 'common', 
    luck: 22, 
    price: 250, 
    description: 'Foice coletável ceifadora com 22 de sorte',
    craftingMaterials: ['Iron', 'Wood', 'Harvest Crystal'],
    isCollectible: true
  },
  { 
    id: 'scythe_t1_collectible_uncommon', 
    name: 'Foice Coletável T1 (Incomum)', 
    type: 'tool', 
    toolType: 'scythe',
    tier: 1, 
    level: 1, 
    rarity: 'uncommon', 
    luck: 32, 
    price: 380, 
    description: 'Foice coletável colheitadeira com 32 de sorte',
    craftingMaterials: ['Iron', 'Wood', 'Crop Crystal'],
    isCollectible: true
  },
  { 
    id: 'scythe_t2_collectible_rare', 
    name: 'Foice Coletável T2 (Rara)', 
    type: 'tool', 
    toolType: 'scythe',
    tier: 2, 
    level: 1, 
    rarity: 'rare', 
    luck: 55, 
    price: 680, 
    description: 'Foice coletável segadora com 55 de sorte',
    craftingMaterials: ['Steel', 'Hardwood', 'Rare Crystal'],
    isCollectible: true
  },
  { 
    id: 'scythe_t3_collectible_epic', 
    name: 'Foice Coletável T3 (Épica)', 
    type: 'tool', 
    toolType: 'scythe',
    tier: 3, 
    level: 1, 
    rarity: 'epic', 
    luck: 85, 
    price: 1350, 
    description: 'Foice coletável devastadora com 85 de sorte',
    craftingMaterials: ['Mithril', 'Dragon Wood', 'Epic Crystal'],
    isCollectible: true
  },
];