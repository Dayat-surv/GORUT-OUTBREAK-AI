import { serveProductionOperation } from "../_shared/production-operation.ts";
serveProductionOperation({
  rpcName: "edge_activate_premium_7d",
  adminOnly: true,
  validate: (body) => {
    const id = body.registration_id;
    return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
      ? { p_registration_id: id } : "INVALID_REGISTRATION_ID";
  },
});
