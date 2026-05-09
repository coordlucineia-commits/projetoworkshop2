-- Seed: professor Ramon (login criado via script auth ou Dashboard + vínculo por e-mail).
-- resolve_user_app_area reconhece professor por e-mail igual ao auth.users ou por auth_user_id.

begin;

insert into public.professores (
  nome,
  email,
  ativo,
  area_atuacao,
  especialidades,
  horario_trabalho
)
select
  'Ramon',
  'ramon@luteacademy.com.br',
  true,
  'ambos',
  '[]'::jsonb,
  '{}'::jsonb
where not exists (
  select 1
  from public.professores p
  where lower(trim(p.email)) = lower(trim('ramon@luteacademy.com.br'))
);

commit;
