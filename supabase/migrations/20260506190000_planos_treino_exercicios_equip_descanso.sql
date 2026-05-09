-- Campos para fichas do professor: aparelho (cópia/ajuste da biblioteca) e descanso entre séries.
alter table public.planos_treino_exercicios
  add column if not exists equipamento text,
  add column if not exists tempo_descanso_segundos integer;

comment on column public.planos_treino_exercicios.equipamento is 'Aparelho/equipamento (snapshot ou texto livre).';
comment on column public.planos_treino_exercicios.tempo_descanso_segundos is 'Descanso entre séries, em segundos.';
