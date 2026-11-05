import { serveSecureAdminOperation } from "../_shared/secure-admin-operation.ts";

serveSecureAdminOperation({
  rpcName: "edge_delete_investigation_bundle",
  adminOnly: false,
  validate: (body) => {
    const id = body.investigation_id;
    if (typeof id !== "string" || !id.trim() || id.length > 200) {
      return "INVALID_INVESTIGATION_ID";
    }
    return { p_investigation_id: id.trim() };
  },
});
