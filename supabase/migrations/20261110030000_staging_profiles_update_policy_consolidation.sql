-- STAGING ONLY: consolidate equivalent permissive UPDATE policies on profiles.
-- Preserve the union of self-update and administrator-update access.
-- Column grants continue to prevent authenticated users from changing profiles.role.
begin;

drop policy if exists profiles_admin_update on public.profiles;
drop policy if exists profiles_self_update_basic on public.profiles;

create policy profiles_update_self_or_admin
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  or private.is_current_user_admin()
)
with check (
  id = (select auth.uid())
  or private.is_current_user_admin()
);

commit;
