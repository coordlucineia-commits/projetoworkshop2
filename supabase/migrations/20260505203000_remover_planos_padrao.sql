-- Remove os planos de assinatura padrão inseridos em 20260505120000_rls_transicao_authenticated.sql
-- e desassocia os alunos que ainda referenciem esses planos.

begin;

update public.alunos
set plano_id = null, updated_at = now()
where plano_id in (
  select id
  from public.planos
  where nome in (
    'Mensal Basic',
    'Mensal Plus',
    'Trimestral',
    'Anual'
  )
);

delete from public.planos
where nome in (
  'Mensal Basic',
  'Mensal Plus',
  'Trimestral',
  'Anual'
);

commit;
