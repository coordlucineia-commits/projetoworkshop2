# LuTe Academy — Sistema de Gestão

**High-Performance Web Application — Cian Edition**

---

## 🏋️ Sobre o Projeto

Sistema completo de gestão para a **LuTe Academy**, academia focada em treinos de alta performance. O projeto combina uma landing page impactante com um dashboard administrativo completo, seguindo um design system dark/cian high-contrast.

---

## 🎨 Design System

O projeto segue rigorosamente as diretrizes documentadas em **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)**:

### Identidade Visual
- **Conceito:** High-contrast, kinetic, minimal-dark, cyber-aqua
- **Paleta:** Dark-first (#0A0A0A) com accent cian (#00F9E4)
- **Tipografia:** Neo-grotesk, bold/black, uppercase
- **Shapes:** Cards 16px, Buttons/Inputs pill (9999px)

### Cores Principais
```css
--cian-500: #00F9E4;  /* Primary */
--gray-900: #0A0A0A;  /* Background */
--gray-700: #1C1C1C;  /* Surface */
--gray-600: #2A2A2A;  /* Border */
```

---

## 📁 Estrutura do Projeto

```
├── DESIGN-SYSTEM.md          # Design system completo
├── DASHBOARD.md               # Documentação do dashboard
├── src/
│   ├── app/
│   │   ├── App.tsx           # Componente principal + roteamento
│   │   └── components/
│   │       ├── LoginModal.tsx      # Modal de autenticação
│   │       ├── Dashboard.tsx       # Painel administrativo
│   │       └── figma/
│   │           └── ImageWithFallback.tsx
│   ├── styles/
│   │   ├── theme.css         # CSS variables e tokens
│   │   └── fonts.css         # Font imports
│   └── imports/              # Assets do Figma
├── package.json
└── README.md
```

---

## 🚀 Tecnologias

### Core
- **React 18.3** — UI Library
- **TypeScript** — Type safety
- **Tailwind CSS v4** — Utility-first styling
- **Vite** — Build tool

### UI/UX
- **Motion (Framer Motion)** — Animações
- **Radix UI** — Componentes acessíveis (Dialog, etc.)
- **Lucide React** — Ícones

### Data Visualization
- **Recharts** — Gráficos animados

### Utilities
- **clsx / tailwind-merge** — Class composition

---

## 📄 Páginas e Funcionalidades

### 1. Landing Page (`/`)

**Seções:**
- ✅ Header com navegação
- ✅ Hero com KPIs (Horário, Dias, Área, Alunos, Fundação)
- ✅ Quem Somos (Pilares e Números)
- ✅ Depoimentos
- ✅ Estrutura (Equipamentos)
- ✅ Programas
- ✅ Planos (3 tiers)
- ✅ Equipe (Coaches)
- ✅ FAQ
- ✅ Localização e Contato
- ✅ CTA Final
- ✅ Footer

**Recursos:**
- Mobile-first responsivo (402px base)
- Animações de scroll (Motion)
- Imagens com hover colorido
- Modal de login integrado

### 2. Dashboard (`/dashboard`)

**Documentação:** Ver [DASHBOARD.md](./DASHBOARD.md)

**Módulos:**
- ✅ Sidebar de navegação
- ✅ Header com filtros
- ✅ 6 Cards de métricas
- ✅ Gráfico de crescimento (Area Chart)
- ✅ Lista de turistas (destaque)
- ✅ Alunos recentes
- 🔄 Sub-rotas (Alunos, Check-ins, etc.) — Pendente

**Features:**
- Gráficos animados (Recharts)
- Loading states
- Hover effects
- Logout funcional

---

## 🎯 Instalação e Uso

### Pré-requisitos
- Node.js 18+
- pnpm (recomendado)

### Instalar dependências
```bash
pnpm install
```

### Desenvolvimento
```bash
# IMPORTANTE: Não use `pnpm run dev`
# O servidor Vite já está rodando automaticamente
# Apenas salve os arquivos e veja as mudanças
```

### Build
```bash
# ⚠️ NÃO rode `pnpm run build`
# Este ambiente usa um entrypoint customizado
```

---

## 📱 Responsividade

### Breakpoints
```css
--mobile: 402px;   /* Target design */
--sm: 640px;
--md: 768px;
--lg: 1024px;
--xl: 1280px;
```

### Mobile Rules (402px)
- Padding: `12px` lateral (24px total)
- Largura útil: `378px`
- Grids colapsam para coluna única
- Fontes escalam: `text-3xl md:text-5xl lg:text-6xl`
- **Zero scroll horizontal**

---

## 🎬 Animações

### Princípios
- **Fast:** 150–200ms (Feedback)
- **Normal:** 200–300ms (Transitions)
- **Slow:** 300–500ms (Transformações)

### Padrões
```tsx
// Fade in + translateY
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.1 }}

// Slide in lateral
initial={{ x: -300 }}
animate={{ x: 0 }}

// Hover glow
hover:shadow-[0_0_30px_rgba(0,249,228,0.3)]
```

---

## 🔐 Autenticação

### Status Atual
- Login via modal (UI completo)
- Redirecionamento para dashboard
- Logout funcional
- **Sem backend** — Mock apenas

### Próximos Passos
- [ ] Integrar com API
- [ ] JWT tokens
- [ ] Protected routes
- [ ] Session management

---

## 🧩 Componentes Principais

### `<App />`
Gerencia roteamento e estado global
```tsx
currentView: "landing" | "dashboard"
handleLogin() → redirect to dashboard
handleLogout() → back to landing
```

### `<LoginModal />`
Dialog acessível com formulário
```tsx
Props: open, onOpenChange, onLogin
Features: Show/hide password, validação
```

### `<Dashboard />`
Painel administrativo completo
```tsx
Props: onLogout
Features: Stats, charts, lists, navigation
```

---

## 📊 Dados Mock

### Landing Page
- Todos os textos do conteúdo
- Imagens do Unsplash
- Depoimentos reais

### Dashboard
```tsx
memberGrowthData: 12 meses de dados
recentMembers: 5 membros recentes
tourists: 3 membros sem check-in
stats: 6 métricas principais
```

---

## ♿ Acessibilidade

### Implementado
✅ Contraste WCAG AA/AAA  
✅ Estados de foco visíveis  
✅ Labels semânticos  
✅ `aria-*` attributes (Radix UI)  
✅ Navegação por teclado  
✅ Screen reader support

### Cores com Alto Contraste
- `#00F9E4` on `#0A0A0A` → 12:1 ✅
- `#00C4B3` on `#1C1C1C` → 8:1 ✅
- White on `#0A0A0A` → 21:1 ✅

---

## 🚧 Roadmap

### Fase 1 — Landing + Dashboard Base ✅
- [x] Design system
- [x] Landing page completa
- [x] Login modal
- [x] Dashboard overview
- [x] Gráficos animados
- [x] Responsividade

### Fase 2 — Dashboard Completo 🔄
- [ ] Tela de Alunos (CRUD)
- [ ] Tela de Check-ins
- [ ] Modo Recepção
- [ ] Configurações
- [ ] Relatórios

### Fase 3 — Backend 🔜
- [ ] API REST
- [ ] Autenticação real
- [ ] Database
- [ ] WebSockets (real-time)

### Fase 4 — Advanced 🔜
- [ ] Pagamentos (Stripe)
- [ ] E-mail notifications
- [ ] Mobile app (React Native)
- [ ] Analytics

---

## 🐛 Troubleshooting

### "Module not found"
```bash
pnpm install
```

### Imagens não carregam
- Verifique se o arquivo existe em `src/imports/`
- Use `ImageWithFallback` component

### Animações lentas
- Verifique GPU acceleration
- Reduza motion se `prefers-reduced-motion`

---

## 📝 Convenções de Código

### Nomenclatura
- **Componentes:** PascalCase (`LoginModal.tsx`)
- **Utilitários:** camelCase (`handleLogin`)
- **Constantes:** UPPER_CASE (`DESIGN_SYSTEM`)

### Estrutura
```tsx
// 1. Imports
// 2. Types/Interfaces
// 3. Constants/Mock data
// 4. Component
// 5. Export
```

### Tailwind
- Mobile-first: `px-3 md:px-6`
- Cores do design system: `bg-[#0A0A0A]`
- Border radius: `rounded-[16px]` ou `rounded-full`

---

## 📚 Documentação Adicional

- **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)** — Guia completo de design
- **[DASHBOARD.md](./DASHBOARD.md)** — Documentação do dashboard

---

## 👥 Equipe

**Design & Development:** LuTe Academy Team  
**Design System:** Cian Edition (High-Performance)

---

## 📄 Licença

© 2026 LuTe Academy. Todos os direitos reservados.

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-11
