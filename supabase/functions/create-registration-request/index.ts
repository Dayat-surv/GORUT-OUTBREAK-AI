import { serveSecureAdminOperation } from "../_shared/secure-admin-operation.ts";

function optionalText(value: unknown, max: number): string {
  if (value == null) return "";
  if (typeof value !== "string" || value.length > max) return "\u0000";
  return value.trim();
}

serveSecureAdminOperation({
  rpcName: "edge_create_registration_request",
  adminOnly: false,
  validate: (body) => {
    const email = optionalText(body.email, 320).toLowerCase();
    const fullName = optionalText(body.full_name, 160);
    const whatsapp = optionalText(body.whatsapp, 40);
    const institution = optionalText(body.institution, 200);
    const paymentReference = optionalText(body.payment_reference, 200);
    const note = optionalText(body.note, 2000);
    if (email.includes("\u0000") || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) return "INVALID_EMAIL";
    if (fullName.includes("\u0000") || fullName.length < 2) return "INVALID_FULL_NAME";
    if ([whatsapp, institution, paymentReference, note].some((v) => v.includes("\u0000"))) return "INVALID_FIELD_LENGTH";
    return {
      p_email: email,
      p_full_name: fullName,
      p_whatsapp: whatsapp,
      p_institution: institution,
      p_payment_reference: paymentReference,
      p_note: note,
    };
  },
});
