-- STAGING CUTOVER STEP 2 — run only after:
-- (1) server-only RPCs from 20261104140000 are installed,
-- (2) all three Edge Functions are deployed and verified,
-- (3) the new browser application is deployed and verified against those functions.
--
-- This migration intentionally removes direct browser execution of the legacy
-- SECURITY DEFINER RPCs. Do not apply before the coordinated application cutover.

revoke all on function public.delete_investigation_bundle(text) from public, anon, authenticated;
revoke all on function public.activate_premium_7d(uuid) from public, anon, authenticated;
revoke all on function public.reject_registration(uuid, text) from public, anon, authenticated;

-- Defense in depth: ensure the new RPC entry points remain service_role-only.
revoke all on function public.edge_delete_investigation_bundle(uuid, text) from public, anon, authenticated;
revoke all on function public.edge_activate_premium_7d(uuid, uuid) from public, anon, authenticated;
revoke all on function public.edge_reject_registration(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.edge_delete_investigation_bundle(uuid, text) to service_role;
grant execute on function public.edge_activate_premium_7d(uuid, uuid) to service_role;
grant execute on function public.edge_reject_registration(uuid, uuid, text) to service_role;
