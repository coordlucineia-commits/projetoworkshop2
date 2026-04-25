# 🏋️ LuTe Academy - Documentação do Banco de Dados

## 📊 Schema Prisma - Estrutura Completa

Este documento detalha toda a estrutura do banco de dados do sistema LuTe Academy, otimizado para uso com **Supabase** e **PostgreSQL**.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Modelos Principais](#modelos-principais)
3. [Configuração do Supabase](#configuração-do-supabase)
4. [Queries Úteis](#queries-úteis)
5. [Relacionamentos](#relacionamentos)

---

## 🎯 Visão Geral

### Estrutura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA LUTE ACADEMY                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📋 GESTÃO                  👤 ALUNOS                         │
│  ├─ Admins                  ├─ Dados Pessoais                │
│  ├─ Configurações           ├─ Anamnese/PAR-Q                │
│  └─ Logs Auditoria          ├─ Objetivos                     │
│                              ├─ Medidas Corporais            │
│  💰 FINANCEIRO              └─ Status                        │
│  ├─ Planos                                                    │
│  ├─ Pagamentos              📊 OPERACIONAL                   │
│  └─ Status Financeiro       ├─ Check-ins                     │
│                              ├─ Avaliações Físicas           │
│                              └─ Frequência                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Modelos Principais

### 1. **Aluno** (Modelo Central)

Armazena todos os dados do aluno, desde cadastro até histórico de atividades.

```prisma
model Aluno {
  id                 String              @id @default(uuid())
  matricula          String              @unique
  nome               String
  foto               String?
  // ... demais campos
}
```

#### Campos Principais:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `matricula` | String | Número da matrícula (ex: #1234) |
| `nome` | String | Nome completo do aluno |
| `foto` | String? | URL ou base64 da foto |
| `cpf` | String | CPF único |
| `email` | String | Email único para login |
| `pin` | String? | PIN de 4 dígitos para check-in rápido |
| `statusFinanceiro` | Enum | EM_DIA, VENCENDO, EM_ATRASO |
| `statusMatricula` | Enum | ATIVO, BLOQUEADO, INATIVO |

#### Campos JSON:

- **`anamnese`**: Questionário de saúde completo
- **`parq`**: PAR-Q (Physical Activity Readiness Questionnaire)
- **`medidas`**: Medidas corporais detalhadas

---

### 2. **CheckIn** (Registro de Frequência)

Registra cada entrada do aluno na academia.

```prisma
model CheckIn {
  id         String   @id @default(uuid())
  alunoId    String
  dataHora   DateTime @default(now())
  metodo     String   @default("MANUAL")
}
```

#### Métodos de Check-in:
- `MANUAL`: Check-in realizado pelo admin
- `PIN`: Check-in via código PIN do aluno
- `QR_CODE`: Via QR Code
- `FACIAL`: Reconhecimento facial (futuro)

---

### 3. **Plano** (Planos de Assinatura)

Define os planos disponíveis na academia.

```prisma
model Plano {
  id          String   @id @default(uuid())
  nome        String   @unique
  descricao   String
  preco       Float
  beneficios  Json     // ["Benefício 1", "Benefício 2"]
}
```

#### Exemplos de Planos:

```json
{
  "nome": "BASIC",
  "preco": 149.00,
  "beneficios": [
    "Acesso ilimitado (05H-23H)",
    "Avaliação de entrada",
    "Planilha inicial"
  ]
}
```

---

### 4. **Pagamento** (Controle Financeiro)

Gerencia mensalidades e pagamentos.

```prisma
model Pagamento {
  id              String          @id @default(uuid())
  alunoId         String
  valor           Float
  dataVencimento  DateTime
  status          StatusPagamento
}
```

#### Status de Pagamento:
- `PENDENTE`: Aguardando pagamento
- `PAGO`: Pagamento confirmado
- `ATRASADO`: Vencido e não pago
- `CANCELADO`: Cancelado manualmente

---

### 5. **Avaliacao** (Avaliações Físicas)

Registra avaliações físicas periódicas dos alunos.

```prisma
model Avaliacao {
  id                 String   @id @default(uuid())
  alunoId            String
  peso               Float?
  altura             Float?
  percentualGordura  Float?
  // + medidas corporais detalhadas
}
```

---

## 🚀 Configuração do Supabase

### 1. **Criar Projeto no Supabase**

```bash
# 1. Acesse https://supabase.com
# 2. Crie um novo projeto
# 3. Copie a DATABASE_URL
```

### 2. **Configurar `.env`**

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 3. **Executar Migrations**

```bash
# Instalar Prisma
npm install prisma @prisma/client

# Inicializar Prisma (se necessário)
npx prisma init

# Copiar schema.prisma para o projeto

# Criar migration inicial
npx prisma migrate dev --name init

# Gerar Prisma Client
npx prisma generate
```

### 4. **Habilitar Row Level Security (RLS)**

```sql
-- Exemplo para tabela Alunos
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem tudo
CREATE POLICY "Admins podem gerenciar alunos"
ON alunos
FOR ALL
TO authenticated
USING (true);

-- Política: Alunos só veem seus próprios dados
CREATE POLICY "Alunos veem próprios dados"
ON alunos
FOR SELECT
TO authenticated
USING (auth.uid()::text = id);
```

---

## 🔍 Queries Úteis

### Dashboard - Métricas Principais

```typescript
// Alunos ativos
const alunosAtivos = await prisma.aluno.count({
  where: { statusMatricula: 'ATIVO' }
});

// Check-ins hoje
const checkinsHoje = await prisma.checkIn.count({
  where: {
    dataHora: {
      gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  }
});

// Alunos em atraso
const alunosEmAtraso = await prisma.aluno.count({
  where: { statusFinanceiro: 'EM_ATRASO' }
});
```

### Listagem de Alunos com Filtros

```typescript
const alunos = await prisma.aluno.findMany({
  where: {
    statusMatricula: 'ATIVO',
    statusFinanceiro: 'EM_DIA',
    plano: {
      nome: 'PREMIUM'
    }
  },
  include: {
    plano: true,
    checkins: {
      take: 1,
      orderBy: { dataHora: 'desc' }
    }
  },
  orderBy: { nome: 'asc' }
});
```

### Check-ins por Período

```typescript
const checkinsUltimaSemana = await prisma.checkIn.findMany({
  where: {
    dataHora: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  },
  include: {
    aluno: {
      select: {
        nome: true,
        foto: true,
        plano: true
      }
    }
  },
  orderBy: { dataHora: 'desc' }
});
```

### Identificar "Turistas" (sem check-in há +10 dias)

```typescript
const turistas = await prisma.aluno.findMany({
  where: {
    statusMatricula: 'ATIVO',
    checkins: {
      none: {
        dataHora: {
          gte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      }
    }
  },
  include: {
    checkins: {
      take: 1,
      orderBy: { dataHora: 'desc' }
    }
  }
});
```

### Pagamentos Vencendo (próximos 3 dias)

```typescript
const pagamentosVencendo = await prisma.pagamento.findMany({
  where: {
    status: 'PENDENTE',
    dataVencimento: {
      gte: new Date(),
      lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    }
  },
  include: {
    aluno: {
      select: { nome: true, telefone: true, email: true }
    }
  }
});
```

---

## 🔗 Relacionamentos

### Diagrama de Relacionamentos

```
Aluno (1) ──────< (N) CheckIn
  │
  ├─────< (N) Pagamento
  │
  ├─────< (N) Avaliacao
  │
  └─────> (1) Plano

Admin (independente)
ConfiguracaoAcademia (singleton)
LogAuditoria (registro histórico)
```

---

## 📝 Exemplos de Uso

### Criar Novo Aluno

```typescript
const novoAluno = await prisma.aluno.create({
  data: {
    matricula: '#' + Math.floor(1000 + Math.random() * 9000),
    nome: "João Silva",
    cpf: "123.456.789-00",
    email: "joao@email.com",
    telefone: "(11) 98765-4321",
    dataNascimento: new Date("1990-01-15"),
    sexo: "M",
    estadoCivil: "solteiro",
    pin: "1234",
    planoId: planoBasicId,
    statusFinanceiro: "EM_DIA",
    statusMatricula: "ATIVO",
    anamnese: {
      "problemaCardiaco": "NÃO",
      "dorPeito": "NÃO",
      "tontura": "NÃO"
    },
    parq: {
      "q1": "NÃO",
      "q2": "NÃO",
      "q3": "NÃO"
    },
    parqHasSim: false
  }
});
```

### Registrar Check-in

```typescript
const checkin = await prisma.checkIn.create({
  data: {
    alunoId: alunoId,
    metodo: "PIN"
  }
});
```

### Criar Pagamento Mensal

```typescript
const pagamento = await prisma.pagamento.create({
  data: {
    alunoId: alunoId,
    valor: 149.00,
    dataVencimento: new Date("2026-05-10"),
    formaPagamento: "PIX",
    status: "PENDENTE"
  }
});
```

---

## 🛠️ Índices e Performance

O schema já inclui índices otimizados:

```prisma
@@index([statusMatricula])
@@index([statusFinanceiro])
@@index([planoId])
@@index([dataHora])
```

### Queries Otimizadas com Índices

✅ **Rápido** (usa índice):
```typescript
where: { statusMatricula: 'ATIVO' }
where: { dataHora: { gte: hoje } }
```

❌ **Lento** (sem índice):
```typescript
where: { nome: { contains: 'João' } } // Full table scan
```

---

## 🔐 Segurança

### Boas Práticas

1. **Nunca expor senhas ou dados sensíveis**
2. **Validar inputs no backend**
3. **Usar RLS (Row Level Security) no Supabase**
4. **Criptografar dados sensíveis (CPF, RG)**
5. **Logs de auditoria para ações críticas**

---

## 📊 Relatórios e Analytics

### Dashboard Principal

```typescript
const dashboard = {
  alunosAtivos: await prisma.aluno.count({ where: { statusMatricula: 'ATIVO' } }),
  checkinsHoje: await prisma.checkIn.count({ where: { dataHora: { gte: hoje } } }),
  ticketMedio: await prisma.pagamento.aggregate({
    _avg: { valor: true },
    where: { status: 'PAGO' }
  }),
  retencao: await calcularRetencao() // Custom function
};
```

---

## 🚨 Manutenção

### Rotinas Automáticas Recomendadas

1. **Atualizar status financeiro** (diário)
2. **Bloquear alunos em atraso** (diário)
3. **Enviar lembretes de vencimento** (diário)
4. **Backup do banco** (diário)
5. **Limpar logs antigos** (mensal)

---

## 📞 Suporte

Para dúvidas sobre o schema:
- 📧 Email: dev@lute.academy
- 📚 Documentação Prisma: https://www.prisma.io/docs
- 🗄️ Documentação Supabase: https://supabase.com/docs

---

**LuTe Academy** - Beyond Limits Known 🏋️‍♂️
