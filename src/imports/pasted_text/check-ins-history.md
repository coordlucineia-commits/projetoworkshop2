# Tela: Check-ins
**Sistema interno LuTe Academy · Módulo de Histórico e Controle de Frequência**
 
---
 
## Visão Geral
 
A tela de Check-ins centraliza o **controle de frequência dos alunos**, exibindo métricas de acesso em tempo real e um histórico completo e filtrável de todas as entradas registradas na academia.
 
---
 
## Estrutura Fixa
 
### Sidebar esquerda
- Logo LuTe Academy + subtítulo "ADMIN PANEL"
- Menu de navegação:
  - Dashboard
  - Alunos
  - **Check-ins** (item ativo — destacado com fundo ciano)
  - Modo Recepção
  - Configurações
- Rodapé: avatar circular + nome "Admin LuTe Academy" + cargo "GESTOR" + link "Sair"
 
### Header principal
- Título: `CHECK-INS`
- Subtítulo: `HISTÓRICO E CONTROLE DE FREQUÊNCIA`
- Botões de ação (canto superior direito):
  - Ícone de alternância de tema (☀️ claro / escuro)
  - `+ NOVO ALUNO` (botão secundário)
  - `ATIVAR RECEPÇÃO` (botão primário ciano com ícone QR code)
 
---
 
## SEÇÃO 1 — Cards de Métricas (KPIs)
 
Quatro cards dispostos em **linha horizontal** no topo da área de conteúdo. Cada card exibe um ícone temático, um label descritivo e o valor principal em destaque.
 
| Card | Ícone | Label superior | Valor | Label inferior |
|---|---|---|---|---|
| **Hoje** | Pessoa com sinal | HOJE | `15` | Check-ins hoje |
| **Semana** | Calendário | SEMANA | `20` | Esta semana |
| **Mês** | Grupo de pessoas | MÊS | `20` | Este mês |
| **Pico** | Relógio | PICO | `18:00–19:00` | Horário de pico |
 
### Comportamento dos cards
- Os valores são atualizados em tempo real conforme novos check-ins são registrados
- O card de **Pico** exibe o intervalo de 1 hora com maior concentração de entradas no período selecionado
- Cada card possui um ícone com fundo colorido distinto para diferenciação visual
 
---
 
## SEÇÃO 2 — Histórico de Check-ins
 
Painel principal com listagem completa de check-ins registrados.
 
### Cabeçalho da seção
 
| Elemento | Descrição |
|---|---|
| Título | `HISTÓRICO DE CHECK-INS` |
| Botão `⬇ Baixar Relatório` | Exporta o histórico filtrado em formato de relatório (PDF ou CSV) — botão de ação em ciano |
| Filtro `Hoje` | Exibe apenas os check-ins do dia atual — **ativo por padrão** |
| Filtro `Semana` | Exibe check-ins dos últimos 7 dias |
| Filtro `Mês` | Exibe check-ins do mês corrente |
 
> Os três filtros de período funcionam como **seleção exclusiva** (apenas um ativo por vez). O filtro ativo fica destacado visualmente.
 
---
 
### Barra de Busca
 
- Input de texto largo (largura total da seção)
- Ícone de lupa à esquerda
- Placeholder: `Buscar por nome do aluno...`
- Filtra a lista em tempo real pelo nome do aluno
 
---
 
### Lista de Check-ins
 
Cada entrada da lista representa **um check-in individual** de um aluno. Um mesmo aluno pode aparecer múltiplas vezes (um item por visita registrada).
 
#### Estrutura de cada item
 
| Elemento | Posição | Descrição |
|---|---|---|
| **Avatar** | Esquerda | Foto circular do aluno |
| **Nome** | Centro-esquerda | Nome completo do aluno |
| **Status financeiro** | Abaixo do nome | Label colorida: `Em dia` (verde) / `Em atraso` (vermelho) / `Vencendo` (laranja/amarelo) |
| **Separador** | Após o status | Ponto `•` de separação visual |
| **Tipo de plano** | Após o separador | `BASIC` / `PREMIUM` / `ELITE` em caixa alta, cor muted |
| **Ícone de data** | Direita | Ícone de calendário + data no formato `DD/MM/AAAA` |
| **Ícone de horário** | Abaixo da data | Ícone de relógio + horário no formato `HH:MM` |
 
#### Status financeiro — definições
 
| Status | Cor | Significado |
|---|---|---|
| `Em dia` | Verde | Mensalidade paga e dentro do prazo |
| `Vencendo` | Laranja / Amarelo | Mensalidade próxima do vencimento |
| `Em atraso` | Vermelho | Mensalidade vencida e não paga |
 
---
 
### Exemplo de dados (check-ins do dia 22/02/2026)
 
| Nome | Status | Plano | Data | Horário |
|---|---|---|---|---|
| Maria Santos | Em dia | PREMIUM | 22/02/2026 | 18:45 |
| João Silva | Em atraso | BASIC | 22/02/2026 | 18:30 |
| Carlos Oliveira | Vencendo | PREMIUM | 22/02/2026 | 18:15 |
| Maria Santos | Em dia | PREMIUM | 22/02/2026 | 17:50 |
| Ana Costa | Em dia | ELITE | 22/02/2026 | 17:30 |
| Maria Santos | Em dia | PREMIUM | 22/02/2026 | 16:45 |
| João Silva | Em atraso | BASIC | 22/02/2026 | 15:20 |
| Carlos Oliveira | Vencendo | PREMIUM | 22/02/2026 | 14:30 |
| Maria Santos | Em dia | PREMIUM | 22/02/2026 | 12:15 |
| Ana Costa | Em dia | ELITE | 22/02/2026 | 11:00 |
| João Silva | Em atraso | BASIC | 22/02/2026 | 10:30 |
| Carlos Oliveira | Vencendo | PREMIUM | 22/02/2026 | 09:45 |
| Maria Santos | Em dia | PREMIUM | 22/02/2026 | 08:30 |
| Maria Santos | Em dia | PREMIUM | 22/02/2026 | 07:15 |
| João Silva | Em atraso | BASIC | 22/02/2026 | 06:45 |
 
---
 
## Comportamentos e Regras de Negócio
 
### Filtros de período
- **Hoje** (padrão): exibe todos os check-ins registrados no dia atual, ordenados do mais recente ao mais antigo
- **Semana**: agrupa ou lista os check-ins dos últimos 7 dias
- **Mês**: lista todos os check-ins do mês corrente
 
### Ordenação
- A lista é ordenada por **horário decrescente** (check-in mais recente no topo)
 
### Busca
- A busca por nome filtra dinamicamente todos os registros dentro do período selecionado
- Ao combinar busca + filtro de período, ambos se aplicam simultaneamente
 
### Exportação de relatório
- O botão `Baixar Relatório` exporta os dados **do período e filtro ativos no momento**
- O relatório deve conter: nome do aluno, plano, status financeiro, data e horário de cada check-in
 
### Cards de métricas
- O valor `HOJE` incrementa a cada novo check-in registrado no dia
- O valor `SEMANA` e `MÊS` são acumulativos dentro do período
- O `PICO` é calculado identificando o intervalo de 1 hora com mais entradas no período selecionado
 
### Clique em um item da lista
- Ao clicar em um aluno na lista de check-ins, navega para o **Perfil do Aluno** (mesma tela de detalhe do módulo Alunos)
 
---
 
*Documento de requisitos · Módulo: Check-ins · Sistema LuTe Academy · v1.0*