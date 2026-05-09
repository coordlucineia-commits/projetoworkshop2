-- Liga cada registro em `avaliacoes` a um slot da agenda (`avaliacoes_agenda`), quando aplicável.

alter table public.avaliacoes
  add column if not exists agenda_id uuid references public.avaliacoes_agenda (id) on delete set null;

create index if not exists avaliacoes_agenda_id_idx on public.avaliacoes (agenda_id)
  where agenda_id is not null;

notify pgrst, 'reload schema';
