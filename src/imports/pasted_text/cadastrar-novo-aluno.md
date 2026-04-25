# Tela: Cadastrar Novo Aluno
**Sistema interno LuTe Academy · Módulo de Gestão de Alunos**

---

## Visão Geral da Tela

Formulário interno de cadastro de novos alunos, acessado por administradores ou recepcionistas da academia. Divide-se em **7 seções sequenciais**, cada uma agrupando dados relacionados. O formulário é longo (scroll vertical), com campos obrigatórios e opcionais sinalizados.

---

## Estrutura de Navegação (Layout Geral)

### Sidebar esquerda (navegação global do sistema)
- Logo LuTe Academy no topo
- Itens de menu:
  - Dashboard
  - Alunos
  - Check-ins
  - Modo Recepção
  - Configurações
- Rodapé da sidebar: avatar + nome do usuário logado ("Admin LuTe Academy") + link "Sair"

### Header da tela
- Breadcrumb: `NOVO ALUNO > Cadastro de Novo Aluno`
- Botões de ação no canto superior direito:
  - `+ NOVO ALUNO` (botão secundário)
  - `ATIVAR RECEPÇÃO` (botão de destaque)

### Barra de ações do formulário
- Botão `← VOLTAR`
- Título da página: `CADASTRAR NOVO ALUNO`
- Botão `🖨 IMPRIMIR`
- Botão `💾 SALVAR CADASTRO` (ação primária)

---

## Seções do Formulário

---

### 🔴 1. DADOS PESSOAIS

> Seção de identificação básica do aluno. Todos os campos são obrigatórios salvo indicação.

| Campo | Tipo | Observações |
|---|---|---|
| Nome Completo | Text input | Obrigatório |
| Data de Nascimento | Date input | Obrigatório |
| CPF | Text input (máscara) | Formato: 000.000.000-00 · Obrigatório |
| RG | Text input | Obrigatório |
| Sexo | Dropdown | Opções: "Ativo/Feminino/Masculino/Outro" · Obrigatório |
| Estado Civil | Dropdown | Opção padrão: "Selecione" · Obrigatório |
| Profissão | Text input | Obrigatório |
| Telefone (WhatsApp) | Text input (máscara) | Formato: (00) 00000-0000 · Obrigatório |
| E-mail | Email input | Formato: exemplo@email.com · Obrigatório |
| Endereço Completo | Text input | Formato sugerido: Rua, Número, Bairro, Cidade, Estado, CEP · Obrigatório |
| Contato de Emergência | Text input | Nome completo · Obrigatório |
| Telefone do Contato de Emergência | Text input (máscara) | Formato: (00) 00000-0000 · Obrigatório |

---

### ❤️ 2. DADOS DE SAÚDE (ANAMNESE BÁSICA)

> Questionário de saúde pré-participação. Cada pergunta possui resposta via botões de seleção (toggle/radio visual). Obrigatório responder todas.

**Padrão de resposta:** Botões visuais tipo pill — `SIM` / `NÃO` (seleção exclusiva por pergunta).

| # | Pergunta | Opções de Resposta |
|---|---|---|
| 1 | Possui alguma doença diagnosticada? | SIM / NÃO |
| 2 | Problemas cardíacos? | SIM / NÃO |
| 3 | Pressão alta ou baixa? | NÃO / ALTA / BAIXA |
| 4 | Possui diabetes? | SIM / NÃO |
| 5 | Desmaios ou tonturas frequentes? | SIM / NÃO |
| 6 | Problemas respiratórios? | SIM / NÃO |
| 7 | Problemas articulares? | SIM / NÃO |
| 8 | Já realizou cirurgia? | SIM / NÃO |
| 9 | Faz uso de medicação contínua? | SIM / NÃO |
| 10 | Está gestante? | SIM / NÃO / N/A |
| 11 | Possui limitação física? | SIM / NÃO |
| 12 | Possui recomendação médica para prática de exercícios? | SIM / NÃO |

---

### ⚠️ 3. QUESTIONÁRIO PAR-Q (PRONTIDÃO PARA ATIVIDADE FÍSICA)

> Questionário PAR-Q padrão internacional de pré-participação em exercícios. Responda SIM ou NÃO para cada pergunta.

**Instrução exibida na tela:**
> "Responda SIM ou NÃO para cada pergunta."

**Padrão de resposta:** Botões `SIM` / `NÃO` por pergunta.

| # | Pergunta |
|---|---|
| 1 | Algum médico já disse que você possui problema cardíaco? |
| 2 | Sente dor no peito ao realizar atividade física? |
| 3 | Sentiu dor no peito no último mês? |
| 4 | Perde o equilíbrio por tontura ou já perdeu a consciência? |
| 5 | Possui problema ósseo ou articular que pode piorar com exercício? |
| 6 | Seu médico já recomendou restrição de atividade física? |

**Alerta condicional (exibido se qualquer resposta for SIM):**
> ⚠️ *"Se respondeu 1 ou mais respostas 'SIM', recomendamos avaliação médica antes de iniciar."*
>
> Exibido como banner de alerta em destaque (fundo vermelho/laranja), abaixo das perguntas.

---

### 🎯 4. OBJETIVOS DO ALUNO

> Seção para mapear histórico de treino e metas do aluno.

**Campo: Qual seu principal objetivo?**
Seleção única via botões visuais (grid de opções):

- Emagrecimento
- Hipertrofia
- Condicionamento físico
- Reabilitação
- Saúde geral
- Outro

---

**Campo: Já treinou antes?**
- Tipo: Dropdown
- Opção padrão: "Selecione"
- Obrigatório

**Campo: Há quanto tempo pratica exercícios?**
- Tipo: Text input
- Placeholder: "Ex: 6 meses, 2 anos"

**Campo: Quantas vezes por semana pretende treinar?**
- Tipo: Dropdown
- Opção padrão: "Selecione"
- Obrigatório

**Campo: Preferência de horário?**
- Tipo: Text input
- Placeholder: "Ex: manhã, tarde, noite"

---

### 📏 5. INFORMAÇÕES CORPORAIS (AVALIAÇÃO INICIAL — OPCIONAL)

> Dados físicos do aluno para acompanhamento de evolução. Seção marcada como opcional.

**Campos em linha (grid):**

| Campo | Tipo | Unidade / Placeholder |
|---|---|---|
| Peso | Number input | KG |
| Altura | Number input | CM |
| IMC | Number input (calculado ou manual) | Calculado automaticamente se Peso e Altura forem preenchidos |
| % Gordura | Number input | % |

**Campo: Medidas Corporais**
- Tipo: Textarea
- Placeholder: "Ex: Braço 35cm, Cintura 80cm, Quadril 96cm"
- Campo livre para inserção de medidas diversas

---

### 💳 6. PLANO CONTRATADO

> Dados do plano que o aluno está contratando no momento do cadastro.

| Campo | Tipo | Observações |
|---|---|---|
| Tipo de Plano | Text input ou Dropdown | Obrigatório |
| Valor (R$) | Number input (moeda) | Formato: 150,00 · Obrigatório |
| Data de Início | Date input | Obrigatório |
| Data de Vencimento | Date input | Obrigatório |
| Forma de Pagamento | Dropdown | Opção padrão: "Selecione" · Obrigatório |

---

### ✅ 7. TERMO DE RESPONSABILIDADE

> Declaração de ciência e autorização de uso de dados. Exibida como texto fixo com campo de assinatura.

**Texto do Termo (exibido na tela):**

> *"Declaro que as informações acima são verdadeiras e estou ciente de que a prática de atividades físicas envolve riscos. Comprometo-me a informar qualquer alteração em meu estado de saúde à administração da academia."*

> *"Autorizo o uso dos meus dados conforme a Lei Geral de Proteção de Dados (LGPD) para fins administrativos da academia, incluindo comunicações sobre serviços, agendamentos e informações relevantes."*

**Campos de assinatura:**

| Campo | Tipo |
|---|---|
| Assinatura do Aluno | Campo de assinatura (canvas/upload ou campo texto) |
| Data | Date input (preenchido automaticamente com a data atual) |

**Botão final:**
- `REGISTRAR` (ação de submissão do formulário — botão primário de alta hierarquia)

---

## Regras de Validação

- Campos marcados com `*` (asterisco) são **obrigatórios**
- CPF deve seguir máscara e pode ter validação de dígito verificador
- E-mail deve seguir formato padrão válido
- Campos de telefone devem seguir máscara brasileira
- O alerta do PAR-Q deve ser exibido dinamicamente se qualquer resposta for "SIM"
- IMC pode ser calculado automaticamente com base em Peso e Altura
- O formulário só pode ser submetido com todas as seções obrigatórias preenchidas
- A seção 5 (Informações Corporais) pode ser ignorada — marcada como opcional

---

## Comportamento Geral da Tela

- Formulário de **scroll vertical longo** — todas as seções em sequência, sem abas ou etapas
- Cada seção possui um **cabeçalho numerado** com ícone/cor de destaque (vermelho/laranja)
- Os botões de resposta SIM/NÃO da anamnese e PAR-Q são **interativos**: ao clicar, o selecionado fica em destaque (preenchido/ativo)
- O botão `SALVAR CADASTRO` no topo deve permanecer **fixo ou acessível** — salva o formulário a qualquer momento
- O botão `REGISTRAR` no rodapé realiza a **submissão final** do cadastro

---

*Documento de requisitos · Tela: Cadastrar Novo Aluno · Sistema LuTe Academy · v1.0*