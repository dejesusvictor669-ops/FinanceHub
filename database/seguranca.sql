-- Execute no SQL Editor do projeto Supabase.
alter table public.dados_financeiros enable row level security;

drop policy if exists "usuario ve seus dados" on public.dados_financeiros;
drop policy if exists "usuario ve so seus dados" on public.dados_financeiros;

revoke all on table public.dados_financeiros from anon;
grant select, insert, update, delete on table public.dados_financeiros to authenticated;

drop policy if exists "dados_financeiros_select_proprio" on public.dados_financeiros;
create policy "dados_financeiros_select_proprio"
    on public.dados_financeiros for select to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "dados_financeiros_insert_proprio" on public.dados_financeiros;
create policy "dados_financeiros_insert_proprio"
    on public.dados_financeiros for insert to authenticated
    with check ((select auth.uid()) = user_id);

drop policy if exists "dados_financeiros_update_proprio" on public.dados_financeiros;
create policy "dados_financeiros_update_proprio"
    on public.dados_financeiros for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

drop policy if exists "dados_financeiros_delete_proprio" on public.dados_financeiros;
create policy "dados_financeiros_delete_proprio"
    on public.dados_financeiros for delete to authenticated
    using ((select auth.uid()) = user_id);