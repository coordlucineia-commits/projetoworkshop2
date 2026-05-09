-- LuTe Academy — Visitas guiadas (agendamento público + gestão admin)
-- Execute via Supabase SQL Editor ou `supabase db push` após habilitar CLI.
--
-- Lembretes D-1 automáticos via WhatsApp: exige integração externa (ex.: Edge Function
-- com Meta WhatsApp Cloud API + Cron no dashboard). Esta migration cobre dados e RPCs;
-- use o wa.me pré-preenchido no painel "Enviar lembrete" como fallback imediato.

begin;

-- ---------------------------------------------------------------------------
-- Tabela
-- ---------------------------------------------------------------------------
create table if not exists public.visitas_guiadas (
  id uuid primary key default gen_random_uuid(),
  nome_completo text not null,
  telefone text not null,
  data_visita date not null,
  horario text not null,
  status text not null default 'pendente'
    constraint visitas_guiadas_status_chk
      check (status in ('pendente', 'confirmado', 'cancelado')),
  lembrete_enviado_em timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visitas_guiadas_horario_chk check (
    horario in ('09:00','10:00','11:00','14:00','15:00','16:00','17:00')
  )
);

create index if not exists idx_visitas_guiadas_data_hora
  on public.visitas_guiadas (data_visita, horario);

create index if not exists idx_visitas_guiadas_data_status
  on public.visitas_guiadas (data_visita, status);

create or replace function public.visitas_guiadas_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tr_visitas_guiadas_updated on public.visitas_guiadas;
create trigger tr_visitas_guiadas_updated
  before update on public.visitas_guiadas
  for each row execute procedure public.visitas_guiadas_set_updated_at();

-- ---------------------------------------------------------------------------
-- Constante: máximo de visitantes por slot (guiada)
-- ---------------------------------------------------------------------------
-- Ajuste alterando o valor em criar_visita_guiada (search "v_max_slot").

-- ---------------------------------------------------------------------------
-- Ocupação por horário (público + admin)
-- Parâmetro TEXT: PostgREST/JSON e schema cache RPC (Supabase) mais compatíveis.
-- Overload DATE: preserva callers internos/antigos criar_visita_guiada(...)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Criar agendamento (anon + authenticated; validação no servidor)
-- ---------------------------------------------------------------------------
create or replace function public.criar_visita_guiada(
  p_nome text,
  p_telefone text,
  p_data date,
  p_horario text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_count bigint;
  v_max_slot int := 8;
  v_hoje date;
  v_dow int;
  v_nome text := trim(p_nome);
  v_tel text;
  v_digits text;
begin
  if length(v_nome) < 3 then
    raise exception 'Informe o nome completo.';
  end if;

  v_tel := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
  if length(v_tel) < 10 or length(v_tel) > 13 then
    raise exception 'Telefone inválido.';
  end if;
  v_digits := v_tel;

  v_hoje := (timezone('America/Sao_Paulo', now()))::date;
  if p_data < v_hoje then
    raise exception 'Não é possível agendar em data passada.';
  end if;

  v_dow := extract(isodow from p_data::timestamp);
  if v_dow = 7 then
    raise exception 'Domingo indisponível para visitas guiadas.';
  end if;

  if p_horario not in (
    '09:00','10:00','11:00','14:00','15:00','16:00','17:00'
  ) then
    raise exception 'Horário inválido.';
  end if;

  select hv.ocupacao into v_count
  from public.visitas_horarios_ocupacao(p_data::text) hv
  where hv.horario = p_horario;

  if v_count >= v_max_slot then
    raise exception 'Horário lotado. Escolha outro.';
  end if;

  insert into public.visitas_guiadas (
    nome_completo, telefone, data_visita, horario, status
  ) values (
    v_nome, v_digits, p_data, p_horario, 'pendente'
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Confirmação via link público
-- ---------------------------------------------------------------------------
create or replace function public.confirmar_visita_por_id(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nome text;
begin
  select nome_completo into v_nome
  from public.visitas_guiadas
  where id = p_id and status = 'pendente';

  if v_nome is not null then
    update public.visitas_guiadas
    set status = 'confirmado'
    where id = p_id and status = 'pendente';

    return json_build_object('ok', true, 'nome', v_nome);
  end if;

  select nome_completo into v_nome
  from public.visitas_guiadas
  where id = p_id and status = 'confirmado';

  if v_nome is not null then
    return json_build_object('ok', true, 'nome', v_nome, 'already', true);
  end if;

  return json_build_object('ok', false, 'error', 'Agendamento não encontrado ou não pode ser confirmado.');
end;
$$;

-- ---------------------------------------------------------------------------
-- Registrar que lembrete foi enviado (admin)
-- ---------------------------------------------------------------------------
create or replace function public.visitas_guiadas_marcar_lembrete(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Acesso negado.';
  end if;

  update public.visitas_guiadas
  set lembrete_enviado_em = coalesce(lembrete_enviado_em, now())
  where id = p_id;

  return found;
end;
$$;

-- Chamada apenas com service_role (ex.: Edge Function + Cron Diário —
-- após WhatsApp bem-sucedido, marcamos lembrete para não reenviar.
create or replace function public.visitas_guiadas_registrar_envio_lembrete(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.visitas_guiadas
  set lembrete_enviado_em = now()
  where id = p_id
    and status = 'pendente'
    and lembrete_enviado_em is null;

  return found;
end;
$$;

revoke all on function public.visitas_horarios_ocupacao(text) from public;
grant execute on function public.visitas_horarios_ocupacao(text) to anon, authenticated;

revoke all on function public.criar_visita_guiada(text, text, date, text) from public;
grant execute on function public.criar_visita_guiada(text, text, date, text) to anon, authenticated;

revoke all on function public.confirmar_visita_por_id(uuid) from public;
grant execute on function public.confirmar_visita_por_id(uuid) to anon, authenticated;

revoke all on function public.visitas_guiadas_marcar_lembrete(uuid) from public;
grant execute on function public.visitas_guiadas_marcar_lembrete(uuid) to authenticated;

revoke all on function public.visitas_guiadas_registrar_envio_lembrete(uuid) from public;
grant execute on function public.visitas_guiadas_registrar_envio_lembrete(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.visitas_guiadas enable row level security;

revoke all on table public.visitas_guiadas from anon;
grant select, insert, update, delete on table public.visitas_guiadas to authenticated;

drop policy if exists "visitas_guiadas_admin_all" on public.visitas_guiadas;
create policy "visitas_guiadas_admin_all"
on public.visitas_guiadas
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

notify pgrst, 'reload schema';

commit;
