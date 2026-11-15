import { serveProductionOperation } from "../_shared/production-operation.ts";
function optionalText(value: unknown, max: number): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || value.length > max) return "\u0000";
  return value.trim() || null;
}
serveProductionOperation({
  rpcName: "edge_create_registration_request",
  adminOnly: false,
  validate: (body) => {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
    const whatsapp = optionalText(body.whatsapp, 40);
    const institution = optionalText(body.institution, 200);
    const paymentReference = optionalText(body.payment_reference, 200);
    const note = optionalText(body.note, 2000);
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) return "INVALID_EMAIL";
    if (fullName.length < 2 || fullName.length > 160) return "INVALID_FULL_NAME";
    if ([whatsapp, institution, paymentReference, note].some(v => v === "\u0000")) return "INVALID_FIELD_LENGTH";
    return {
      p_email: email, p_full_name: fullName, p_whatsapp: whatsapp,
      p_institution: institution, p_payment_reference: paymentReference, p_note: note,
    };
  },
});
