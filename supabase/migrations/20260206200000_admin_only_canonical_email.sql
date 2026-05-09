-- LuTe Academy — Somente admin@luteacademy.com.br acessa área administrativa.
-- is_admin e resolve_user_app_area passam a exigir o e-mail canônico em auth.users.

begin;

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

  if uemail is not null
     and lower(trim(uemail)) = 'admin@luteacademy.com.br'
     and exists (
       select 1 from public.admins a
       where a.ativo and a.auth_user_id = uid
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

commit;
