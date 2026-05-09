-- Quando o horário do slot (inicio_at) muda (reagendamento/antecipação), alinha
-- `avaliacoes.data_avaliacao` à data civil em America/Sao_Paulo desse instante.
-- SECURITY DEFINER: alunos não têm UPDATE em `avaliacoes`; o sync não pode depender do cliente.

begin;

create or replace function public.trg_sync_avaliacao_data_para_inicio_agenda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'update'
     and new.inicio_at is distinct from old.inicio_at then
    update public.avaliacoes av
    set data_avaliacao = (timezone('America/Sao_Paulo', new.inicio_at))::date
    where av.agenda_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_avaliacao_data_on_agenda_inicio_change on public.avaliacoes_agenda;

create trigger sync_avaliacao_data_on_agenda_inicio_change
after update of inicio_at on public.avaliacoes_agenda
for each row
execute procedure public.trg_sync_avaliacao_data_para_inicio_agenda();

update public.avaliacoes av
set data_avaliacao = (timezone('America/Sao_Paulo', ag.inicio_at))::date
from public.avaliacoes_agenda ag
where av.agenda_id is not null
  and av.agenda_id = ag.id;

commit;
