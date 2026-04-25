# Dashboard — LuTe Academy

**Painel Administrativo — Sistema de Gestão**

---

## 📊 Visão Geral

Dashboard completo para gestão da academia LuTe Academy, com métricas em tempo real, visualizações de dados e controle de membros.

---

## 🎨 Design System Aplicado

Seguindo rigorosamente as diretrizes do **DESIGN-SYSTEM.md**:

### Cores
- **Background:** `#0A0A0A` (Gray 900)
- **Surface:** `#121212`, `#1C1C1C` (Gray 800/700)
- **Primary:** `#00F9E4` (Cian 500)
- **Text:** `#FFFFFF`, `#9A9A9A`, `#606060`
- **Border:** `#2A2A2A` (Gray 600)

### Border Radius
- **Cards:** `16px` — Todos os cards de estatísticas, gráficos e listas
- **Botões:** `9999px` (pílula) — Navegação sidebar, botões de ação
- **Inputs/Selects:** `9999px` (pílula) — Filtros de período
- **Avatares:** `100%` (círculo perfeito)

### Tipografia
- **Títulos:** Bold/Black, Uppercase, Tracking tight
- **Labels:** Font-mono, Uppercase, Tracking widest
- **Body:** Regular weight, Alta legibilidade

---

## 🚀 Funcionalidades

### 1. Sidebar de Navegação
- **Dashboard** — Visão geral (ativo)
- **Alunos** — Gestão de membros
- **Check-ins** — Registro de presença
- **Modo Recepção** — Interface simplificada
- **Configurações** — Preferências do sistema

**Comportamento:**
- Item ativo com background `#00F9E4` e texto preto
- Hover suave com `#1C1C1C`
- Transições de 200ms
- Ícones de 18px

### 2. Header
#### Informações
- Título da página atual
- Data formatada (Domingo, 22 Fev 2026)

#### Controles
- **Filtro de Período:** Dropdown (Mês/Semana/Ano)
- **Filtro de Status:** Dropdown (Ativos/Todos/Inativos)
- **Theme Switcher:** Toggle Dark/Light (futuro)
- **Ativar Recepção:** Botão primário cian

### 3. Cards de Métricas

| Métrica | Valor | Descrição |
|---------|-------|-----------|
| **ATIVOS** | 248 | Alunos ativos no momento |
| **INATIVOS** | 20 | 12 pausados, 8 cancelados |
| **HOJE** | 87 | Check-ins realizados hoje |
| **FREQUÊNCIA** | 3.4/sem | Média semanal de treinos |
| **TURISTAS** | 15 | 10+ dias sem check-in |
| **NOVOS** | 23 | Cadastros este mês |

**Design:**
- Background: `#1C1C1C`
- Border: `#2A2A2A` (hover: `#00F9E4`)
- Ícone em container com background cian semitransparente
- Números grandes em cian
- Subtítulos em cinza médio

### 4. Gráfico de Crescimento

**Tipo:** Area Chart (Recharts)

**Dados:**
- Últimos 12 meses de crescimento
- Valores: 180 → 328 membros
- Crescimento: +24%

**Animação:**
- Duration: 1500ms
- Easing: suave
- Fill gradient: Cian com opacidade

**Interatividade:**
- Tooltip com fundo dark
- Hover nos pontos
- Grid sutil (#2A2A2A)

### 5. Lista de Turistas (Destacada)

**Descrição:** Membros sem check-in há 10+ dias

**Visual:**
- Card com border `#00F9E4` (destaque)
- 3 membros visíveis
- Avatar circular cian
- Badge do plano (PREMIUM/BASIC/ELITE)

**Ação:**
- "Ver todos os 15 turistas" com seta

### 6. Alunos Recentes

**Dados:**
- 5 últimos cadastros
- Nome, idade, tempo desde cadastro
- Plano contratado

**Interatividade:**
- Hover com background `#2A2A2A`
- Seta de ação no hover
- Transição suave

---

## 🎬 Animações

### Loading State
```tsx
duration: 1000ms
spinner: border-[#00F9E4] com rotação
texto: "Carregando..." uppercase
```

### Entrada de Componentes
```tsx
Sidebar: slideIn from left (-300px → 0)
Header: slideIn from top (-50px → 0)
Cards: fadeIn + translateY (20px → 0)
Delay incremental: 50ms entre cards
```

### Hover States
```tsx
Cards: border-color transition 200ms
Buttons: background + shadow glow 300ms
Lists: background 200ms
```

### Gráfico
```tsx
Area animation: 1500ms
Gradient fill: cian opacity 0.3 → 0
Stroke: #00F9E4, width 2px
```

---

## 📐 Layout Responsivo

### Desktop (>1024px)
- Sidebar fixa 256px
- Grid de cards: 3 colunas
- Gráfico: 2/3 da largura
- Turistas: 1/3 da largura

### Tablet (768-1024px)
- Sidebar fixa
- Grid de cards: 2 colunas
- Layouts empilham

### Mobile (<768px)
- Sidebar colapsável/overlay
- Grid de cards: 1 coluna
- Padding reduzido: 12px

---

## 🔧 Componentes Principais

### `<Dashboard />`
**Props:**
- `onLogout: () => void` — Callback para sair

**Estado:**
```tsx
isDarkMode: boolean
isLoading: boolean
activeNav: string
```

**Data:**
```tsx
memberGrowthData: { month, members }[]
recentMembers: { name, plan, status, age, avatar }[]
tourists: { name, plan, days, avatar }[]
```

---

## 📊 Integrações Futuras

### Backend
- [ ] API de métricas em tempo real
- [ ] WebSocket para check-ins ao vivo
- [ ] Autenticação JWT
- [ ] Filtros dinâmicos

### Funcionalidades
- [ ] Exportar relatórios PDF
- [ ] Notificações push
- [ ] Chat de suporte
- [ ] Gestão de turmas/horários
- [ ] Pagamentos e faturas

---

## 🎯 Próximos Passos

1. **Tela de Alunos** — CRUD completo
2. **Tela de Check-ins** — Registro e histórico
3. **Modo Recepção** — Interface simplificada para totem
4. **Configurações** — Preferências e perfil
5. **Relatórios** — Analytics avançados

---

## 🚦 Status

| Feature | Status |
|---------|--------|
| Design System | ✅ Completo |
| Sidebar Navigation | ✅ Completo |
| Cards de Métricas | ✅ Completo |
| Gráfico Animado | ✅ Completo |
| Lista de Turistas | ✅ Completo |
| Alunos Recentes | ✅ Completo |
| Responsividade | ✅ Completo |
| Loading State | ✅ Completo |
| Autenticação Real | 🔄 Pendente |
| Sub-rotas | 🔄 Pendente |

---

## 💡 Observações Técnicas

### Performance
- Animações GPU-accelerated (transform/opacity)
- Lazy loading de componentes pesados
- Memoização de dados estáticos

### Acessibilidade
- Contraste WCAG AA/AAA
- Estados de foco visíveis
- Labels semânticos
- Navegação por teclado

### Manutenibilidade
- Componentes modulares
- Props tipadas (TypeScript)
- Dados mockados separados
- Design System centralizado

---

**Version:** 1.0  
**Last Updated:** 2026-04-11  
**Maintainer:** LuTe Academy Development Team
