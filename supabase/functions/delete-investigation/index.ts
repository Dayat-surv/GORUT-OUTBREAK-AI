import { serveProductionOperation } from "../_shared/production-operation.ts";
serveProductionOperation({
  rpcName: "edge_delete_investigation_bundle",
  adminOnly: false,
  validate: (body) => {
    const id = body.investigation_id;
    return typeof id === "string" && id.trim().length > 0 && id.length <= 200
      ? { p_investigation_id: id.trim() } : "INVALID_INVESTIGATION_ID";
  },
});
