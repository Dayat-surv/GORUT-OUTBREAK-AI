// Copy this to backend-config.js and fill with your Supabase project values.
// NEVER use a service_role key in the browser. The browser uses the public anon/publishable key.
window.GORUT_BACKEND = {
  provider: 'supabase',
  url: 'https://lheuszdhprwmtajhdukc.supabase.co',
  anonKey: 'sb_publishable_123456',
  enabled: false,
  // Aktifkan hanya untuk pengujian formulir publik; tidak mengaktifkan backend aplikasi utama.
  publicSurveyEnabled: true
};
