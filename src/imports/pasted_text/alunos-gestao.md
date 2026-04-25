# Tela: Alunos
**Sistema interno LuTe Academy · Módulo de Gestão de Alunos**
 
---
 
## Visão Geral
 
O módulo de Alunos é composto por **duas sub-telas**:
 
1. **Lista de Alunos** — listagem com busca, filtros e ações rápidas por aluno
2. **Perfil do Aluno** — detalhe completo de um aluno específico com dados, check-ins e histórico de pagamentos
 
A navegação entre as duas telas ocorre ao **clicar em qualquer aluno da lista**, que abre o perfil. Para voltar, existe um link `← Voltar para lista`.
 
---
 
## Estrutura Fixa (compartilhada entre as duas sub-telas)
 
### Sidebar esquerda
- Logo LuTe Academy + subtítulo "ADMIN PANEL"
- Menu de navegação:
  - Dashboard
  - **Alunos** (item ativo — destacado com fundo ciano)
  - Check-ins
  - Modo Recepção
  - Configurações
- Rodapé: avatar circular + nome "Admin LuTe Academy" + cargo "GESTOR" + link "Sair"
 
### Header principal
- Título: `ALUNOS`
- Subtítulo: `GESTÃO COMPLETA DA BASE DE MEMBROS`
- Botões de ação (canto superior direito):
  - Ícone de alternância de tema (☀️ claro / escuro)
  - `+ NOVO ALUNO` (botão secundário com ícone de pessoa)
  - `ATIVAR RECEPÇÃO` (botão primário ciano com ícone QR code)
 
---
 
## SUB-TELA 1 — Lista de Alunos
 
### Barra de Busca
 
- Input de texto largo (largura total da área de conteúdo)
- Ícone de lupa à esquerda
- Placeholder: `Buscar aluno por nome, email ou telefone...`
- Busca em tempo real (filtra a lista conforme o usuário digita)
 
---
 
### Filtros
 
Três dropdowns em linha, abaixo da barra de busca:
 
| Filtro | Label padrão | Função |
|---|---|---|
| Planos | `Planos ▾` | Filtra por tipo de plano contratado (Basic, Premium, Elite, etc.) |
| Mês | `Mês ▾` | Filtra por mês de cadastro ou vencimento |
| Ordenação | `Recentes ▾` | Ordena a lista (mais recentes, mais antigos, alfabético, etc.) |
 
---
 
### Lista de Alunos
 
Cada aluno é exibido como um **card horizontal** com as seguintes informações:
 
#### Estrutura do Card
 
| Elemento | Descrição |
|---|---|
| **Avatar** | Foto circular do aluno (fallback: iniciais ou ícone genérico) |
| **Nome** | Nome completo do aluno em destaque |
| **ID** | Badge com o número de matrícula — formato `#0000` — cor ciano |
| **Status financeiro** | Label colorida abaixo do nome: `Em dia` (verde) / `Em atraso` (vermelho) / `Vencendo` (amarelo/laranja) |
| **Data de cadastro** | Texto secundário: `Cadastro: DD/MM/AAAA` |
| **Tipo de plano** | Texto à direita do card: `BASIC` / `PREMIUM` / `ELITE` (em caixa alta, cor muted) |
| **Menu de ações** | Ícone de três pontos verticais `⋮` à direita do plano |
 
#### Menu de Ações (três pontos `⋮`)
 
Ao clicar no ícone, abre um dropdown/popover com as opções:
 
- **Enviar mensagem** — abre WhatsApp ou modal de mensagem para o aluno
- **Bloquear aluno** — bloqueia o acesso do aluno (ação destrutiva, requer confirmação)
 
> O clique no **card inteiro** (fora do ícone `⋮`) navega para o **Perfil do Aluno**.
 
---
 
#### Status Financeiro — Definições
 
| Status | Cor | Significado |
|---|---|---|
| `Em dia` | Verde | Mensalidade paga e dentro do prazo |
| `Vencendo` | Amarelo / Laranja | Mensalidade próxima do vencimento |
| `Em atraso` | Vermelho | Mensalidade vencida e não paga |
 
---
 
#### Exemplo de Dados (alunos da lista)
 
| Nome | ID | Status | Data de Cadastro | Plano |
|---|---|---|---|---|
| João Silva | #5678 | Em atraso | 09/03/2024 | BASIC |
| Carlos Oliveira | #3456 | Vencendo | 31/01/2024 | PREMIUM |
| Maria Santos | #1234 | Em dia | 14/01/2024 | PREMIUM |
| Ana Costa | #9012 | Em dia | 19/11/2023 | ELITE |
| Beatriz Lima | #7890 | Em atraso | 04/08/2023 | BASIC |
 
---
 
## SUB-TELA 2 — Perfil do Aluno
 
Acessada ao clicar em um aluno na lista. Exibe todos os dados do aluno selecionado.
 
### Navegação de retorno
- Link `← Voltar para lista` no topo da área de conteúdo
 
---
 
### Card de Cabeçalho do Aluno
 
Card principal com identidade e dados de contato rápido:
 
| Elemento | Descrição |
|---|---|
| **Avatar** | Foto circular grande do aluno |
| **Nome** | Nome completo em destaque (ex: João Silva) |
| **Badge ATIVO** | Status de matrícula — `ATIVO` (fundo verde) |
| **Badge financeiro** | Status de pagamento — `Em atraso` (fundo vermelho) / `Em dia` (verde) / `Vencendo` (laranja) |
| **Botão WhatsApp** | Botão verde com ícone do WhatsApp e label `WhatsApp` — abre conversa direta com o aluno |
| **Botão Editar** | Ícone de edição (lápis/caneta) ao lado do WhatsApp — abre modo de edição dos dados do aluno |
 
---
 
### Grid de Informações (6 cards informativos)
 
Exibidos em **grid de 3 colunas × 2 linhas**. Cada card possui um label em caixa alta e um valor abaixo:
 
**Linha 1:**
 
| Card | Label | Exemplo de valor |
|---|---|---|
| 1 | EMAIL | joao@email.com |
| 2 | TELEFONE | (11) 98765-1234 |
| 3 | PLANO | BASIC |
 
**Linha 2:**
 
| Card | Label | Exemplo de valor |
|---|---|---|
| 4 | DATA DE INÍCIO | 09/03/2024 |
| 5 | ÚLTIMO CHECK-IN | 2026-02-20 |
| 6 | TOTAL DE CHECK-INS | 54 |
 
---
 
### Seção: Histórico de Pagamentos
 
Lista de pagamentos ordenada do mais recente ao mais antigo.
 
#### Estrutura de cada item de pagamento
 
| Elemento | Descrição |
|---|---|
| **Data** | Data de vencimento/pagamento — formato `DD/MM/AAAA` |
| **Badge de status** | `Atrasado` (fundo vermelho) / `Pago` (fundo verde) |
| **Forma de pagamento** | Texto secundário abaixo da data (ex: Boleto, PIX, Cartão) |
| **Valor** | Valor em reais à direita — formato `R$ 00,00` |
 
#### Status possíveis de pagamento
 
| Status | Cor | Significado |
|---|---|---|
| `Pago` | Verde | Pagamento confirmado |
| `Atrasado` | Vermelho | Vencido sem pagamento registrado |
| `Pendente` | Amarelo | Aguardando confirmação |
 
#### Exemplo de histórico (João Silva)
 
| Data | Status | Forma | Valor |
|---|---|---|---|
| 09/02/2026 | Atrasado | Boleto | R$ 89,90 |
| 09/01/2026 | Pago | PIX | R$ 89,90 |
 
---
 
## Estados e Comportamentos
 
### Estado de matrícula do aluno
 
| Status | Badge | Cor |
|---|---|---|
| Ativo | `ATIVO` | Verde |
| Bloqueado | `BLOQUEADO` | Vermelho |
| Inativo | `INATIVO` | Cinza |
 
### Ação: Bloquear Aluno
- Acessada pelo menu `⋮` na lista
- Deve exibir um **modal de confirmação** antes de executar:
  > *"Tem certeza que deseja bloquear João Silva? O aluno perderá acesso à academia."*
  - Botão `Confirmar` (vermelho)
  - Botão `Cancelar` (neutro)
 
### Ação: Enviar Mensagem
- Acessada pelo menu `⋮` na lista ou pelo botão WhatsApp no perfil
- Abre o WhatsApp Web/app com o número do aluno pré-carregado
 
### Ação: Editar Aluno
- Acessada pelo ícone de edição no perfil
- Navega para o formulário de cadastro pré-preenchido com os dados do aluno
 
---
 
## Regras de Negócio
 
- A lista exibe todos os alunos cadastrados, paginada ou com scroll infinito
- Busca filtra simultaneamente por nome, e-mail e telefone
- Os filtros de Planos e Mês são combináveis entre si
- O status financeiro é calculado automaticamente com base na data de vencimento do plano
- Um aluno `Em atraso` deve ter seu card visualmente diferenciado (badge vermelho em destaque)
- O campo `ÚLTIMO CHECK-IN` exibe a data do check-in mais recente registrado para aquele aluno
- O campo `TOTAL DE CHECK-INS` é um contador acumulado de todas as entradas registradas
 
---
 
*Documento de requisitos · Módulo: Alunos (Lista + Perfil) · Sistema LuTe Academy · v1.0*
 