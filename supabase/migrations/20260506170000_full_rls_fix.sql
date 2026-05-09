-- =============================================================================
-- LuTe Academy — Full RLS Fix (2026-05-06)
-- =============================================================================
--
-- DIAGNÓSTICO:
--
-- 1. CRÍTICO — `planos` sem SELECT para alunos
--    As policies de `planos` (planos_staff_select) exigem is_admin() ou
--    staff com permissão 'configuracoes'. Nenhuma aluna/aluno autenticado
--    pode ler a tabela. Isso quebra:
--    • AlunoSessoesPage — join planos(nome) retorna null → exibe "plano não
--      compatível" para todos os alunos, independente do plano contratado.
--    • AlunoPerfilPage — nome e preço do plano nunca aparecem.
--
-- 2. `avaliacoes` — policies sobrepostas / muito amplas
--    • 20260505025634 criou aval_select_staff / aval_insert_staff / etc.
--    • 20260505120000 criou avaliacoes_authenticated_select/insert/update
--      com USING(true) / WITH CHECK(true) — qualquer autenticado insere,
--      atualiza e lê TODAS as avaliações de todos os alunos.
--    Solução: substituir as policies da transição por políticas granulares
--    (staff para escrita; aluno lê apenas os próprios dados).
--
-- 3. `pagamentos` — policies sobrepostas / muito amplas
--    Mesma situação: pagamentos_authenticated_insert/update WITH CHECK(true)
--    deixavam qualquer autenticado alterar pagamentos alheios.
--    Solução: remover as policies da transição (as específicas de staff e
--    pagamentos_select_own_aluno já cobrem todos os casos legítimos).
--
-- 4. `avaliacoes_agenda` — aluno pode fazer DELETE da própria solicitação
--    A policy av_part já cobre via FOR ALL, mas reforçamos para clareza.
--
-- database.types.ts: manter avaliacoes.agenda_id alinhado ao schema.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. PLANOS — leitura para todos os usuários autenticados (CRÍTICO)
--    Sem esta policy, o campo planos(nome) em joins retorna null para
--    qualquer usuário que não seja admin ou staff com 'configuracoes'.
-- ---------------------------------------------------------------------------
drop policy if exists planos_authenticated_select on public.planos;

create policy planos_authenticated_select on public.planos
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 2. AVALIACOES — substituir policies amplas da transição
--    por policies granulares.
-- ---------------------------------------------------------------------------

-- Remove policies de transição (USING true / WITH CHECK true)
drop policy if exists avaliacoes_authenticated_select on public.avaliacoes;
drop policy if exists avaliacoes_authenticated_insert on public.avaliacoes;
drop policy if exists avaliacoes_authenticated_update on public.avaliacoes;
drop policy if exists avaliacoes_super_delete          on public.avaliacoes;

-- Aluno lê apenas as próprias avaliações
drop policy if exists avaliacoes_aluno_own_select on public.avaliacoes;

create policy avaliacoes_aluno_own_select on public.avaliacoes
  for select to authenticated
  using (aluno_id = public.meu_aluno_id());

-- Staff/admin continua com CRUD completo (policies aval_select_staff,
-- aval_insert_staff, aval_update_staff, aval_delete_super já existem
-- de 20260505025634 e são mantidas).

-- Garante que admin também pode fazer DELETE (belt-and-suspenders sobre
-- aval_delete_super de 20260505025634).
drop policy if exists avaliacoes_admin_delete on public.avaliacoes;

create policy avaliacoes_admin_delete on public.avaliacoes
  for delete to authenticated
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- 3. PAGAMENTOS — remover policies de transição (muito amplas)
--    pagamentos_select_staff, pagamentos_insert_staff, pagamentos_update_staff,
--    pagamentos_delete_super (de 20260505025634) e
--    pagamentos_select_own_aluno (de 20260506130000) já cobrem todos os casos.
-- ---------------------------------------------------------------------------
drop policy if exists pagamentos_authenticated_select on public.pagamentos;
drop policy if exists pagamentos_authenticated_insert on public.pagamentos;
drop policy if exists pagamentos_authenticated_update on public.pagamentos;
drop policy if exists pagamentos_super_delete          on public.pagamentos;

-- Regarante a policy de leitura própria do aluno (já deve existir, mas
-- a recreamos para garantir idempotência após qualquer drop acima).
drop policy if exists pagamentos_select_own_aluno on public.pagamentos;

create policy pagamentos_select_own_aluno on public.pagamentos
  for select to authenticated
  using (aluno_id = public.meu_aluno_id());

-- Admin tem delete total sobre pagamentos
drop policy if exists pagamentos_admin_delete on public.pagamentos;

create policy pagamentos_admin_delete on public.pagamentos
  for delete to authenticated
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. PERSONAL_SESSOES — garantir que aluno pode ler, criar e cancelar
--    as próprias sessões (policies ps_aluno / ps_aluno_ins / ps_aluno_upd
--    devem existir de 20260204180000; recriamos para garantir)
-- ---------------------------------------------------------------------------
drop policy if exists ps_aluno     on public.personal_sessoes;
drop policy if exists ps_aluno_ins on public.personal_sessoes;
drop policy if exists ps_aluno_upd on public.personal_sessoes;

create policy ps_aluno on public.personal_sessoes
  for select to authenticated
  using (aluno_id = public.meu_aluno_id());

create policy ps_aluno_ins on public.personal_sessoes
  for insert to authenticated
  with check (aluno_id = public.meu_aluno_id());

create policy ps_aluno_upd on public.personal_sessoes
  for update to authenticated
  using  (aluno_id = public.meu_aluno_id())
  with check (aluno_id = public.meu_aluno_id());

-- ---------------------------------------------------------------------------
-- 5. AULAS_RECORRENTES — garantir SELECT para alunos
--    ar_leitura deve existir de 20260204180000; recriamos para garantir.
-- ---------------------------------------------------------------------------
drop policy if exists ar_leitura on public.aulas_recorrentes;

create policy ar_leitura on public.aulas_recorrentes
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 6. AULA_INSCRICOES — garantir que aluno pode ver e gerenciar as próprias
--    inscrições (policy ai_own deve existir de 20260204180000)
-- ---------------------------------------------------------------------------
drop policy if exists ai_own on public.aula_inscricoes;

create policy ai_own on public.aula_inscricoes
  for all to authenticated
  using (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('aulas')
    or aluno_id = public.meu_aluno_id()
  )
  with check (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('aulas')
    or aluno_id = public.meu_aluno_id()
  );

-- ---------------------------------------------------------------------------
-- Recarrega o schema do PostgREST
-- ---------------------------------------------------------------------------
notify pgrst, 'reload schema';

commit;
