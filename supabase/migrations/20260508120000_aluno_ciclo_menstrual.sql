-- Dados opcionais de ciclo menstrual por aluna (FK 1:1 com alunos).
-- RLS: a própria aluna autenticada via meu_aluno_id().

begin;

create table public.aluno_ciclo_menstrual (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null unique references public.alunos (id) on delete cascade,
  dias_menstruais integer null check (dias_menstruais is null or (dias_menstruais >= 1 and dias_menstruais <= 31)),
  dias_ciclo integer null check (dias_ciclo is null or (dias_ciclo >= 15 and dias_ciclo <= 45)),
  data_ultima_menstruacao date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index aluno_ciclo_menstrual_aluno_id_idx on public.aluno_ciclo_menstrual (aluno_id);

create or replace function public.aluno_ciclo_menstrual_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tr_aluno_ciclo_menstrual_updated on public.aluno_ciclo_menstrual;
create trigger tr_aluno_ciclo_menstrual_updated
  before update on public.aluno_ciclo_menstrual
  for each row
  execute procedure public.aluno_ciclo_menstrual_set_updated_at();

alter table public.aluno_ciclo_menstrual enable row level security;

grant select, insert, update on public.aluno_ciclo_menstrual to authenticated;

drop policy if exists aluno_ciclo_menstrual_own_select on public.aluno_ciclo_menstrual;
drop policy if exists aluno_ciclo_menstrual_own_insert on public.aluno_ciclo_menstrual;
drop policy if exists aluno_ciclo_menstrual_own_update on public.aluno_ciclo_menstrual;

create policy aluno_ciclo_menstrual_own_select on public.aluno_ciclo_menstrual
  for select to authenticated
  using (aluno_id = public.meu_aluno_id());

create policy aluno_ciclo_menstrual_own_insert on public.aluno_ciclo_menstrual
  for insert to authenticated
  with check (aluno_id = public.meu_aluno_id());

create policy aluno_ciclo_menstrual_own_update on public.aluno_ciclo_menstrual
  for update to authenticated
  using (aluno_id = public.meu_aluno_id())
  with check (aluno_id = public.meu_aluno_id());

notify pgrst, 'reload schema';

commit;
