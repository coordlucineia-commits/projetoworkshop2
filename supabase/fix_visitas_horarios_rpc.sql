-- Corrige: "Could not find the function public.visitas_horarios_ocupacao ..."
-- Rode no Supabase → SQL Editor. Exige public.visitas_guiadas criada.

drop function if exists public.visitas_horarios_ocupacao(date);
drop function if exists public.visitas_horarios_ocupacao(text);

create or replace function public.visitas_horarios_ocupacao(p_data text)
returns table (horario text, ocupacao bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    slot.h as horario,
    coalesce((
      select count(*)::bigint
      from public.visitas_guiadas v
      where v.data_visita = p_data::date
        and v.horario = slot.h
        and v.status <> 'cancelado'
    ), 0) as ocupacao
  from (
    values
      ('09:00'::text), ('10:00'), ('11:00'),
      ('14:00'), ('15:00'), ('16:00'), ('17:00')
  ) as slot(h);
$$;

revoke all on function public.visitas_horarios_ocupacao(text) from public;
grant execute on function public.visitas_horarios_ocupacao(text) to anon, authenticated;

-- Atualiza o cache do PostgREST (alguns projetos já recarregam sozinho após salvar).
notify pgrst, 'reload schema';
