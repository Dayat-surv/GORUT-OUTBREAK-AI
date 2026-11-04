import { withSupabase } from "npm:@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type, x-supabase-api-version, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type OperationConfig = {
  rpcName: string;
  adminOnly: boolean;
  validate: (body: Record<string, unknown>) => Record<string, unknown> | string;
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

export function serveSecureAdminOperation(config: OperationConfig): void {
  const authenticatedHandler = withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      const actorId = ctx.userClaims?.sub;
      if (typeof actorId !== "string" || !/^[0-9a-f-]{36}$/i.test(actorId)) {
        return json({ error: "AUTH_REQUIRED" }, 401);
      }

      let body: Record<string, unknown>;
      try {
        const parsed = await req.json();
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          return json({ error: "INVALID_BODY" }, 400);
        }
        body = parsed as Record<string, unknown>;
      } catch {
        return json({ error: "INVALID_JSON" }, 400);
      }

      const validated = config.validate(body);
      if (typeof validated === "string") {
        return json({ error: validated }, 400);
      }

      if (config.adminOnly) {
        const { data: profile, error: profileError } = await ctx.supabaseAdmin
          .from("profiles")
          .select("role")
          .eq("id", actorId)
          .maybeSingle();

        if (profileError) {
          return json({ error: "ADMIN_CHECK_FAILED" }, 503);
        }
        if (String(profile?.role ?? "").toLowerCase() !== "admin") {
          return json({ error: "ADMIN_ONLY" }, 403);
        }
      }

      const { data, error } = await ctx.supabaseAdmin.rpc(config.rpcName, {
        p_actor_id: actorId,
        ...validated,
      });

      if (error) {
        const message = String(error.message ?? "DATABASE_OPERATION_FAILED");
        const status = /NOT_AUTHORIZED|Hanya administrator/i.test(message)
          ? 403
          : /NOT_FOUND|tidak ditemukan/i.test(message)
          ? 404
          : /pending|terlalu panjang|AUTH_REQUIRED/i.test(message)
          ? 409
          : 500;
        return json({ error: message }, status);
      }

      return json({ success: true, data });
    },
  );

  Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    if (req.method !== "POST") {
      return json({ error: "METHOD_NOT_ALLOWED" }, 405);
    }
    try {
      return await authenticatedHandler(req);
    } catch {
      return json({ error: "AUTHENTICATION_FAILED" }, 401);
    }
  });
}
