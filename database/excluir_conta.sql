-- Execute no SQL Editor do projeto Supabase (uma vez).
-- Permite que o usuario logado exclua a PROPRIA conta (LGPD, art. 18, VI).
-- O app chama: supabase.rpc("excluir_minha_conta")

create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    uid uuid := auth.uid();
begin
    if uid is null then
        raise exception 'nao autenticado';
    end if;

    delete from public.dados_financeiros where user_id = uid;
    delete from auth.users where id = uid;
end;
$$;

revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
