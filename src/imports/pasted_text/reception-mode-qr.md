# Tela: Modo Recepção (QR Code Check-in)
**Sistema interno LuTe Academy · Módulo de Entrada Autônoma de Alunos**
 
---
 
## Visão Geral
 
O Modo Recepção é uma **tela dedicada em tela cheia** (fullscreen), separada do painel administrativo, projetada para ficar aberta permanentemente na recepção da academia. Os alunos se aproximam do dispositivo e realizam o próprio check-in via QR Code, código de membro ou e-mail — sem intervenção de um funcionário.
 
---
 
## Como Acessar
 
- Botão `ATIVAR RECEPÇÃO` localizado no canto superior direito do header do painel (presente em todas as telas do sistema)
- Ao clicar, a tela de Modo Recepção é aberta em **fullscreen**, ocultando completamente o painel administrativo
 
---
 
## Como Fechar (Proteção por Senha)
 
A tela de Modo Recepção **não pode ser fechada livremente**, pois está exposta ao público. Para sair, é necessário autenticação:
 
1. Clicar no botão `✕` no canto superior direito da tela
2. Um **modal de senha** é exibido com 4 campos numéricos (PIN de 4 dígitos)
3. O PIN correto é: **`1234`**
4. Se o PIN estiver correto → fecha o Modo Recepção e retorna ao Dashboard do painel administrativo
5. Se o PIN estiver incorreto → exibe mensagem de erro e mantém a tela aberta
 
### Modal de Senha
 
| Elemento | Descrição |
|---|---|
| Título | "Inserir senha para sair" ou "Acesso restrito" |
| Campos | 4 inputs numéricos individuais (estilo PIN — um dígito por campo) |
| Navegação | Foco avança automaticamente para o próximo campo ao digitar |
| Botão confirmar | `CONFIRMAR` — valida o PIN |
| Botão cancelar | `CANCELAR` — fecha o modal e mantém o Modo Recepção ativo |
| Erro | Se PIN incorreto: exibe mensagem "Senha incorreta. Tente novamente." abaixo dos campos |
| PIN correto | `1234` — redireciona para o Dashboard |
 
---
 
## Layout da Tela
 
### Header (barra superior fixa)
 
| Elemento | Posição | Descrição |
|---|---|---|
| Logo LuTe Academy | Esquerda | Ícone + texto "MODO RECEPÇÃO ATIVO" |
| Botão fechar `✕` | Direita | Aciona o modal de senha para sair |
 
---
 
### Área Central (conteúdo principal — centralizado vertical e horizontalmente)
 
#### Headline
- Texto principal: **`APROXIME O QR CODE`** — grande, bold, caixa alta
- Subtítulo: `ou digite seu código de membro / email` — texto secundário, menor
 
#### Área do Scanner QR Code
- Quadrado com borda arredondada representando a **janela de leitura da câmera**
- Ícone de QR Code centralizado dentro da área (estado de espera/idle)
- A câmera do dispositivo fica ativa continuamente, lendo QR Codes em tempo real
- Quando um QR Code válido é detectado, o check-in é registrado automaticamente (sem necessidade de clicar em nenhum botão)
 
#### Tabs de método alternativo
 
Dois botões de alternância abaixo da área do scanner:
 
| Tab | Ícone | Label | Estado padrão |
|---|---|---|---|
| **Código** | `#` | CÓDIGO | Ativo (selecionado) |
| **Email** | ✉ | EMAIL | Inativo |
 
#### Campo de entrada manual
 
Conforme a tab selecionada, o campo abaixo muda:
 
**Tab CÓDIGO ativa:**
- Input de texto com ícone de lupa
- Placeholder: `Digite o código...`
- Hint abaixo do campo: `Ex: 12345`
- Ao digitar e confirmar (Enter ou botão), o sistema busca o aluno pelo código de membro e registra o check-in
 
**Tab EMAIL ativa:**
- Input de e-mail com ícone de envelope
- Placeholder: `Digite o email...`
- Hint abaixo do campo: `Ex: joao@email.com`
- Ao digitar e confirmar, o sistema busca o aluno pelo e-mail e registra o check-in
 
#### Botão de demonstração
- Botão: `SIMULAR QR CODE (DEMO)`
- Fundo cinza escuro, largura total da área central
- Funcionalidade: simula uma leitura de QR Code bem-sucedida para fins de teste e demonstração
- Não deve aparecer em produção (apenas em ambiente de demo/desenvolvimento) — ou pode ser mantido oculto por padrão e ativável por configuração
 
---
 
### Rodapé (barra inferior fixa)
 
Duas áreas de texto em fonte pequena, caixa alta, cor muted:
 
| Posição | Conteúdo |
|---|---|
| Esquerda | `SCANNER QR CODE ATIVO • VALIDAÇÃO AUTOMÁTICA • ENTRADA MANUAL DISPONÍVEL` |
| Direita | `PRESSIONE ESC PARA VOLTAR` |
 
> A mensagem "PRESSIONE ESC PARA VOLTAR" também deve acionar o modal de senha (ESC não fecha diretamente — passa pelo mesmo fluxo de PIN).
 
---
 
## Fluxo de Check-in
 
### Via QR Code (fluxo principal)
1. Aluno se aproxima e exibe o QR Code na câmera
2. O scanner detecta e lê o QR Code automaticamente
3. O sistema valida o código contra a base de alunos
4. **Se válido e aluno em dia:** exibe tela de sucesso com nome do aluno e confirmação visual (verde)
5. **Se válido mas com pagamento em atraso:** exibe alerta de inadimplência — check-in pode ser bloqueado ou registrado com aviso (definir regra de negócio)
6. **Se inválido/não encontrado:** exibe mensagem de erro e retorna ao estado de espera
 
### Via Código de Membro
1. Aluno digita o número de matrícula no campo de código
2. Pressiona Enter ou aguarda auto-validação
3. Mesmo fluxo de validação do item 3 em diante
 
### Via E-mail
1. Aluno seleciona a tab EMAIL
2. Digita o e-mail cadastrado
3. Pressiona Enter
4. Mesmo fluxo de validação do item 3 em diante
 
---
 
## Estados da Tela
 
| Estado | Descrição | Visual |
|---|---|---|
| **Idle (espera)** | Câmera ativa, aguardando leitura | Scanner piscando suavemente / animação de varredura |
| **Lendo** | QR Code detectado, processando | Animação de carregamento sobre o scanner |
| **Sucesso** | Check-in registrado com sucesso | Tela/overlay verde com nome do aluno e ✓ |
| **Inadimplente** | Aluno com pagamento em atraso | Tela/overlay laranja ou vermelho com aviso |
| **Erro** | Código/e-mail não encontrado | Mensagem de erro, retorna ao idle após 3s |
| **PIN** | Modal de senha para sair | Overlay escuro com modal de PIN centralizado |
 
---
 
## Tela de Sucesso (após check-in válido)
 
Exibida por **3–5 segundos** após um check-in bem-sucedido, depois retorna automaticamente ao estado de espera:
 
| Elemento | Descrição |
|---|---|
| Ícone | ✓ grande (checkmark) em verde |
| Nome do aluno | "Bem-vindo, [Nome]!" |
| Plano | Tipo de plano do aluno (ex: PREMIUM) |
| Horário | Hora atual do check-in registrado |
| Retorno | Automático ao estado idle após 3–5 segundos |
 
---
 
## Geração de QR Code por Aluno
 
### Contexto
Cada aluno deve possuir um QR Code único vinculado ao seu ID/matrícula. Esse QR Code é gerado pelo sistema e disponibilizado ao aluno para uso na entrada.
 
### Implementação sugerida para o Figma Make
 
O Figma Make pode gerar QR Codes utilizando APIs públicas de geração de imagem:
 
**Opção 1 — API pública (sem dependência):**
```
https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LUTE-{ID_DO_ALUNO}
```
Exemplo para o aluno #5678:
```
https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LUTE-5678
```
 
**Opção 2 — Biblioteca JavaScript (qrcode.js / qrcode-generator):**
- Gerar o QR Code diretamente no frontend com base no ID do aluno
- Renderizar como canvas ou SVG
 
### Dado codificado no QR Code
- Formato: `LUTE-{ID}` — exemplo: `LUTE-5678`
- O scanner do Modo Recepção lê esse valor, extrai o ID e valida contra o banco de alunos
 
### Onde o QR Code do aluno é exibido
- Na tela de **Perfil do Aluno** (módulo Alunos) — o aluno pode salvar ou imprimir
- Pode ser enviado por WhatsApp no momento do cadastro
- Pode ser exibido no app do aluno (se houver)
 
---
 
## Regras de Negócio
 
- A tela é fullscreen e **não exibe o menu lateral** do painel administrativo
- A câmera permanece **sempre ativa** enquanto o Modo Recepção estiver ligado
- O sistema **não permite fechar sem PIN correto** — protege contra saída acidental por alunos
- Um check-in só pode ser registrado **uma vez por aluno a cada X minutos** (evitar duplicatas — sugestão: 30 minutos de bloqueio)
- O histórico de cada check-in registrado via Modo Recepção aparece automaticamente na tela de Check-ins do painel
- A tab de modo de entrada (Código ou Email) retorna ao padrão (Código) após cada check-in ou erro
 
---
 
*Documento de requisitos · Módulo: Modo Recepção / QR Code · Sistema LuTe Academy · v1.0*