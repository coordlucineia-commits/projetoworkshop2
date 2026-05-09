-- Professores autenticados podem criar registros na biblioteca de exercícios (uso no cadastro de treino).

begin;

drop policy if exists exercicios_professor_ins on public.exercicios;
create policy exercicios_professor_ins on public.exercicios
  for insert to authenticated
  with check (public.meu_professor_id() is not null);

notify pgrst, 'reload schema';

commit;
