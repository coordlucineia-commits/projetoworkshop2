-- Medidas como float8 (sem estouro de numeric estreito) + máx. uma linha por agenda_id.
-- O trigger legacy impedia ALTER em peso/altura; dropar antes e recriar após.

drop trigger if exists trg_calcular_imc on public.avaliacoes;

alter table public.avaliacoes
  alter column peso type double precision using peso::double precision,
  alter column altura type double precision using altura::double precision,
  alter column imc type double precision using imc::double precision,
  alter column percentual_gordura type double precision using percentual_gordura::double precision,
  alter column massa_magra type double precision using massa_magra::double precision;

-- Altura gravada em cm (mesma convenção que o front: peso kg / (m)^2 ).
create or replace function public.calcular_imc()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if new.peso is not null and new.altura is not null and new.altura > 0 then
    new.imc := round((new.peso / power(new.altura / 100.0, 2))::numeric, 2)::double precision;
  else
    new.imc := null;
  end if;
  return new;
end;
$function$;

create trigger trg_calcular_imc
before insert or update of peso, altura on public.avaliacoes
for each row execute function public.calcular_imc();

with ranked as (
  select
    id,
    row_number() over (
      partition by agenda_id
      order by created_at desc nulls last, id desc
    ) as rn
  from public.avaliacoes
  where agenda_id is not null
)
delete from public.avaliacoes a
using ranked r
where a.id = r.id
  and r.rn > 1;

drop index if exists avaliacoes_agenda_id_unique_not_null;

create unique index avaliacoes_agenda_id_unique_not_null
  on public.avaliacoes (agenda_id)
  where agenda_id is not null;

notify pgrst, 'reload schema';
