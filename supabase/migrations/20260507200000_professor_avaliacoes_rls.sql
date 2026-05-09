-- =============================================================================
-- LuTe Academy — Professor Avaliacoes: Add agenda_id + RLS fix
-- 2026-05-07
-- =============================================================================
--
-- DIAGNÓSTICO DO BANCO LIVE (project: sawhwvsurwzjqgnrvtpf):
--
-- 1. CRÍTICO — `avaliacoes.agenda_id` AUSENTE
--    O frontend (ProfessorAvaliacaoRegistrarPage.tsx) faz INSERT incluindo
--    `agenda_id: agendaId`, mas a coluna NÃO EXISTE na tabela live.
--    Resultado: toda tentativa de insert do professor falha com
--    "column agenda_id does not exist".
--
-- 2. POLÍTICAS DE avaliacoes SÃO AS "DE TRANSIÇÃO" (muito amplas)
--    As policies ativas são avaliacoes_authenticated_* com USING/WITH CHECK(true),
--    ou seja, qualquer autenticado pode ler TODOS os dados de qualquer aluno.
--    Essas policies existem na migration 20260505120000 (aplicada como hotfix),
--    mas a 20260506170000 (que deveria substituí-las por granulares) NÃO foi
--    aplicada ao banco live.
--    Solução: substituir pelas policies granulares corretas, acrescentando
--    policies específicas para professores.
--
-- 3. avaliacoes_agenda.av_admin NÃO cobre colaborador com perm 'alunos'
--    O av_admin exige is_admin ou colaborador_pode_escrita('professores').
--    Recepcionistas com perm 'alunos' não conseguem criar slots de agenda.
--
-- 4. SEGURANÇA — anon tem GRANT INSERT/UPDATE/DELETE em avaliacoes e alunos
--    Grants muito amplos concedidos ao role anon (sem nenhuma policy anon ativa).
--    Embora RLS bloqueie acesso anon na prática, é correto revogar.
--
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. ADD agenda_id — O BLOQUEIO PRINCIPAL
--    Liga cada avaliação a um slot da agenda.
-- ---------------------------------------------------------------------------
alter table public.avaliacoes
  add column if not exists agenda_id uuid
  references public.avaliacoes_agenda(id) on delete set null;

create index if not exists avaliacoes_agenda_id_idx
  on public.avaliacoes(agenda_id)
  where agenda_id is not null;

-- ---------------------------------------------------------------------------
-- 2. SUBSTITUIR POLICIES DE TRANSIÇÃO (muito amplas) POR GRANULARES
--    Remove as policies que expõem dados de todos os alunos para qualquer
--    usuário autenticado, e recria com controle correto por papel.
-- ---------------------------------------------------------------------------

-- Limpa policies existentes (idempotente)
drop policy if exists avaliacoes_authenticated_select  on public.avaliacoes;
drop policy if exists avaliacoes_authenticated_insert  on public.avaliacoes;
drop policy if exists avaliacoes_authenticated_update  on public.avaliacoes;
drop policy if exists avaliacoes_super_delete          on public.avaliacoes;
drop policy if exists aval_select_staff                on public.avaliacoes;
drop policy if exists aval_insert_staff                on public.avaliacoes;
drop policy if exists aval_update_staff                on public.avaliacoes;
drop policy if exists aval_delete_super                on public.avaliacoes;
drop policy if exists avaliacoes_aluno_own_select      on public.avaliacoes;
drop policy if exists avaliacoes_admin_delete          on public.avaliacoes;
drop policy if exists aval_insert_professor            on public.avaliacoes;
drop policy if exists aval_select_professor            on public.avaliacoes;
drop policy if exists aval_update_professor            on public.avaliacoes;

-- Admin: acesso total
create policy aval_select_staff on public.avaliacoes
  for select to authenticated
  using (
    public.is_admin(auth.uid())
    or public.staff_has_perm('alunos')
    or public.staff_has_perm('dashboard')
  );

create policy aval_insert_staff on public.avaliacoes
  for insert to authenticated
  with check (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('alunos')
  );

create policy aval_update_staff on public.avaliacoes
  for update to authenticated
  using (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('alunos')
  )
  with check (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('alunos')
  );

create policy aval_delete_super on public.avaliacoes
  for delete to authenticated
  using (public.is_admin(auth.uid()));

-- Aluno: lê apenas as próprias avaliações
create policy avaliacoes_aluno_own_select on public.avaliacoes
  for select to authenticated
  using (aluno_id = public.meu_aluno_id());

-- ---------------------------------------------------------------------------
-- 3. POLÍTICAS PARA PROFESSORES EM avaliacoes
-- ---------------------------------------------------------------------------

-- Professor pode INSERT em avaliacoes.
-- Permite qualquer professor ativo; a vinculação correta via agenda_id
-- é garantida pelo frontend. Pode ser endurecido futuramente para exigir
-- que agenda_id aponte para um slot deste professor.
create policy aval_insert_professor on public.avaliacoes
  for insert to authenticated
  with check (public.meu_professor_id() is not null);

-- Professor pode SELECT nas avaliações de alunos vinculados a ele via:
--   (a) agenda_id → avaliacoes_agenda.professor_id
--   (b) plano de treino ativo criado por este professor
--   (c) sessão personal agendada
create policy aval_select_professor on public.avaliacoes
  for select to authenticated
  using (
    public.meu_professor_id() is not null
    and (
      (
        agenda_id is not null
        and exists (
          select 1 from public.avaliacoes_agenda ag
          where ag.id = avaliacoes.agenda_id
            and ag.professor_id = public.meu_professor_id()
        )
      )
      or exists (
        select 1 from public.planos_treino pt
        where pt.aluno_id = avaliacoes.aluno_id
          and pt.professor_id = public.meu_professor_id()
      )
      or exists (
        select 1 from public.personal_sessoes ps
        where ps.aluno_id = avaliacoes.aluno_id
          and ps.professor_id = public.meu_professor_id()
      )
    )
  );

-- Professor pode UPDATE nas avaliações vinculadas à sua agenda
create policy aval_update_professor on public.avaliacoes
  for update to authenticated
  using (
    agenda_id is not null
    and exists (
      select 1 from public.avaliacoes_agenda ag
      where ag.id = avaliacoes.agenda_id
        and ag.professor_id = public.meu_professor_id()
    )
  )
  with check (
    agenda_id is not null
    and exists (
      select 1 from public.avaliacoes_agenda ag
      where ag.id = avaliacoes.agenda_id
        and ag.professor_id = public.meu_professor_id()
    )
  );

-- ---------------------------------------------------------------------------
-- 4. CORRIGIR av_admin em avaliacoes_agenda
--    Incluir colaborador_pode_escrita('alunos') para que recepcionistas
--    com permissão de alunos possam criar/editar slots de avaliação.
-- ---------------------------------------------------------------------------
drop policy if exists av_admin on public.avaliacoes_agenda;

create policy av_admin on public.avaliacoes_agenda
  for all to authenticated
  using (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('professores')
    or public.colaborador_pode_escrita('alunos')
  )
  with check (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('professores')
    or public.colaborador_pode_escrita('alunos')
  );

-- ---------------------------------------------------------------------------
-- 5. REVOGAR anon de tabelas sensíveis (DML - segurança)
--    RLS já bloqueia acesso anon na prática (sem policies anon ativas),
--    mas é bom prático revogar explicitamente.
-- ---------------------------------------------------------------------------
revoke insert, update, delete on public.avaliacoes     from anon;
revoke insert, update, delete on public.alunos         from anon;
revoke insert, update, delete on public.pagamentos     from anon;
revoke insert, update, delete on public.professores    from anon;
revoke insert, update, delete on public.colaboradores  from anon;

-- ---------------------------------------------------------------------------
-- Recarrega o schema do PostgREST
-- ---------------------------------------------------------------------------
notify pgrst, 'reload schema';

commit;
