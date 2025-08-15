# 🎮 Sistema de Equipamento - Worldshards Calculator

## ✨ Demonstração do Sistema

Este projeto implementa uma interface de equipamento completa para o jogo Worldshards, baseada na interface original mostrada na imagem.

### 🎯 Funcionalidades Implementadas

- **Interface Modal Responsiva** com tema escuro
- **Sistema de 4 Equipamentos**: Arma, Machado, Armadura e Picareta
- **5 Níveis de Raridade** com cores dinâmicas
- **Editor Inline** para cada equipamento
- **Cálculo Automático** do Total Luck
- **Design Fiel** à interface original

### 🖼️ Screenshots da Interface

```
┌─────────────────────────────────────────────────────────┐
│                    Équipement - Navriix                │
│         Configuration d'équipement pour cette session  │
├─────────────────────────────────────────────────────────┤
│  Arme                    │  Armure                    │
│  Rareté: Rare           │  Rareté: Uncommun          │
│  Niveau de chance: 12   │  Niveau de chance: 11      │
│  [✏️]                   │  [✏️]                       │
│                         │                             │
│  Hache                  │  Pioche                    │
│  Rareté: Rare           │  Rareté: Rare              │
│  Niveau de chance: 12   │  Niveau de chance: 12      │
│  [✏️]                   │  [✏️]                       │
├─────────────────────────────────────────────────────────┤
│                    Total Luck: 47                     │
└─────────────────────────────────────────────────────────┘
```

### 🚀 Como Usar

1. **Clique no botão "Équipement"** na página principal
2. **Visualize** seus equipamentos atuais
3. **Clique no ícone ✏️** para editar qualquer equipamento
4. **Altere raridade e nível de chance** conforme necessário
5. **O Total Luck é calculado automaticamente**

### 🎨 Sistema de Raridade

| Raridade | Cor | Label Francês |
|----------|-----|---------------|
| Common | 🟤 Cinza | Commun |
| Uncommon | 🟢 Verde | Uncommun |
| Rare | 🔵 Azul | Rare |
| Epic | 🟣 Roxo | Épique |
| Legendary | 🟡 Amarelo | Légendaire |

### ⚙️ Tecnologias Utilizadas

- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **Shadcn/ui** para componentes base
- **Hooks personalizados** para gerenciamento de estado

### 📁 Estrutura do Projeto

```
src/
├── types/
│   └── equipment.ts          # Tipos TypeScript
├── components/equipment/
│   ├── EquipmentInterface.tsx    # Interface principal
│   ├── EquipmentButton.tsx       # Botão de abertura
│   ├── EquipmentEditor.tsx       # Editor inline
│   └── index.ts                  # Exportações
├── hooks/
│   └── useEquipment.ts       # Gerenciamento de estado
└── pages/
    └── calculator.tsx        # Página principal integrada
```

### 🔧 Instalação e Uso

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/worldshards-calculator.git

# Instale as dependências
cd worldshards-calculator/client
npm install

# Execute em modo de desenvolvimento
npm run dev

# Ou construa para produção
npm run build
```

### 📱 Responsividade

- **Desktop**: Layout em duas colunas
- **Mobile**: Layout adaptativo com scroll
- **Tablet**: Layout intermediário responsivo

### 🎯 Próximas Funcionalidades

- [ ] **Persistência** no localStorage
- [ ] **Import/Export** de configurações
- [ ] **Histórico** de múltiplas sessões
- [ ] **Validação** de regras de equipamento
- [ ] **API** para sincronização

### 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature
3. Commit suas mudanças
4. Abrir um Pull Request

### 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

### 🎮 Sobre Worldshards

Worldshards é um jogo que utiliza um sistema de equipamento com níveis de "Luck" que afetam as chances de sucesso em diferentes atividades do jogo.

---

**Desenvolvido com ❤️ para a comunidade Worldshards**

*Interface baseada na imagem original fornecida pelo usuário*
