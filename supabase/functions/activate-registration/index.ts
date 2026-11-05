import { serveSecureAdminOperation } from "../_shared/secure-admin-operation.ts";

serveSecureAdminOperation({
  rpcName: "edge_activate_premium_7d",
  adminOnly: true,
  validate: (body) => {
    const id = body.registration_id;
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return "INVALID_REGISTRATION_ID";
    }
    return { p_registration_id: id };
  },
});
