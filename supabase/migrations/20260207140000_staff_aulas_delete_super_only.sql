begin;

drop policy if exists ar_admin on public.aulas_recorrentes;

create policy ar_ins on public.aulas_recorrentes for insert to authenticated
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('aulas')
  );

create policy ar_upd on public.aulas_recorrentes for update to authenticated
  using (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('aulas')
  )
  with check (
    public.is_admin(auth.uid()) or public.colaborador_pode_escrita('aulas')
  );

create policy ar_del_super on public.aulas_recorrentes for delete to authenticated
  using (public.is_admin(auth.uid()));

notify pgrst, 'reload schema';

commit;
