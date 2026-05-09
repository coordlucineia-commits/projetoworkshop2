-- LuTe Academy v2 · Perfis (Aluno / Professor / Admin) · Conteúdo · Treinos · Aulas · Sessões
-- Execute no Supabase após migrações anteriores. Requer extensions pgcrypto, public.is_admin.

begin;

-- ---------------------------------------------------------------------------
-- Professores / Personais
-- ---------------------------------------------------------------------------
create table if not exists public.professores (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text unique,
  ativo boolean not null default true,
  nome text not null,
  email text not null,
  telefone text,
  foto text,
  data_nascimento date,
  cpf text,
  rg text,
  endereco text,
  area_atuacao text not null default 'ambos'
    check (area_atuacao in ('professor','personal','ambos')),
  especialidades jsonb not null default '[]'::jsonb,
  horario_trabalho jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_professores_email on lower(public.professores(email));
create index if not exists idx_professores_auth on public.professores(auth_user_id);

-- Vínculos no aluno (FKs adicionadas após tabela existir)
alter table public.alunos
  add column if not exists professor_avaliacao_id uuid references public.professores(id) on delete set null;
alter table public.alunos
  add column if not exists professor_acompanhamento_id uuid references public.professores(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Biblioteca: receitas e exercícios
-- ---------------------------------------------------------------------------
create table if not exists public.receitas (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in ('perda_peso','ganho_massa')),
  refeicao text not null check (refeicao in (
    'cafe_manha','lanche_manha','almoco','lanche_tarde','jantar'
  )),
  nome text not null,
  imagem_url text not null,
  ingredientes text not null,
  modo_preparo text not null,
  calorias integer not null default 0,
  proteinas_g numeric(8,2) not null default 0,
  carboidratos_g numeric(8,2) not null default 0,
  gorduras_g numeric(8,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_receitas_cat_ref on public.receitas (categoria, refeicao);

create table if not exists public.exercicios (
  id uuid primary key default gen_random_uuid(),
  grupo_muscular text not null,
  nome text not null,
  equipamento text not null,
  imagem_url text not null,
  descricao_execucao text not null,
  dicas_seguranca text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_exercicios_grupo on public.exercicios (grupo_muscular);

-- ---------------------------------------------------------------------------
-- Planos de treino (cadastro professor)
-- ---------------------------------------------------------------------------
create table if not exists public.planos_treino (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  professor_id uuid not null references public.professores(id) on delete restrict,
  titulo text not null default 'Treino personalizado',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists planos_treino_um_ativo_por_aluno
  on public.planos_treino (aluno_id)
  where ativo;

create table if not exists public.planos_treino_dias (
  id uuid primary key default gen_random_uuid(),
  plano_id uuid not null references public.planos_treino(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 1 and 7),
  rotulo text not null,
  unique (plano_id, dia_semana)
);

create table if not exists public.planos_treino_exercicios (
  id uuid primary key default gen_random_uuid(),
  plano_dia_id uuid not null references public.planos_treino_dias(id) on delete cascade,
  exercicio_id uuid references public.exercicios(id) on delete set null,
  nome_exercicio text not null,
  series integer not null default 3,
  repeticoes text not null default '12',
  carga_sugerida text,
  observacoes text,
  ordem integer not null default 0
);

-- Sessão de execução do aluno (um registro por dia que finalizou ou está em andamento)
create table if not exists public.treino_sessoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  plano_dia_id uuid not null references public.planos_treino_dias(id) on delete cascade,
  data_ref date not null,
  iniciado_em timestamptz not null default now(),
  finalizado_em timestamptz,
  unique (aluno_id, plano_dia_id, data_ref)
);

create table if not exists public.treino_sessao_itens (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references public.treino_sessoes(id) on delete cascade,
  plano_exercicio_id uuid not null references public.planos_treino_exercicios(id) on delete cascade,
  realizado boolean not null default false,
  unique (sessao_id, plano_exercicio_id)
);

-- ---------------------------------------------------------------------------
-- Sessões personal (Plus / Elite) e avaliações (slots 15 min)
-- ---------------------------------------------------------------------------
create table if not exists public.personal_sessoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  professor_id uuid not null references public.professores(id) on delete restrict,
  inicio_at timestamptz not null,
  fim_at timestamptz not null,
  status text not null default 'agendado'
    check (status in ('agendado','realizado','cancelado')),
  created_at timestamptz not null default now()
);

create index if not exists idx_personal_sess_prof on public.personal_sessoes (professor_id, inicio_at);

create table if not exists public.avaliacoes_agenda (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  professor_id uuid references public.professores(id) on delete set null,
  inicio_at timestamptz not null,
  fim_at timestamptz not null,
  status text not null default 'agendado'
    check (status in ('agendado','realizado','cancelado')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Aulas recorrentes + inscrições por semana (segunda-feira como ref)
-- ---------------------------------------------------------------------------
create table if not exists public.aulas_recorrentes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  sala text not null check (sala in ('Sala A','Sala B')),
  dia_semana smallint not null check (dia_semana between 1 and 7),
  hora_inicio time not null,
  hora_fim time not null,
  professor_id uuid references public.professores(id) on delete set null,
  max_vagas integer not null default 20,
  cor text not null default '#00F9E4',
  created_at timestamptz not null default now()
);

create table if not exists public.aula_inscricoes (
  id uuid primary key default gen_random_uuid(),
  aula_recorrente_id uuid not null references public.aulas_recorrentes(id) on delete cascade,
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  semana_inicio date not null,
  status text not null default 'inscrito' check (status in ('inscrito','cancelado')),
  unique (aula_recorrente_id, aluno_id, semana_inicio)
);

-- ---------------------------------------------------------------------------
-- Função: área do app após login (admin > professor > aluno)
-- ---------------------------------------------------------------------------
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
  if uid is null then
    return 'none';
  end if;

  select email into uemail from auth.users where id = uid;

  if exists (
    select 1 from public.admins a
    where a.ativo and a.auth_user_id = uid::text
  ) then
    return 'admin';
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

revoke all on function public.resolve_user_app_area() from public;
grant execute on function public.resolve_user_app_area() to authenticated;

-- Helpers aluno atual
create or replace function public.meu_aluno_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select a.id from public.alunos a
  where a.auth_user_id = auth.uid()::text
    or lower(trim(a.email)) = lower(trim((select email from auth.users where id = auth.uid())))
  limit 1
$$;

revoke all on function public.meu_aluno_id() from public;
grant execute on function public.meu_aluno_id() to authenticated;

create or replace function public.meu_professor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id from public.professores p
  where p.ativo and (
    p.auth_user_id = auth.uid()::text
    or lower(trim(p.email)) = lower(trim((select email from auth.users where id = auth.uid())))
  )
  limit 1
$$;

revoke all on function public.meu_professor_id() from public;
grant execute on function public.meu_professor_id() to authenticated;

-- Toggle item treino / finalizar — RPC simplificação RLS aluno
create or replace function public.aluno_toggle_treino_item(p_sessao uuid, p_plano_item uuid, p_feito boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  aid uuid;
begin
  select public.meu_aluno_id() into aid;
  if aid is null then raise exception 'Aluno não identificado.'; end if;
  if not exists (
    select 1 from public.treino_sessoes s
    where s.id = p_sessao and s.aluno_id = aid
  ) then
    raise exception 'Sessão inválida.';
  end if;
  insert into public.treino_sessao_itens (sessao_id, plano_exercicio_id, realizado)
  values (p_sessao, p_plano_item, p_feito)
  on conflict (sessao_id, plano_exercicio_id)
  do update set realizado = excluded.realizado;
end;
$$;

revoke all on function public.aluno_toggle_treino_item(uuid, uuid, boolean) from public;
grant execute on function public.aluno_toggle_treino_item(uuid, uuid, boolean) to authenticated;

create or replace function public.aluno_iniciar_ou_obter_sessao_treino(p_plano_dia uuid, p_data date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  aid uuid;
  pid uuid;
  sid uuid;
begin
  select public.meu_aluno_id() into aid;
  if aid is null then raise exception 'Aluno não identificado.'; end if;
  select pt.aluno_id into pid from public.planos_treino_dias d
    join public.planos_treino pt on pt.id = d.plano_id
    where d.id = p_plano_dia and pt.ativo;
  if pid is distinct from aid then raise exception 'Treino não pertence a você.'; end if;

  insert into public.treino_sessoes (aluno_id, plano_dia_id, data_ref)
  values (aid, p_plano_dia, p_data)
  on conflict (aluno_id, plano_dia_id, data_ref) do nothing;

  select s.id into sid from public.treino_sessoes s
  where s.aluno_id = aid and s.plano_dia_id = p_plano_dia and s.data_ref = p_data;
  return sid;
end;
$$;

revoke all on function public.aluno_iniciar_ou_obter_sessao_treino(uuid, date) from public;
grant execute on function public.aluno_iniciar_ou_obter_sessao_treino(uuid, date) to authenticated;

create or replace function public.aluno_finalizar_sessao_treino(p_sessao uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare aid uuid;
begin
  select public.meu_aluno_id() into aid;
  if aid is null then raise exception 'Aluno não identificado.'; end if;
  update public.treino_sessoes s
  set finalizado_em = now()
  where s.id = p_sessao and s.aluno_id = aid and s.finalizado_em is null;
  if not found then raise exception 'Não foi possível finalizar.'; end if;
end;
$$;

revoke all on function public.aluno_finalizar_sessao_treino(uuid) from public;
grant execute on function public.aluno_finalizar_sessao_treino(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.professores enable row level security;
alter table public.receitas enable row level security;
alter table public.exercicios enable row level security;
alter table public.planos_treino enable row level security;
alter table public.planos_treino_dias enable row level security;
alter table public.planos_treino_exercicios enable row level security;
alter table public.treino_sessoes enable row level security;
alter table public.treino_sessao_itens enable row level security;
alter table public.personal_sessoes enable row level security;
alter table public.avaliacoes_agenda enable row level security;
alter table public.aulas_recorrentes enable row level security;
alter table public.aula_inscricoes enable row level security;

-- Admin all (is_admin)
drop policy if exists professores_admin on public.professores;
create policy professores_admin on public.professores
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists receitas_admin on public.receitas;
create policy receitas_admin on public.receitas
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists receitas_leitura_membros on public.receitas;
create policy receitas_leitura_membros on public.receitas
  for select to authenticated using (true);

drop policy if exists exercicios_admin on public.exercicios;
create policy exercicios_admin on public.exercicios
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists exercicios_leitura_membros on public.exercicios;
create policy exercicios_leitura_membros on public.exercicios
  for select to authenticated using (true);

-- Professores: leitura pública mínima (perfil) — anon autenticado via RLS: permitir select para todos autenticados em colunas? 
-- Perfil público na rota /professores/:id — permitir SELECT id,nome,foto,especialidades para authenticated
drop policy if exists professores_perfil_leitura on public.professores;
create policy professores_perfil_leitura on public.professores
  for select to authenticated using (ativo = true);

drop policy if exists professores_perfil_publico_anon on public.professores;
create policy professores_perfil_publico_anon on public.professores
  for select to anon using (ativo = true);

-- Planos treino: admin full; professor dono; aluno dono (read)
drop policy if exists pt_admin on public.planos_treino;
create policy pt_admin on public.planos_treino
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists pt_prof on public.planos_treino;
create policy pt_prof on public.planos_treino
  for all to authenticated
  using (
    professor_id = public.meu_professor_id()
    or public.is_admin(auth.uid())
  )
  with check (
    professor_id = public.meu_professor_id()
    or public.is_admin(auth.uid())
  );

drop policy if exists pt_aluno_read on public.planos_treino;
create policy pt_aluno_read on public.planos_treino
  for select to authenticated
  using (aluno_id = public.meu_aluno_id());

-- Filhos dias/exercícios
drop policy if exists ptd_all on public.planos_treino_dias;
create policy ptd_all on public.planos_treino_dias
  for all to authenticated
  using (
    exists (select 1 from planos_treino pt where pt.id = planos_treino_dias.plano_id and (
      public.is_admin(auth.uid())
      or pt.professor_id = public.meu_professor_id()
      or pt.aluno_id = public.meu_aluno_id()
    ))
  )
  with check (
    exists (select 1 from planos_treino pt where pt.id = planos_treino_dias.plano_id and (
      public.is_admin(auth.uid())
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
        or pt.professor_id = public.meu_professor_id()
      )
    )
  );

-- treino_sessoes — aluno vê suas; professores veem seus alunos; admin tudo (simplificado: aluno + admin)
drop policy if exists ts_admin on public.treino_sessoes;
create policy ts_admin on public.treino_sessoes for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists ts_aluno on public.treino_sessoes;
create policy ts_aluno on public.treino_sessoes
  for all to authenticated using (aluno_id = public.meu_aluno_id())
  with check (aluno_id = public.meu_aluno_id());

drop policy if exists tsi_admin on public.treino_sessao_itens;
create policy tsi_admin on public.treino_sessao_itens for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists tsi_aluno on public.treino_sessao_itens;
create policy tsi_aluno on public.treino_sessao_itens
  for all to authenticated
  using (exists (
    select 1 from treino_sessoes s
    where s.id = treino_sessao_itens.sessao_id and s.aluno_id = public.meu_aluno_id()
  ))
  with check (exists (
    select 1 from treino_sessoes s
    where s.id = treino_sessao_itens.sessao_id and s.aluno_id = public.meu_aluno_id()
  ));

grant select on public.professores to anon;
revoke all on public.receitas from anon;
revoke all on public.exercicios from anon;
revoke all on public.planos_treino from anon;
revoke all on public.planos_treino_dias from anon;
revoke all on public.planos_treino_exercicios from anon;
revoke all on public.treino_sessoes from anon;
revoke all on public.treino_sessao_itens from anon;
revoke all on public.personal_sessoes from anon;
revoke all on public.avaliacoes_agenda from anon;
revoke all on public.aulas_recorrentes from anon;
revoke all on public.aula_inscricoes from anon;

grant select, insert, update, delete on public.professores to authenticated;
grant select, insert, update, delete on public.receitas to authenticated;
grant select, insert, update, delete on public.exercicios to authenticated;
grant select, insert, update, delete on public.planos_treino to authenticated;
grant select, insert, update, delete on public.planos_treino_dias to authenticated;
grant select, insert, update, delete on public.planos_treino_exercicios to authenticated;
grant select, insert, update, delete on public.treino_sessoes to authenticated;
grant select, insert, update, delete on public.treino_sessao_itens to authenticated;
grant select, insert, update, delete on public.personal_sessoes to authenticated;
grant select, insert, update, delete on public.avaliacoes_agenda to authenticated;
grant select, insert, update, delete on public.aulas_recorrentes to authenticated;
grant select, insert, update, delete on public.aula_inscricoes to authenticated;

-- Políticas adicionais essenciais
drop policy if exists ps_admin on public.personal_sessoes;
create policy ps_admin on public.personal_sessoes for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists ps_aluno on public.personal_sessoes;
create policy ps_aluno on public.personal_sessoes
  for select to authenticated using (aluno_id = public.meu_aluno_id());

drop policy if exists ps_aluno_ins on public.personal_sessoes;
create policy ps_aluno_ins on public.personal_sessoes
  for insert to authenticated
  with check (aluno_id = public.meu_aluno_id());

drop policy if exists ps_aluno_upd on public.personal_sessoes;
create policy ps_aluno_upd on public.personal_sessoes
  for update to authenticated
  using (aluno_id = public.meu_aluno_id())
  with check (aluno_id = public.meu_aluno_id());

drop policy if exists ps_prof on public.personal_sessoes;
create policy ps_prof on public.personal_sessoes
  for select to authenticated using (professor_id = public.meu_professor_id());

drop policy if exists ps_prof_upd on public.personal_sessoes;
create policy ps_prof_upd on public.personal_sessoes
  for update to authenticated
  using (professor_id = public.meu_professor_id())
  with check (professor_id = public.meu_professor_id());

drop policy if exists av_admin on public.avaliacoes_agenda;
create policy av_admin on public.avaliacoes_agenda for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists av_part on public.avaliacoes_agenda;
create policy av_part on public.avaliacoes_agenda
  for all to authenticated
  using (
    exists (select 1 from alunos a where a.id = avaliacoes_agenda.aluno_id and a.id = public.meu_aluno_id())
    or professor_id = public.meu_professor_id()
  )
  with check (
    public.is_admin(auth.uid())
    or professor_id = public.meu_professor_id()
    or exists (select 1 from alunos a where a.id = avaliacoes_agenda.aluno_id and a.id = public.meu_aluno_id())
  );

drop policy if exists ar_leitura on public.aulas_recorrentes;
create policy ar_leitura on public.aulas_recorrentes for select to authenticated using (true);
drop policy if exists ar_admin on public.aulas_recorrentes;
create policy ar_admin on public.aulas_recorrentes for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists ai_own on public.aula_inscricoes;
create policy ai_own on public.aula_inscricoes
  for all to authenticated
  using (
    public.is_admin(auth.uid())
    or aluno_id = public.meu_aluno_id()
  )
  with check (
    public.is_admin(auth.uid())
    or aluno_id = public.meu_aluno_id()
  );

notify pgrst, 'reload schema';

commit;
