-- LuTe Academy — Supabase RLS (admin-only)
--
-- Objetivo:
-- - Landing page pode ser pública (sem acessar tabelas via anon key)
-- - Dashboard: acesso às tabelas SOMENTE para admins (via auth + tabela public.admins)
--
-- Como usar:
-- - Cole este arquivo no SQL Editor do Supabase e execute.
-- - Depois teste com um usuário NÃO admin: deve falhar/retornar vazio em todas as tabelas.
-- - Teste com usuário admin: deve conseguir ler/escrever.

begin;

-- 1) Função para checar se usuário autenticado é admin ativo.
--    SECURITY DEFINER evita depender de policy na tabela admins só para esse check.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    inner join auth.users u on u.id = uid
    where a.ativo = true
      and a.auth_user_id = uid
      and lower(trim(u.email)) = 'admin@luteacademy.com.br'
  );
$$;

-- Permite que usuários autenticados chamem a função (RPC).
revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

-- 2) Garante que as tabelas expostas no schema public estejam com RLS habilitada.
alter table if exists public.admins enable row level security;
alter table if exists public.alunos enable row level security;
alter table if exists public.avaliacoes enable row level security;
alter table if exists public.checkins enable row level security;
alter table if exists public.pagamentos enable row level security;
alter table if exists public.planos enable row level security;

-- 3) Remove acesso direto via grants (defesa em profundidade).
--    (RLS ainda vale, mas isso evita permissões acidentais.)
revoke all on table public.admins from anon, authenticated;
revoke all on table public.alunos from anon, authenticated;
revoke all on table public.avaliacoes from anon, authenticated;
revoke all on table public.checkins from anon, authenticated;
revoke all on table public.pagamentos from anon, authenticated;
revoke all on table public.planos from anon, authenticated;

-- 4) Concede permissões de tabela para authenticated (necessário para PostgREST),
--    mas mantendo o filtro real via RLS (is_admin(auth.uid())).
grant select, insert, update, delete on table public.admins to authenticated;
grant select, insert, update, delete on table public.alunos to authenticated;
grant select, insert, update, delete on table public.avaliacoes to authenticated;
grant select, insert, update, delete on table public.checkins to authenticated;
grant select, insert, update, delete on table public.pagamentos to authenticated;
grant select, insert, update, delete on table public.planos to authenticated;

-- 5) Policies admin-only (ALL) para cada tabela.
--    Observação: UPDATE/DELETE também precisam de USING (visibilidade da linha),
--    e INSERT/UPDATE precisam de WITH CHECK (validação da escrita).

drop policy if exists "admin_all_admins" on public.admins;
create policy "admin_all_admins"
on public.admins
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "admin_all_alunos" on public.alunos;
create policy "admin_all_alunos"
on public.alunos
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "admin_all_avaliacoes" on public.avaliacoes;
create policy "admin_all_avaliacoes"
on public.avaliacoes
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "admin_all_checkins" on public.checkins;
create policy "admin_all_checkins"
on public.checkins
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "admin_all_pagamentos" on public.pagamentos;
create policy "admin_all_pagamentos"
on public.pagamentos
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "admin_all_planos" on public.planos;
create policy "admin_all_planos"
on public.planos
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

commit;

