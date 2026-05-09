-- RPC: salvar_plano_treino_professor
-- Atomically replaces the active plan for a student with a new one built from JSON.
-- SECURITY DEFINER allows deactivating plans from other professors, which client-side
-- RLS prevents (pt_prof policy scope is limited to professor_id = meu_professor_id()).
create or replace function public.salvar_plano_treino_professor(
  p_aluno_id uuid,
  p_titulo    text,
  p_dias      jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_professor_id uuid;
  v_plano_id     uuid;
  v_dia          jsonb;
  v_ex           jsonb;
  v_dia_id       uuid;
begin
  -- Verify caller is an authenticated professor
  v_professor_id := public.meu_professor_id();
  if v_professor_id is null then
    raise exception 'Apenas professores autenticados podem salvar treinos';
  end if;

  -- Deactivate ALL active plans for this student (SECURITY DEFINER bypasses RLS so
  -- we can deactivate plans that belong to other professors, avoiding the unique
  -- partial index violation on (aluno_id) WHERE ativo).
  update public.planos_treino
    set ativo = false
    where aluno_id = p_aluno_id
      and ativo = true;

  -- Insert the new plan
  insert into public.planos_treino (aluno_id, professor_id, titulo, ativo)
    values (p_aluno_id, v_professor_id, p_titulo, true)
    returning id into v_plano_id;

  -- Insert days and their exercises from the JSONB array
  for v_dia in select * from jsonb_array_elements(p_dias) loop
    insert into public.planos_treino_dias (plano_id, dia_semana, rotulo)
      values (
        v_plano_id,
        (v_dia->>'dia_semana')::smallint,
        v_dia->>'rotulo'
      )
      returning id into v_dia_id;

    for v_ex in select * from jsonb_array_elements(v_dia->'exercicios') loop
      insert into public.planos_treino_exercicios (
        plano_dia_id,
        exercicio_id,
        nome_exercicio,
        series,
        repeticoes,
        equipamento,
        tempo_descanso_segundos,
        carga_sugerida,
        observacoes,
        ordem
      ) values (
        v_dia_id,
        case
          when (v_ex->>'exercicio_id') is null or (v_ex->>'exercicio_id') = ''
          then null
          else (v_ex->>'exercicio_id')::uuid
        end,
        v_ex->>'nome_exercicio',
        (v_ex->>'series')::integer,
        v_ex->>'repeticoes',
        v_ex->>'equipamento',
        case
          when (v_ex->>'tempo_descanso_segundos') is null
          then null
          else (v_ex->>'tempo_descanso_segundos')::integer
        end,
        v_ex->>'carga_sugerida',
        v_ex->>'observacoes',
        (v_ex->>'ordem')::integer
      );
    end loop;
  end loop;

  return v_plano_id;
end;
$$;

grant execute on function public.salvar_plano_treino_professor(uuid, text, jsonb) to authenticated;
