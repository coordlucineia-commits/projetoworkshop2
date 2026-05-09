-- Permitir fluxo completo de cadastro de aluno (recepção / colaborador com escritura em "alunos").
-- Antes desta migração, apenas super-admin (`is_admin`) podia mexer em `avaliacoes` e `pagamentos`.
-- `salvarCadastroAluno` insere sempre em `pagamentos` e, com peso+altura, em `avaliacoes`:
-- usuários apenas com permissão de alunos passavam no INSERT em `alunos` e falhavam logo em seguida (RLS).

begin;

drop policy if exists aval_super_all on public.avaliacoes;

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

drop policy if exists pagamentos_super_only on public.pagamentos;

create policy pagamentos_select_staff on public.pagamentos
  for select to authenticated
  using (
    public.is_admin(auth.uid())
    or public.staff_has_perm('alunos')
    or public.staff_has_perm('dashboard')
  );

create policy pagamentos_insert_staff on public.pagamentos
  for insert to authenticated
  with check (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('alunos')
  );

create policy pagamentos_update_staff on public.pagamentos
  for update to authenticated
  using (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('alunos')
  )
  with check (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('alunos')
  );

create policy pagamentos_delete_super on public.pagamentos
  for delete to authenticated
  using (public.is_admin(auth.uid()));

notify pgrst, 'reload schema';

commit;
