-- LuTe Academy — Colaboradores (staff) com permissões por módulo
-- Somente super-admin (função public.is_admin) gere colaboradores; RLS permite acesso granular.

begin;

-- ---------------------------------------------------------------------------
create table if not exists public.colaboradores (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  email text not null unique,
  telefone text,
  cpf text,
  rg text,
  data_nascimento date,
  endereco text,
  foto text,
  permissoes jsonb not null default '{}'::jsonb,
  ativo boolean not null default true,
  criado_por uuid null references auth.users (id),
  ultimo_acesso_em timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_colaboradores_auth on public.colaboradores (auth_user_id);
create index if not exists idx_colaboradores_email on public.colaboradores (lower(trim(email)));

-- ---------------------------------------------------------------------------
-- Permissões: chaves alinhadas ao front (staffPermKeys.ts)
create or replace function public.staff_has_perm(p_key text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return false;
  end if;
  if public.is_admin(uid) then
    return true;
  end if;
  return exists (
    select 1
    from public.colaboradores c
    where c.auth_user_id = uid
      and c.ativo = true
      and coalesce((c.permissoes ->> p_key)::boolean, false)
  );
end;
$$;

revoke all on function public.staff_has_perm(text) from public;
grant execute on function public.staff_has_perm(text) to authenticated;

-- Colaboradores sem chave só leem dashboards se tiverem "dashboard" marcado como true em JSON.

create or replace function public.colaborador_pode_escrita(p_key text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return false; end if;
  if public.is_admin(uid) then return true; end if;
  return exists (
    select 1 from public.colaboradores c
    where c.auth_user_id = uid and c.ativo = true
      and coalesce((c.permissoes ->> p_key)::boolean, false)
  );
end;
$$;

revoke all on function public.colaborador_pode_escrita(text) from public;
grant execute on function public.colaborador_pode_escrita(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Contexto RPC para o SPA (papéis + flags de rota)

create or replace function public.meu_staff_context()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  r jsonb;
begin
  if uid is null then
    return jsonb_build_object('role','none','perm', '{}'::jsonb, 'colab_id', null);
  end if;

  if public.is_admin(uid) then
    return jsonb_build_object(
      'role', 'super_admin',
      'perm', jsonb_build_object(
        'dashboard', true,'alunos', true,'checkins', true,'agendamentos', true,
        'professores', true,'receitas', true,'exercicios', true,'aulas', true,
        'recepcao', true,'configuracoes', true
      ),
      'colab_id', null,
      'perfil_nome', 'Administrador'
    );
  end if;

  select jsonb_build_object(
    'role', 'colaborador',
    'perm', coalesce(c.permissoes, '{}'::jsonb),
    'colab_id', c.id::text,
    'perfil_nome', c.nome
  ) into r
  from public.colaboradores c
  where c.auth_user_id = uid and c.ativo = true;

  return coalesce(r, jsonb_build_object('role','none','perm', '{}'::jsonb,'colab_id', null,'perfil_nome', null));
end;
$$;

revoke all on function public.meu_staff_context() from public;
grant execute on function public.meu_staff_context() to authenticated;

-- Registrar último acesso (SPA chama ao carregar sessão administrativa)

create or replace function public.colaboradores_registrar_acesso()
returns void
language sql
security definer
set search_path = public
as $$
  update public.colaboradores
  set ultimo_acesso_em = now(),
      updated_at = now()
  where auth_user_id = auth.uid()
    and ativo = true;
$$;

revoke all on function public.colaboradores_registrar_acesso() from public;
grant execute on function public.colaboradores_registrar_acesso() to authenticated;

-- ---------------------------------------------------------------------------
grant execute on function public.is_admin(uuid) to service_role;

-- Fluxo login: admin (canônico) > colaborador > professor > aluno

create or replace function public.resolve_user_app_area()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  uemail text;
begin
  if uid is null then return 'none'; end if;

  select email into uemail from auth.users where id = uid;

  if uemail is not null
     and lower(trim(uemail)) = 'admin@luteacademy.com.br'
     and exists (
       select 1 from public.admins a
       where a.ativo and a.auth_user_id = uid
     ) then
    return 'admin';
  end if;

  if exists (
    select 1 from public.colaboradores c
    where c.ativo and c.auth_user_id = uid
  ) then
    return 'colaborador';
  end if;

  if exists (
    select 1 from public.professores p
    where p.ativo and (
      p.auth_user_id = uid::text
      or (
        uemail is not null
        and lower(trim(p.email)) = lower(trim(uemail))
      )
    )
  ) then
    return 'professor';
  end if;

  if exists (
    select 1 from public.alunos al
    where al.auth_user_id = uid::text
    or (
      uemail is not null
      and lower(trim(al.email)) = lower(trim(uemail))
    )
  ) then
    return 'aluno';
  end if;

  return 'none';
end;
$$;

-- Visitas guiadas helpers

create or replace function public.visitas_guiadas_marcar_lembrete(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.is_admin(auth.uid()) or public.staff_has_perm('agendamentos')) then
    raise exception 'Acesso negado.';
  end if;

  update public.visitas_guiadas
  set lembrete_enviado_em = coalesce(lembrete_enviado_em, now())
  where id = p_id;

  return found;
end;
$$;

drop policy if exists "visitas_guiadas_admin_all" on public.visitas_guiadas;
create policy "visitas_guiadas_admin_all"
on public.visitas_guiadas
for all
to authenticated
using (public.is_admin(auth.uid()) or public.staff_has_perm('agendamentos'))
with check (public.is_admin(auth.uid()) or public.staff_has_perm('agendamentos'));

-- ---------------------------------------------------------------------------
-- admins: apenas super-admin

drop policy if exists "admin_all_admins" on public.admins;
drop policy if exists admins_super_select on public.admins;
drop policy if exists admins_super_all on public.admins;
drop policy if exists admins_super_manage on public.admins;

create policy admins_super_manage on public.admins for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

grant select on public.admins to authenticated;

-- ---------------------------------------------------------------------------
-- alunos — leitura ampliada com dashboard OU alunos; escrita apenas alunos; delete só super

drop policy if exists "admin_all_alunos" on public.alunos;
drop policy if exists alunos_own_select on public.alunos;
drop policy if exists alunos_staff_select on public.alunos;
drop policy if exists alunos_staff_insert on public.alunos;
drop policy if exists alunos_staff_update on public.alunos;
drop policy if exists alunos_super_delete on public.alunos;

create policy alunos_own_select on public.alunos for select to authenticated
  using (
    auth_user_id = auth.uid()::text
    or lower(trim(email)) in (
      select lower(trim(u.email)) from auth.users u where u.id = auth.uid()
    )
  );

create policy alunos_staff_select on public.alunos for select to authenticated
  using (
    public.is_admin(auth.uid())
    or public.staff_has_perm('alunos')
    or public.staff_has_perm('dashboard')
  );

create policy alunos_staff_insert on public.alunos for insert to authenticated
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('alunos')
  );

create policy alunos_staff_update on public.alunos for update to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('alunos')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('alunos')
  );

create policy alunos_super_delete on public.alunos for delete to authenticated
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- checkins — leitura com dashboard OU checkins; escrita com checkins; delete só super
drop policy if exists "admin_all_checkins" on public.checkins;

create policy checkins_staff_select on public.checkins for select to authenticated
  using (
    public.is_admin(auth.uid())
    or public.staff_has_perm('checkins')
    or public.staff_has_perm('dashboard')
  );

create policy checkins_staff_write on public.checkins for insert to authenticated
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('checkins')
  );

create policy checkins_staff_update on public.checkins for update to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('checkins')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('checkins')
  );

create policy checkins_super_delete on public.checkins for delete to authenticated
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- avaliacoes — apenas super (formulários clínicos; colaboradores sem acesso)
drop policy if exists "admin_all_avaliacoes" on public.avaliacoes;

create policy aval_super_all on public.avaliacoes for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

grant select on public.avaliacoes to authenticated;

-- ---------------------------------------------------------------------------
-- pagamentos — apenas super-admin (financeiro completo)

drop policy if exists "admin_all_pagamentos" on public.pagamentos;

create policy pagamentos_super_only on public.pagamentos for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- planos (mensalidades) — super ou colaboradores com configuracões

drop policy if exists "admin_all_planos" on public.planos;

create policy planos_staff_select on public.planos for select to authenticated
  using (
    public.is_admin(auth.uid()) or public.staff_has_perm('configuracoes')
  );

create policy planos_staff_write_ins on public.planos for insert to authenticated
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('configuracoes')
  );

create policy planos_staff_write_upd on public.planos for update to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('configuracoes')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('configuracoes')
  );

create policy planos_super_delete on public.planos for delete to authenticated
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Colaboradores: super CRUD completo; colaboradores só SELECT próprio registro

alter table public.colaboradores enable row level security;

grant select, insert, update, delete on public.colaboradores to authenticated;

drop policy if exists colaboradores_super on public.colaboradores;
drop policy if exists colaboradores_self_read on public.colaboradores;

create policy colaboradores_super_all on public.colaboradores for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy colaboradores_self_select on public.colaboradores for select to authenticated
  using (auth_user_id = auth.uid());

-- EXPANSÃO: professores_admin / exercicios / etc.

drop policy if exists professores_admin on public.professores;
drop policy if exists professores_staff_mod on public.professores;
drop policy if exists professores_staff_ins on public.professores;
drop policy if exists professores_staff_upd on public.professores;
drop policy if exists professores_super_delete on public.professores;
drop policy if exists professores_self_update on public.professores;

create policy professores_staff_ins on public.professores for insert to authenticated
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('professores')
  );

create policy professores_staff_upd on public.professores for update to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('professores')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('professores')
  );

create policy professores_super_delete on public.professores for delete to authenticated
  using (public.is_admin(auth.uid()));

create policy professores_self_update on public.professores for update to authenticated
  using (auth_user_id = auth.uid()::text)
  with check (auth_user_id = auth.uid()::text);

drop policy if exists receitas_admin on public.receitas;
drop policy if exists receitas_staff_write on public.receitas;
drop policy if exists receitas_staff_ins on public.receitas;
drop policy if exists receitas_staff_upd on public.receitas;
drop policy if exists receitas_super_delete on public.receitas;

create policy receitas_staff_ins on public.receitas for insert to authenticated
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('receitas')
  );

create policy receitas_staff_upd on public.receitas for update to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('receitas')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('receitas')
  );

create policy receitas_super_delete on public.receitas for delete to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists exercicios_admin on public.exercicios;
drop policy if exists exercicios_staff_write on public.exercicios;
drop policy if exists exercicios_staff_ins on public.exercicios;
drop policy if exists exercicios_staff_upd on public.exercicios;
drop policy if exists exercicios_super_delete on public.exercicios;

create policy exercicios_staff_ins on public.exercicios for insert to authenticated
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('exercicios')
  );

create policy exercicios_staff_upd on public.exercicios for update to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('exercicios')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('exercicios')
  );

create policy exercicios_super_delete on public.exercicios for delete to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists pt_admin on public.planos_treino;
create policy pt_staff on public.planos_treino for all to authenticated
  using (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('alunos')
  )
  with check (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('alunos')
  );

drop policy if exists pt_prof on public.planos_treino;
create policy pt_prof on public.planos_treino
  for all to authenticated
  using (
    professor_id = public.meu_professor_id()
    or public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('alunos')
  )
  with check (
    professor_id = public.meu_professor_id()
    or public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('alunos')
  );

drop policy if exists ptd_all on public.planos_treino_dias;
create policy ptd_all on public.planos_treino_dias
  for all to authenticated
  using (
    exists (select 1 from planos_treino pt where pt.id = planos_treino_dias.plano_id and (
      public.is_admin(auth.uid())
      or public.colaborador_pode_escrita('alunos')
      or pt.professor_id = public.meu_professor_id()
      or pt.aluno_id = public.meu_aluno_id()
    ))
  )
  with check (
    exists (select 1 from planos_treino pt where pt.id = planos_treino_dias.plano_id and (
      public.is_admin(auth.uid())
      or public.colaborador_pode_escrita('alunos')
      or pt.professor_id = public.meu_professor_id()
    ))
  );

drop policy if exists pte_all on public.planos_treino_exercicios;
create policy pte_all on public.planos_treino_exercicios
  for all to authenticated
  using (
    exists (
      select 1 from planos_treino_dias d join planos_treino pt on pt.id = d.plano_id
      where d.id = planos_treino_exercicios.plano_dia_id and (
        public.is_admin(auth.uid())
        or public.colaborador_pode_escrita('alunos')
        or pt.professor_id = public.meu_professor_id()
        or pt.aluno_id = public.meu_aluno_id()
      )
    )
  )
  with check (
    exists (
      select 1 from planos_treino_dias d join planos_treino pt on pt.id = d.plano_id
      where d.id = planos_treino_exercicios.plano_dia_id and (
        public.is_admin(auth.uid())
        or public.colaborador_pode_escrita('alunos')
        or pt.professor_id = public.meu_professor_id()
      )
    )
  );

drop policy if exists ts_admin on public.treino_sessoes;
create policy ts_admin on public.treino_sessoes for all to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('alunos')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('alunos')
  );

drop policy if exists tsi_admin on public.treino_sessao_itens;
create policy tsi_admin on public.treino_sessao_itens for all to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('alunos')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('alunos')
  );

drop policy if exists ps_admin on public.personal_sessoes;
create policy ps_admin on public.personal_sessoes for all to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('professores')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('professores')
  );

drop policy if exists av_admin on public.avaliacoes_agenda;
create policy av_admin on public.avaliacoes_agenda for all to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('professores')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('professores')
  );

drop policy if exists av_part on public.avaliacoes_agenda;
create policy av_part on public.avaliacoes_agenda
  for all to authenticated
  using (
    exists (select 1 from alunos a where a.id = avaliacoes_agenda.aluno_id and a.id = public.meu_aluno_id())
    or professor_id = public.meu_professor_id()
  )
  with check (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('professores')
    or professor_id = public.meu_professor_id()
    or exists (select 1 from alunos a where a.id = avaliacoes_agenda.aluno_id and a.id = public.meu_aluno_id())
  );

drop policy if exists ar_admin on public.aulas_recorrentes;
create policy ar_admin on public.aulas_recorrentes for all to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('aulas')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('aulas')
  );

drop policy if exists ai_own on public.aula_inscricoes;
create policy ai_own on public.aula_inscricoes
  for all to authenticated
  using (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('aulas')
    or aluno_id = public.meu_aluno_id()
  )
  with check (
    public.is_admin(auth.uid())
    or public.colaborador_pode_escrita('aulas')
    or aluno_id = public.meu_aluno_id()
  );

-- Modo recepção: mesmo que check-ins + QR

-- Não há tabela dedicada — reuse checkins permissões

notify pgrst, 'reload schema';

commit;
