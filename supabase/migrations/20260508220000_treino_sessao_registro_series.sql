-- Séries realizadas pelo aluno (reps × carga por linha); alimenta "último treino" nas sessões seguintes.

alter table public.treino_sessao_itens
  add column if not exists registro_series jsonb not null default '[]'::jsonb;

comment on column public.treino_sessao_itens.registro_series is
  'JSON array [{ "reps": number, "kg": number }, ...], uma entrada por série do plano.';

notify pgrst, 'reload schema';
