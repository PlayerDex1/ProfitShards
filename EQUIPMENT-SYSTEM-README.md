# Sistema de Equipamento - Worldshards Calculator

## Visão Geral

Este sistema implementa uma interface de equipamento baseada na imagem fornecida, permitindo aos usuários visualizar e configurar seus equipamentos para calcular o "Total Luck" da sessão.

## Funcionalidades

### 🎯 Interface Principal
- **Modal responsivo** com tema escuro
- **Layout em duas colunas** para os 4 tipos de equipamento
- **Cálculo automático** do Total Luck
- **Design fiel** à imagem original

### ⚔️ Tipos de Equipamento
1. **Arme (Weapon)** - Arma
2. **Hache (Axe)** - Machado  
3. **Armure (Armor)** - Armadura
4. **Pioche (Pickaxe)** - Picareta

### 🎨 Sistema de Raridade
- **Common** (Commun) - Cinza
- **Uncommon** (Uncommun) - Verde
- **Rare** (Rare) - Azul
- **Epic** (Épique) - Roxo
- **Legendary** (Légendaire) - Amarelo

### ✏️ Edição de Equipamentos
- **Botão de edição** em cada equipamento
- **Editor inline** com campos para:
  - Raridade (dropdown)
  - Nível de Chance (1-20)
- **Validação** de entrada
- **Salvar/Cancelar** ações

## Arquivos Criados

```
client/src/
├── types/
│   └── equipment.ts          # Tipos e interfaces
├── components/equipment/
│   ├── EquipmentInterface.tsx    # Interface principal
│   ├── EquipmentButton.tsx       # Botão para abrir
│   ├── EquipmentEditor.tsx       # Editor de equipamentos
│   └── index.ts                  # Exportações
└── hooks/
    └── useEquipment.ts       # Hook de gerenciamento
```

## Como Usar

### 1. Botão de Equipamento
```tsx
<EquipmentButton onClick={openEquipment} totalLuck={totalLuck} />
```

### 2. Interface Modal
```tsx
<EquipmentInterface
  session={session}
  totalLuck={totalLuck}
  onClose={closeEquipment}
  onEquipmentChange={updateEquipment}
/>
```

### 3. Hook de Gerenciamento
```tsx
const { 
  session, 
  totalLuck, 
  isOpen, 
  openEquipment, 
  closeEquipment, 
  updateEquipment 
} = useEquipment();
```

## Integração

O sistema foi integrado na página principal do calculador (`client/src/pages/calculator.tsx`) com:

- **Botão de equipamento** acima da calculadora
- **Modal responsivo** que abre ao clicar
- **Estado persistente** durante a sessão
- **Cálculo automático** do Total Luck

## Dados Padrão

O sistema inicia com equipamentos de exemplo:
- **Weapon & Axe**: Rare, Luck 12
- **Armor**: Uncommon, Luck 11  
- **Pickaxe**: Rare, Luck 12
- **Total Luck**: 47

## Estilização

- **Tema escuro** (slate-900)
- **Cores de raridade** dinâmicas
- **Responsivo** para mobile e desktop
- **Animações** suaves de hover
- **Ícones** do Lucide React

## Próximos Passos

1. **Persistência** - Salvar configurações no localStorage
2. **Import/Export** - Compartilhar configurações
3. **Histórico** - Múltiplas sessões
4. **Validação** - Regras de equipamento
5. **API** - Sincronização com servidor
