// STAGING-ONLY Cloudflare Pages Advanced Mode worker.
// This preview branch must never fall back to the production backend-config.js.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/backend-config.js') {
      const projectUrl = String(env.GORUT_SUPABASE_URL || '').trim();
      const publishableKey = String(env.GORUT_SUPABASE_PUBLISHABLE_KEY || '').trim();
      const environment = String(env.GORUT_ENVIRONMENT || '').trim().toLowerCase();

      const validStagingUrl = projectUrl === 'https://xeqdhwqylutntphlkmqe.supabase.co';
      const validPublishableKey = publishableKey.startsWith('sb_publishable_');

      // Fail closed if any preview-only variable is missing or points elsewhere.
      const enabled = environment === 'staging' && validStagingUrl && validPublishableKey;
      const config = enabled
        ? { provider: 'supabase', url: projectUrl, anonKey: publishableKey, enabled: true, publicSurveyEnabled: false }
        : { provider: 'supabase', url: '', anonKey: '', enabled: false, publicSurveyEnabled: false };

      return new Response('window.GORUT_BACKEND = ' + JSON.stringify(config) + ';', {
        status: 200,
        headers: {
          'content-type': 'application/javascript; charset=utf-8',
          'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
          'pragma': 'no-cache',
          'x-content-type-options': 'nosniff'
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
