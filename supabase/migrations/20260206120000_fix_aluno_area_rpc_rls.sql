-- Histórico: esta migração foi aplicada ao projeto remoto via MCP apply_migration
-- como "seed_auth_user_lu_aluno". Conteúdo abaixo reflete exatamente o que foi
-- executado no banco remoto.
--
-- O que faz:
--   1. Cria o usuário Auth para lu.t@teste.com / lu1234 (aluna Lucineia Tenorio)
--      se ainda não existir.
--   2. Vincula public.alunos.auth_user_id ao UUID do novo usuário Auth.

do $$
declare
  v_user_id uuid;
  v_aluno_id uuid := '587442c4-abeb-498f-b718-21af107caa55';
begin
  select id into v_user_id
  from auth.users
  where lower(trim(email)) = 'lu.t@teste.com'
  limit 1;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'lu.t@teste.com',
      crypt('lu1234', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nome":"Lucineia Tenorio"}'::jsonb,
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (
      id, provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      v_user_id::text,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'lu.t@teste.com', 'email_verified', true),
      'email',
      now(), now(), now()
    );
  end if;

  -- Vincula o aluno ao auth user
  update public.alunos
  set auth_user_id = v_user_id
  where id = v_aluno_id;
end;
$$;
