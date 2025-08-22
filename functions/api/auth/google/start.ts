import { ensureMigrations } from "../../../_lib/migrations";

export interface Env { 
  DB: D1Database; 
  GOOGLE_CLIENT_ID?: string; 
  GOOGLE_CLIENT_SECRET?: string 
}

function buildRedirectUri(req: Request) {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}/api/auth/google/callback`;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  await ensureMigrations(env);
  
  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return new Response('Missing GOOGLE_CLIENT_ID', { status: 500 });
  }

  const redirectUri = buildRedirectUri(request);
  const scope = encodeURIComponent('openid email profile');
  const state = crypto.randomUUID();
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${encodeURIComponent(state)}&prompt=consent`;
  
  return Response.redirect(authUrl, 302);
}
