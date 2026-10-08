// Copy this to backend-config.js and fill with your Supabase project values.
// NEVER use a service_role key in the browser. The browser uses the public anon/publishable key.
window.GORUT_BACKEND = {
  provider: 'supabase',
  url: 'https://YOUR-PROJECT.supabase.co',
  anonKey: 'YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY',
  enabled: false
};