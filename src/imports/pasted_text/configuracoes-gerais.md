# Tela: Configurações
**Sistema interno LuTe Academy · Módulo de Configurações do Sistema**
 
---
 
## Visão Geral
 
A tela de Configurações centraliza todos os parâmetros do sistema em **4 abas (tabs)**, cada uma agrupando um conjunto de configurações relacionadas. A navegação entre abas não recarrega a página — apenas troca o conteúdo do painel abaixo das tabs.
 
---
 
## Estrutura Fixa
 
### Sidebar esquerda
- Logo LuTe Academy + subtítulo "ADMIN PANEL"
- Menu de navegação:
  - Dashboard
  - Alunos
  - Check-ins
  - Modo Recepção
  - **Configurações** (item ativo — destacado com fundo ciano)
- Rodapé: avatar circular + nome "Admin LuTe Academy" + cargo "GESTOR" + link "Sair"
 
### Header principal
- Título: `CONFIGURAÇÕES`
- Subtítulo: `CONFIGURAÇÕES DO SISTEMA`
- Botões de ação (canto superior direito):
  - Ícone de alternância de tema (☀️ claro / escuro)
  - `+ NOVO ALUNO` (botão secundário)
  - `ATIVAR RECEPÇÃO` (botão primário ciano)
 
### Cabeçalho da área de conteúdo
- Título: `CONFIGURAÇÕES` (grande, bold)
- Subtítulo: `Gerencie as configurações da academia`
 
---
 
## Navegação por Tabs
 
Quatro tabs horizontais logo abaixo do cabeçalho. Apenas uma ativa por vez — a ativa recebe fundo ciano:
 
| Ordem | Ícone | Label |
|---|---|---|
| 1 | 🏢 | **Geral** |
| 2 | 👤 | **Perfil Admin** |
| 3 | 💳 | **Planos** |
| 4 | ⚡ | **Sistema** |
 
---
 
## TAB 1 — Geral
 
**Título do painel:** `INFORMAÇÕES DA ACADEMIA`
**Subtítulo:** `Configure os dados básicos da sua academia`
 
### Campos do formulário
 
**Linha 1 — 2 colunas:**
 
| Campo | Tipo | Ícone | Placeholder / Exemplo |
|---|---|---|---|
| Nome da Academia | Text input | 🏢 | LuTe Academy |
| CNPJ | Text input (máscara) | 🛡 | 12.345.678/0001-90 |
 
**Linha 2 — 2 colunas:**
 
| Campo | Tipo | Ícone | Placeholder / Exemplo |
|---|---|---|---|
| Telefone | Text input (máscara) | 📞 | (11) 3456-7890 |
| Email | Email input | ✉ | contato@luteacademy.com.br |
 
**Linha 3 — 1 coluna (largura total):**
 
| Campo | Tipo | Ícone | Placeholder / Exemplo |
|---|---|---|---|
| Endereço | Text input | 📍 | Rua das Academias, 123 - Centro |
 
**Linha 4 — 3 colunas:**
 
| Campo | Tipo | Placeholder / Exemplo |
|---|---|---|
| Cidade | Text input | São Paulo |
| Estado | Text input | SP |
| CEP | Text input (máscara) | 01234-567 |
 
### Ações do painel
 
| Botão | Estilo | Ação |
|---|---|---|
| `Cancelar` | Secundário (neutro) | Descarta as alterações e restaura os valores salvos |
| `💾 Salvar Alterações` | Primário (ciano) | Salva todos os campos da tab Geral |
 
---
 
## TAB 2 — Perfil Admin
 
### Subseção 1: PERFIL DO ADMINISTRADOR
**Subtítulo:** `Gerencie suas informações pessoais e credenciais`
 
**Linha 1 — 2 colunas:**
 
| Campo | Tipo | Ícone | Placeholder / Exemplo |
|---|---|---|---|
| Nome Completo | Text input | 👤 | Admin LuTe Academy |
| Email | Email input | ✉ | admin@luteacademy.com.br |
 
**Linha 2 — 1 coluna:**
 
| Campo | Tipo | Ícone | Placeholder / Exemplo |
|---|---|---|---|
| Telefone | Text input (máscara) | 📞 | (11) 98765-4321 |
 
---
 
### Subseção 2: ALTERAR SENHA
 
**Linha 1 — 2 colunas:**
 
| Campo | Tipo | Ícone | Recursos |
|---|---|---|---|
| Senha Atual | Password input | 🔒 | Botão 👁 para revelar senha |
| Nova Senha | Password input | 🔒 | Botão 👁 para revelar senha |
 
> Ambos os campos de senha possuem ícone de olho (👁) à direita para alternar entre ocultar/exibir o conteúdo digitado.
 
### Ações do painel
 
| Botão | Estilo | Ação |
|---|---|---|
| `Cancelar` | Secundário (neutro) | Descarta as alterações |
| `💾 Salvar Alterações` | Primário (ciano) | Salva nome, email, telefone e/ou nova senha |
 
---
 
## TAB 3 — Planos
 
**Título do painel:** `PLANOS E PREÇOS`
**Subtítulo:** `Configure os planos disponíveis para os alunos. As alterações refletem em todo o sistema.`
 
### Estrutura de cada card de plano
 
Cada plano é exibido como um **card expansível** com:
 
| Elemento | Descrição |
|---|---|
| Nome do plano | Em destaque no topo esquerdo do card (ex: BASIC, PREMIUM, ELITE) |
| Subtítulo | Descrição curta do plano (ex: "Plano básico", "Plano mais popular", "Plano completo") |
| Campo de preço | Input numérico à direita com ícone `$` — edita o valor mensal do plano |
| Lista de benefícios | Itens em bullet `•` listando o que está incluído no plano |
| `+ Adicionar benefício` | Link/botão inline para adicionar um novo item à lista de benefícios do plano |
 
---
 
### Planos existentes (dados de exemplo)
 
**BASIC** — Plano básico — `R$ 89,90/mês`
- Acesso à área de musculação
- Horário livre
- Armário individual
- `+ Adicionar benefício`
 
**PREMIUM** *(label em destaque — "Plano mais popular")* — `R$ 199,90/mês`
- Tudo do plano BASIC
- Aulas coletivas ilimitadas
- Avaliação física mensal
- Treino personalizado
- `+ Adicionar benefício`
 
**ELITE** *(label em destaque — "Plano completo")* — `R$ 299,90/mês`
- Tudo do plano PREMIUM
- Personal trainer 2x por semana
- Acompanhamento nutricional
- Acesso a unidades parceiras
- Bebidas proteicas gratuitas
- `+ Adicionar benefício`
 
---
 
### Ação de criação de novo plano
 
- Botão `+ Criar Novo Plano` (abaixo dos cards existentes) — abre um novo card em branco para configuração de um plano adicional
 
### Ações do painel
 
| Botão | Estilo | Ação |
|---|---|---|
| `Cancelar` | Secundário (neutro) | Descarta as alterações |
| `💾 Salvar Alterações` | Primário (ciano) | Salva todos os planos e preços |
 
---
 
## TAB 4 — Sistema
 
**Título do painel:** `CONFIGURAÇÕES DO SISTEMA`
**Subtítulo:** `Configure parâmetros operacionais do sistema`
 
---
 
### Subseção 1: Horário de Funcionamento
 
**Linha 1 — 2 colunas:**
 
| Campo | Tipo | Ícone | Label |
|---|---|---|---|
| Abertura | Time input | 🕐 | Abertura |
| Fechamento | Time input | 🕐 | Fechamento |
 
> Esses horários são usados pelo sistema para calcular métricas de pico e validar check-ins fora do horário.
 
---
 
### Subseção 2: Alertas Automáticos
 
**Linha 1 — 2 colunas:**
 
| Campo | Tipo | Ícone | Label | Descrição auxiliar | Valor padrão |
|---|---|---|---|---|---|
| Dias sem check-in para risco | Number input | 📅 | Dias sem check-in para risco | "Dias sem frequência para considerar aluno em risco" | 10 |
| Dias antes do vencimento para alertar | Number input | 📅 | Dias antes do vencimento para alertar | "Antecedência para notificar vencimento" | 5 |
 
> O sistema usa esses valores para disparar alertas automáticos sobre alunos em risco de evasão ou com plano próximo ao vencimento.
 
---
 
### Subseção 3: Informações do Sistema
 
Painel somente leitura exibindo dados técnicos do sistema:
 
| Campo | Valor |
|---|---|
| Versão | `1.0.0` |
| Última atualização | `23 de fevereiro de 2026` |
| Banco de dados | `Conectado` *(exibido em verde)* |
 
---
 
### Subseção 4: Design System
 
- Texto descritivo: `Acesse a documentação completa do Design System com tokens, componentes e guias de estilo.`
- Botão: `🎨 Abrir Design System` — abre a documentação do design system (link externo ou modal)
 
---
 
### Ações do painel
 
| Botão | Estilo | Ação |
|---|---|---|
| `Cancelar` | Secundário (neutro) | Descarta as alterações |
| `💾 Salvar Alterações` | Primário (ciano) | Salva horários e configurações de alertas |
 
---
 
## Comportamentos Gerais
 
### Navegação entre tabs
- Ao trocar de tab, o formulário da tab anterior **não é salvo automaticamente** — apenas ao clicar em `Salvar Alterações`
- Se houver alterações não salvas e o usuário trocar de tab, exibir aviso: `"Você tem alterações não salvas. Deseja continuar?"` com opções `Continuar` e `Ficar nesta aba`
 
### Validações por tab
 
**Geral:**
- CNPJ deve seguir máscara e pode ter validação de dígito verificador
- CEP deve seguir máscara `00000-000`
- Email deve ser válido
 
**Perfil Admin:**
- Campo "Nova Senha" só é enviado se preenchido
- Se "Nova Senha" for preenchida, "Senha Atual" é obrigatória
- Senha deve ter mínimo de 6 caracteres (sugestão)
 
**Planos:**
- Nome do plano: obrigatório
- Valor: numérico, maior que zero
- Ao menos 1 benefício por plano
 
**Sistema:**
- Horário de Fechamento deve ser posterior ao de Abertura
- Campos de alerta devem ser números inteiros positivos
 
### Feedback de salvamento
- Após clicar em `Salvar Alterações`, exibir notificação de sucesso: `"Configurações salvas com sucesso."` (toast/snackbar)
- Em caso de erro, exibir: `"Erro ao salvar. Tente novamente."`
 
---
 
*Documento de requisitos · Módulo: Configurações (4 tabs) · Sistema LuTe Academy · v1.0*