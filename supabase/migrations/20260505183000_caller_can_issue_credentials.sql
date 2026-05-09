-- RPC para Edge Functions (service_role): validar se o usuário autenticado pelo JWT
-- pode criar credenciais Auth + enviar e-mail para novo professor ou aluno.

begin;

create or replace function public.caller_can_issue_credentials(p_uid uuid, p_perm text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_uid is null then false
    when public.is_admin(p_uid) then true
    else exists (
      select 1 from public.colaboradores c
      where c.auth_user_id = p_uid
        and c.ativo = true
        and coalesce((c.permissoes ->> p_perm)::boolean, false)
    )
  end;
$$;

comment on function public.caller_can_issue_credentials(uuid, text) is
  'Usado por Edge Function welcome-user-credentials com service_role; p_uid = JWT sub verificado.';

grant execute on function public.caller_can_issue_credentials(uuid, text) to service_role;

commit;
