-- Remove módulo ciclo menstrual (tabelas e função auxiliar). Idempotente.
-- A migration original de criação foi removida do repositório.
-- Esta migration limpa projetos onde as tabelas ainda existem no banco.

begin;

drop table if exists public.historico_menstruacao;
drop table if exists public.ciclo_menstrual;

drop function if exists public.ciclo_menstrual_set_updated_at();

notify pgrst, 'reload schema';

commit;
