-- Permite ao aluno autenticado consultar apenas os próprios pagamentos (ficha de cadastro / Meu perfil).
-- Complementa políticas existentes para staff/admin (OR).

drop policy if exists "pagamentos_select_own_aluno" on public.pagamentos;

create policy "pagamentos_select_own_aluno" on public.pagamentos
  for select
  to authenticated
  using (aluno_id = public.meu_aluno_id());

notify pgrst, 'reload schema';
