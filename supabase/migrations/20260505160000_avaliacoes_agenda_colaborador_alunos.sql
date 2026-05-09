-- Permite cadastrar agendamentos de avaliação corporal no fluxo de matrícula
-- para quem tem escrita na área Alunos (não apenas Professores).
begin;

drop policy if exists av_admin on public.avaliacoes_agenda;

create policy av_admin on public.avaliacoes_agenda
  for all
  to authenticated
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

commit;
