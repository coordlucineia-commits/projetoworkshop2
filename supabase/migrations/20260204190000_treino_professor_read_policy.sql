-- Permite ao professor ler sessões de treino dos próprios alunos (histórico de finalizações).

begin;

drop policy if exists ts_prof_read on public.treino_sessoes;
create policy ts_prof_read on public.treino_sessoes
  for select to authenticated
  using (
    exists (
      select 1 from public.planos_treino_dias d
      join public.planos_treino pt on pt.id = d.plano_id
      where d.id = treino_sessoes.plano_dia_id
        and pt.professor_id = public.meu_professor_id()
    )
    or public.is_admin(auth.uid())
  );

drop policy if exists tsi_prof_read on public.treino_sessao_itens;
create policy tsi_prof_read on public.treino_sessao_itens
  for select to authenticated
  using (
    exists (
      select 1 from public.treino_sessoes s
      join public.planos_treino_dias d on d.id = s.plano_dia_id
      join public.planos_treino pt on pt.id = d.plano_id
      where s.id = treino_sessao_itens.sessao_id
        and pt.professor_id = public.meu_professor_id()
    )
    or public.is_admin(auth.uid())
  );

notify pgrst, 'reload schema';

commit;
