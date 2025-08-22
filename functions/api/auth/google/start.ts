export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return new Response('Missing GOOGLE_CLIENT_ID', { status: 500 });
  }

  const url = new URL(request.url);
  const redirectUri = `${url.protocol}//${url.host}/api/auth/google/callback`;
  
  const scope = encodeURIComponent('openid email profile');
  const state = crypto.randomUUID();
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${encodeURIComponent(state)}&prompt=consent`;
  
  return Response.redirect(authUrl, 302);
}