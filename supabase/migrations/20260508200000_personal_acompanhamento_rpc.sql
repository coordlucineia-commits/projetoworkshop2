-- Vincula professor como personal do aluno após avaliação; aluno altera personal com professores ativos

begin;

create or replace function public.professor_vincular_personal_apos_avaliacao(p_aluno_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := public.meu_professor_id();
begin
  if v_me is null then
    raise exception 'Apenas professores autenticados.';
  end if;
  update public.alunos
  set professor_acompanhamento_id = v_me
  where id = p_aluno_id;
end;
$$;

revoke all on function public.professor_vincular_personal_apos_avaliacao(uuid) from public;
grant execute on function public.professor_vincular_personal_apos_avaliacao(uuid) to authenticated;

create or replace function public.aluno_atualizar_personal_acompanhamento(p_professor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aluno uuid := public.meu_aluno_id();
begin
  if v_aluno is null then
    raise exception 'Apenas alunos autenticados.';
  end if;
  if not exists (
    select 1 from public.professores p
    where p.id = p_professor_id and coalesce(p.ativo, true)
  ) then
    raise exception 'Professor inválido ou inativo.';
  end if;
  update public.alunos
  set professor_acompanhamento_id = p_professor_id
  where id = v_aluno;
end;
$$;

revoke all on function public.aluno_atualizar_personal_acompanhamento(uuid) from public;
grant execute on function public.aluno_atualizar_personal_acompanhamento(uuid) to authenticated;

notify pgrst, 'reload schema';

commit;
