---
name: fullstack-lute-integration
description: >-
  Orienta desenvolvimento fullstack neste repo: React/TS, Supabase tipado,
  integração front–PostgREST, e persistência de agendamentos no PostgreSQL.
  Use quando o usuário pedir feature completa, integração API, agendamento no
  banco, ou alinhar código com DATABASE_SCHEMA.md e documentação indexada no
  Cursor Docs.
disable-model-invocation: true
---

# Integração fullstack (LuTe Academy)

## Antes de codar

1. Ler **`DATABASE_SCHEMA.md`** e **`src/lib/database.types.ts`**.
2. Se existir documentação no projeto indexada em **Cursor Docs**, usar `@` nos materiais relevantes ou seguir o que o usuário anexou.
3. Confirmar tabelas/colunas reais (não inventar nomes).

## Definição de “pronto”

- UI + chamadas Supabase + tipos alinhados + RLS coerente para o caso de uso.
- Build/typecheck quando possível após a mudança.

## Agendamento

Fluxos de agendamento/agenda **persistem no Supabase** (tabela dedicada, migração, RLS, tipos). Estado local só para UX transitória, não como única fonte de verdade.

## Encaminhamento

Problemas profundos de Postgres/RLS: combinar com o agente **`supabase-fullstack-expert`**.
