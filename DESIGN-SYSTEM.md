# Design System — LuTe Academy

**Cian Edition — High-Performance Visual System**

---

## 1. Concept and Style

A high-impact, performance-driven visual system that blends fitness intensity with digital precision. The aesthetic is built on contrast, energy, and control, combining dark environments with vibrant highlights to create a sense of movement, strength, and transformation. The system balances aggressive visual energy with structured clarity, ensuring usability is never compromised.

**Keywords:** high-contrast, kinetic, bold, minimal-dark, performance-driven, futuristic, cyber-aqua

---

## 2. Color System

### Primitive Colors

#### Neutral Base (Dark-first)
```css
--gray-900: #0A0A0A;
--gray-800: #121212;
--gray-700: #1C1C1C;
--gray-600: #2A2A2A;
--gray-500: #3A3A3A;
--gray-400: #6B6B6B;
--gray-300: #9A9A9A;
--gray-200: #CFCFCF;
--gray-100: #F5F5F5;
```

#### Core Colors (Cian Scale)
```css
--cian-500: #00F9E4;  /* Primary Core */
--cian-600: #00C4B3;  /* Deep Accent */
--cian-400: #33FFEE;  /* Glow Accent */
--cian-300: #66FFF2;  /* Soft Glow */
--cian-700: #00998A;  /* Dark Accent */
```

#### Support Colors
```css
--white: #FFFFFF;
--black: #090909;
```

---

### Semantic Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#00F9E4` | Ações primárias, highlights e elementos interativos principais |
| **Secondary** | `#1C1C1C` / `#2A2A2A` | Superfícies, containers e estrutura de layout |
| **Accent** | `#33FFEE` | Hover states, efeitos de glow e ênfase |
| **Success** | `#00F9E4` | Feedback positivo (mantém coerência com primary) |
| **Warning** | `#F59E0B` | Alertas e estados de atenção |
| **Error** | `#EF4444` | Feedback crítico (única exceção ao cian) |

**Usage Principle:**  
Color is used strategically, not decoratively. Cian acts as a signal, not a background default. Most of the interface remains neutral to amplify emphasis.

---

## 3. Typography

### Style
- Modern neo-grotesk sans-serif
- Strong geometric influence
- Designed for clarity under high contrast

### Hierarchy

| Level | Properties | Usage |
|-------|-----------|-------|
| **H1** | Large, bold, uppercase, tight line-height | Impact statements |
| **H2** | Bold, slightly reduced scale | Section headers |
| **H3** | Medium weight | Subsections |
| **Body** | Regular weight | Main content, high readability on dark backgrounds |
| **Caption** | Small size, Gray 300–400 | Secondary information |

### Weight Distribution
- **Bold (700–800)** — Hierarchy and emphasis
- **Regular (400–500)** — Readability and body text
- **Light weights** — Minimal use

### Spacing
- **Headlines:** Slightly tight tracking for visual impact
- **Body text:** Balanced spacing for optimal readability

---

## 4. Spacing and Layout

### Spacing Scale
**Base unit:** 8pt  
**Scale:** `4 / 8 / 16 / 24 / 32 / 48 / 64 / 96`

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 16px;
--space-4: 24px;
--space-5: 32px;
--space-6: 48px;
--space-7: 64px;
--space-8: 96px;
```

### Layout Density
- Balanced to compact
- High information clarity without clutter

### Grid System
- **12-column grid**
- Generous horizontal margins
- Consistent vertical rhythm

### Principles
✓ Strong alignment  
✓ Predictable spacing rhythm  
✓ Separation via spacing, not borders

---

## 5. Shapes and UI Language

### Border Radius Reference

| Elemento | Border Radius | Aplicação |
|----------|---------------|-----------|
| **Botões (todos)** | `9999px` (pílula) | Todos os botões: primário, secundário, ghost, icon |
| **Inputs (todos)** | `9999px` (pílula) | Campos de texto, selects, inputs de busca |
| **Tags / Badges** | `9999px` (pílula) | Labels, status indicators |
| **Cards (todos)** | `16px` | Cards de coach, planos, depoimentos, equipamento |
| **Modais / Sheets** | `16px` | Dialog boxes, bottom sheets |
| **Imagens em cards** | `16px` | Herda via `overflow: hidden` do container |
| **Dividers / Separadores** | `0px` | Linhas de separação |

#### Regras Específicas

**Botões**
- Formato pílula obrigatório
- `border-radius: 9999px`
- Padding horizontal: mínimo `16–24px`
- Aplica-se a **todas** as variantes

**Inputs**
- Formato pílula obrigatório
- `border-radius: 9999px`
- Padding horizontal: mínimo `16–20px` para compensar curvatura
- Ícones internos devem ter `12–16px` de margem do edge

**Cards**
- `border-radius: 16px` — consistência obrigatória
- Nenhum card deve usar valor diferente
- Imagens dentro herdam arredondamento via `overflow: hidden`

---

### Stroke Usage
- Minimal
- `1px` de contraste sutil (Gray 600–700)
- Usado apenas quando necessário para separação

### Component Style
- Flat base com elevação seletiva
- Ênfase através de contraste, não de camadas

### Interaction Feel
- Preciso, responsivo, controlado
- Micro-interações reforçam percepção de performance

---

## 6. Visual Details

### Shadows
- Soft, low-opacity
- Usadas pontualmente para elevação
- Exemplo: `box-shadow: 0 0 30px rgba(0, 249, 228, 0.3)`

### Borders
- Sutis ou invisíveis
- Usadas apenas quando necessário
- Cor padrão: `#2A2A2A` (Gray 600)

### Effects

#### Cian Glow
```css
box-shadow: 0 0 30px rgba(0, 249, 228, 0.3);
```

#### Gradients
```css
/* Dark to Cian */
background: linear-gradient(to bottom, #0A0A0A, #00F9E4);

/* Gray to Deep Cian */
background: linear-gradient(to bottom, #1C1C1C, #00C4B3);
```

#### Light Bloom
- Aplicado em elementos focais
- Uso estratégico para criar pontos de atenção

### Imagery Integration
✓ Alto contraste  
✓ Subjects isolados com iluminação forte  
✓ Fundos mínimos  
✓ Cian color grading aplicado nos highlights  
✓ Grayscale por padrão, colorido on hover

---

## 7. Contrast and Accessibility

### Contrast Level
- **Alto contraste por padrão**
- Minimum ratio: WCAG AA (4.5:1 for body text)

### Readability
- Texto claro sobre superfícies escuras
- Ratios conformes com WCAG

### Hierarchy Strategy
| Element | Color | Purpose |
|---------|-------|---------|
| **Ação / Destaque** | Cian (`#00F9E4`) | Primary actions, interactive elements |
| **Conteúdo Principal** | White (`#FFFFFF`) | Main text, headings |
| **Informação Secundária** | Gray (`#9A9A9A` / `#CFCFCF`) | Supporting text, captions |

### Accessibility Principles
✓ Não depender apenas de cor  
✓ Manter hierarquia via tamanho e peso tipográfico  
✓ Garantir estados de hover e foco visíveis  
✓ Fornecer alternativas textuais para ícones

### Cian Contrast Reference
| Combination | Ratio | Quality |
|-------------|-------|---------|
| `#00F9E4` on `#0A0A0A` | ~12:1 | Excelente |
| `#00C4B3` on `#1C1C1C` | ~8:1 | Muito bom |
| `#00F9E4` on `#3A3A3A` | ~6:1 | Aceitável (evitar para texto pequeno) |

⚠️ **Evitar:** Cian claro sobre cinza médio

---

## 8. Responsive Breakpoints

```css
/* Mobile First Approach */
--mobile: 402px;      /* Design target */
--sm: 640px;
--md: 768px;
--lg: 1024px;
--xl: 1280px;
--2xl: 1536px;
```

### Mobile Rules (402px)
- Padding horizontal: `12px` (left + right = 24px)
- Largura útil: `378px` (402px - 24px)
- Grids colapsam para coluna única
- Fontes escalam proporcionalmente
- Nenhum scroll horizontal permitido

---

## 9. Component Patterns

### Buttons

#### Primary
```tsx
className="px-8 py-4 bg-[#00F9E4] text-[#0A0A0A] 
           hover:bg-[#33FFEE] transition-all 
           hover:shadow-[0_0_30px_rgba(0,249,228,0.3)] 
           rounded-full font-bold uppercase tracking-wider"
```

#### Secondary
```tsx
className="px-8 py-4 border border-[#2A2A2A] 
           hover:border-[#00F9E4] transition-colors 
           rounded-full"
```

### Inputs
```tsx
className="w-full bg-[#0d0d0d] border border-[#303030] 
           rounded-full px-14 py-4 text-white 
           placeholder:text-[#606060] 
           focus:outline-none focus:border-[#00F9E4] 
           transition-colors"
```

### Cards
```tsx
className="p-8 bg-[#1C1C1C] border border-[#2A2A2A] 
           hover:border-[#00F9E4] transition-colors 
           rounded-[16px]"
```

### Badges/Tags
```tsx
className="inline-flex items-center gap-2 px-4 py-2 
           border border-[#333] bg-[#111] 
           rounded-full text-xs uppercase tracking-widest"
```

---

## 10. Animation Guidelines

### Timing
- **Fast:** 150–200ms — Feedback imediato
- **Normal:** 200–300ms — Transitions padrão
- **Slow:** 300–500ms — Transformações complexas

### Easing
```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover Effects
- Scale: `1.02–1.05` (sutil)
- Glow: adicionar shadow cian
- Color shift: `grayscale → color`
- Timing: `300–500ms`

---

## Final Notes

✓ O sistema é **intenso mas controlado**  
✓ Energia visual vem de **contraste e contenção**  
✓ O cian é **estratégico, não dominante**  
✓ Todo elemento deve parecer **intencional, rápido e preciso**  
✓ Priorizar **clareza, hierarquia e percepção de performance** acima de decoração

---

## Quick Reference Card

```
COLORS
Primary: #00F9E4
Accent: #33FFEE
Background: #0A0A0A
Surface: #1C1C1C
Border: #2A2A2A
Text: #FFFFFF
Muted: #9A9A9A

RADIUS
Buttons: 9999px (pill)
Inputs: 9999px (pill)
Cards: 16px
Badges: 9999px (pill)

SPACING
Base: 8px
Scale: 4/8/16/24/32/48/64/96

TYPOGRAPHY
Weights: 400, 500, 700, 800
Hierarchy: Size + Weight + Color
Tracking: Tight for headlines
```

---

**Version:** 1.0  
**Last Updated:** 2026-04-11  
**Maintainer:** LuTe Academy Design Team
