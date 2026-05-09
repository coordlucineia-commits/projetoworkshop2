-- Login de teste aluno: lu.t@teste.com / lu1234
--
-- Opção A — Automático (recomendado): no projeto, defina SUPABASE_SERVICE_ROLE_KEY no .env
-- e rode: npm run seed:aluno-lu
--
-- Opção B — Manual no Dashboard:
--   1) Authentication → Users → Add user → e-mail lu.t@teste.com, senha lu1234,
--      marcar "Auto Confirm User" / confirmar e-mail conforme o projeto.
--   2) Garanta um registro em public.alunos com o mesmo e-mail (cadastro na recepção ou SQL abaixo).
--   3) Execute o UPDATE para preencher auth_user_id (opcional: resolve_user_app_area já reconhece aluno
--      só pelo e-mail igual ao auth.users, mas o vínculo explícito evita ambiguidade).

-- Vincula alunos.auth_user_id ao usuário Auth pelo e-mail
update public.alunos a
set auth_user_id = u.id::text
from auth.users u
where lower(trim(u.email)) = lower(trim('lu.t@teste.com'))
  and lower(trim(a.email)) = lower(trim('lu.t@teste.com'));

-- Se ainda não existir linha em alunos para esse e-mail, descomente e ajuste matricula/cpf se necessário:
/*
insert into public.alunos (
  nome,
  email,
  matricula,
  cpf,
  rg,
  pin,
  status_financeiro,
  status_matricula,
  anamnese,
  parq,
  parq_has_sim,
  medidas,
  auth_user_id
)
select
  'Lu Teste',
  'lu.t@teste.com',
  '#9001',
  '52998224725',
  '—',
  '9001',
  'EM_DIA',
  'ATIVO',
  '{}'::jsonb,
  '{}'::jsonb,
  false,
  '{}'::jsonb,
  u.id::text
from auth.users u
where lower(trim(u.email)) = lower(trim('lu.t@teste.com'))
  and not exists (
    select 1 from public.alunos x where lower(trim(x.email)) = lower(trim('lu.t@teste.com'))
  )
limit 1;
*/
