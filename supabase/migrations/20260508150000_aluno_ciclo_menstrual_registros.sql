-- Histórico de ciclos: um registro por cadastro; mantém apenas os últimos 12 meses (por aluna).
-- Copia opcionalmente de aluno_ciclo_menstrual se ainda existir (ambientes que só aplicaram 20260508120000).

begin;

create table public.aluno_ciclo_menstrual_registro (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  dias_menstruais integer not null check (dias_menstruais >= 1 and dias_menstruais <= 31),
  dias_ciclo integer not null check (dias_ciclo >= 15 and dias_ciclo <= 45),
  data_ultima_menstruacao date not null,
  registrado_em timestamptz not null default timezone('utc', now())
);

create index aluno_ciclo_registro_aluno_em_idx on public.aluno_ciclo_menstrual_registro (aluno_id, registrado_em desc);

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'aluno_ciclo_menstrual'
  ) then
    insert into public.aluno_ciclo_menstrual_registro (aluno_id, dias_menstruais, dias_ciclo, data_ultima_menstruacao, registrado_em)
    select
      m.aluno_id,
      m.dias_menstruais,
      m.dias_ciclo,
      m.data_ultima_menstruacao,
      coalesce(timezone('utc', m.updated_at), timezone('utc', m.created_at))
    from public.aluno_ciclo_menstrual m
    where
      m.dias_menstruais is not null
      and m.dias_ciclo is not null
      and m.data_ultima_menstruacao is not null;
  end if;
end;
$$;

drop trigger if exists tr_aluno_ciclo_menstrual_updated on public.aluno_ciclo_menstrual;
drop function if exists public.aluno_ciclo_menstrual_set_updated_at();
drop policy if exists aluno_ciclo_menstrual_own_select on public.aluno_ciclo_menstrual;
drop policy if exists aluno_ciclo_menstrual_own_insert on public.aluno_ciclo_menstrual;
drop policy if exists aluno_ciclo_menstrual_own_update on public.aluno_ciclo_menstrual;
drop table if exists public.aluno_ciclo_menstrual;

create or replace function public.aluno_ciclo_menstrual_registro_prune_antigos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.aluno_ciclo_menstrual_registro r
  where
    r.aluno_id = new.aluno_id
    and r.registrado_em < (timezone('utc', now()) - interval '12 months');
  return new;
end;
$$;

drop trigger if exists tr_aluno_ciclo_registro_prune on public.aluno_ciclo_menstrual_registro;
create trigger tr_aluno_ciclo_registro_prune
  after insert on public.aluno_ciclo_menstrual_registro
  for each row
  execute procedure public.aluno_ciclo_menstrual_registro_prune_antigos();

alter table public.aluno_ciclo_menstrual_registro enable row level security;

grant select, insert on public.aluno_ciclo_menstrual_registro to authenticated;

drop policy if exists aluno_ciclo_registro_own_select on public.aluno_ciclo_menstrual_registro;
drop policy if exists aluno_ciclo_registro_own_insert on public.aluno_ciclo_menstrual_registro;

create policy aluno_ciclo_registro_own_select on public.aluno_ciclo_menstrual_registro
  for select to authenticated
  using (aluno_id = public.meu_aluno_id());

create policy aluno_ciclo_registro_own_insert on public.aluno_ciclo_menstrual_registro
  for insert to authenticated
  with check (aluno_id = public.meu_aluno_id());

notify pgrst, 'reload schema';

commit;
