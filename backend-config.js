// STAGING ONLY — values from the separate GORUT-OUTBREAK-AI-STAGING project.
// Never use a production URL/key here and NEVER use service_role/secret keys.
// Keep both flags false until isolated staging schema and E2E checks are ready.
window.GORUT_BACKEND = {
  provider: 'supabase',
  // Use the project root URL, not the /rest/v1 endpoint. Supabase client adds API paths itself.
  url: 'https://xeqdhwqylutntphlkmqe.supabase.co',
  anonKey: 'sb_publishable_y2Sc8AOuQ0AqLDWMxRVlXA_0OIo1P54',
  enabled: true,
  publicSurveyEnabled: false
};
