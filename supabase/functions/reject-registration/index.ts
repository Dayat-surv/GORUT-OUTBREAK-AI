import { serveSecureAdminOperation } from "../_shared/secure-admin-operation.ts";

serveSecureAdminOperation({
  rpcName: "edge_reject_registration",
  adminOnly: true,
  validate: (body) => {
    const id = body.registration_id;
    const reason = body.reason;
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return "INVALID_REGISTRATION_ID";
    }
    if (typeof reason !== "string" || reason.trim().length > 1000) {
      return "INVALID_REASON";
    }
    return { p_registration_id: id, p_reason: reason.trim() };
  },
});
