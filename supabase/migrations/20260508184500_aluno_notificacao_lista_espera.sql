-- Lista de espera em aulas, notificações ao aluno, promoção automática ao cancelar

begin;

-- ---------------------------------------------------------------------------
-- aula_inscricoes — status lista_espera + created_at para ordem FIFO
-- ---------------------------------------------------------------------------
alter table public.aula_inscricoes
  drop constraint if exists aula_inscricoes_status_check;

alter table public.aula_inscricoes
  add constraint aula_inscricoes_status_check
  check (status in ('inscrito','cancelado','lista_espera'));

alter table public.aula_inscricoes
  add column if not exists created_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- Notificações in-app para o aluno
-- ---------------------------------------------------------------------------
create table if not exists public.aluno_notificacoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  titulo text not null,
  corpo text not null,
  lida_em timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_aluno_notificacoes_aluno_created
  on public.aluno_notificacoes (aluno_id, created_at desc);

alter table public.aluno_notificacoes enable row level security;

grant select, update on public.aluno_notificacoes to authenticated;

drop policy if exists an_aluno_select on public.aluno_notificacoes;
create policy an_aluno_select on public.aluno_notificacoes
  for select to authenticated
  using (aluno_id = public.meu_aluno_id());

drop policy if exists an_aluno_mark_read on public.aluno_notificacoes;
create policy an_aluno_mark_read on public.aluno_notificacoes
  for update to authenticated
  using (aluno_id = public.meu_aluno_id())
  with check (aluno_id = public.meu_aluno_id());

-- Inserções somente pelo sistema (RPC security definer)
drop policy if exists an_no_direct_insert on public.aluno_notificacoes;

-- ---------------------------------------------------------------------------
-- Cancela inscrição e, se libertar vaga, promove 1ª da lista de espera + notifica
-- Cap por turma na função = least(max_vagas, 20) alinhado ao app
-- ---------------------------------------------------------------------------
create or replace function public.aluno_cancelar_inscricao_aula_promover(p_inscricao_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := public.meu_aluno_id();
  r record;
  v_aula uuid;
  v_sem date;
  v_cap int;
  v_ocup int;
  w record;
  v_nome text;
  v_hini text;
  v_hfim text;
begin
  if v_me is null then
    raise exception 'Perfil de aluno não encontrado.';
  end if;

  select
    ai.aula_recorrente_id,
    ai.semana_inicio,
    ai.aluno_id,
    ai.status
  into r
  from public.aula_inscricoes ai
  where ai.id = p_inscricao_id
  for update;

  if not found then
    raise exception 'Inscrição não encontrada.';
  end if;

  if r.aluno_id <> v_me then
    raise exception 'Esta inscrição não é sua.';
  end if;

  if r.status not in ('inscrito','lista_espera') then
    return;
  end if;

  v_aula := r.aula_recorrente_id;
  v_sem := r.semana_inicio;

  update public.aula_inscricoes
  set status = 'cancelado'
  where id = p_inscricao_id;

  if r.status <> 'inscrito' then
    return;
  end if;

  select
    greatest(ar.max_vagas, 1),
    ar.nome,
    substring(ar.hora_inicio::text, 1, 5),
    substring(ar.hora_fim::text, 1, 5)
  into v_cap, v_nome, v_hini, v_hfim
  from public.aulas_recorrentes ar
  where ar.id = v_aula;

  v_cap := least(v_cap, 20);

  select count(*)::int into v_ocup
  from public.aula_inscricoes x
  where x.aula_recorrente_id = v_aula
    and x.semana_inicio = v_sem
    and x.status = 'inscrito';

  if v_ocup >= v_cap then
    return;
  end if;

  select ai.id, ai.aluno_id
  into w
  from public.aula_inscricoes ai
  where ai.aula_recorrente_id = v_aula
    and ai.semana_inicio = v_sem
    and ai.status = 'lista_espera'
  order by ai.created_at asc
  limit 1
  for update skip locked;

  if not found then
    return;
  end if;

  update public.aula_inscricoes
  set status = 'inscrito'
  where id = w.id;

  insert into public.aluno_notificacoes (aluno_id, titulo, corpo)
  values (
    w.aluno_id,
    'Vaga disponível na aula',
      'Liberação automática na turma '
      || coalesce(v_nome, 'em grupo')
      || ' (' || coalesce(v_hini, '?') || '–' || coalesce(v_hfim, '?')
      || '). Você saiu da lista de espera e foi confirmado na aula.'
  );
end;
$$;

revoke all on function public.aluno_cancelar_inscricao_aula_promover(uuid) from public;
grant execute on function public.aluno_cancelar_inscricao_aula_promover(uuid) to authenticated;

notify pgrst, 'reload schema';

commit;
