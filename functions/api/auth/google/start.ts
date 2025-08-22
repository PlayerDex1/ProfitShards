import { ensureMigrations } from "../../../_lib/migrations";

export interface Env { DB: D1Database; GOOGLE_CLIENT_ID?: string }

// Gera a URL de callback no domínio atual (apex ou www)
function buildRedirectUri(req: Request) {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}/api/auth/google/callback`;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  await ensureMigrations(env as any);
  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) return new Response('Missing GOOGLE_CLIENT_ID', { status: 500 });

  const redirectUri = buildRedirectUri(request);
  const scope = encodeURIComponent('openid email profile');
  const state = crypto.randomUUID();
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${encodeURIComponent(state)}&prompt=consent`;
  return Response.redirect(authUrl, 302);
}
Criar o callback do Google (com auto-ajuste da coluna google_sub)
Caminho: functions/api/auth/google/callback.ts
Conteúdo:
import { ensureMigrations } from "../../../_lib/migrations";

export interface Env { DB: D1Database; GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string }

function buildRedirectUri(req: Request) {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}/api/auth/google/callback`;
}

async function exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
  const body = new URLSearchParams({
    code, client_id: clientId, client_secret: clientSecret,
    redirect_uri: redirectUri, grant_type: 'authorization_code'
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body
  });
  if (!res.ok) throw new Error('Token exchange failed');
  return res.json() as Promise<{ access_token: string }>;
}

async function fetchUserInfo(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error('Userinfo failed');
  return res.json() as Promise<{ sub: string; email: string; name?: string }>;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  await ensureMigrations(env as any);
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return new Response('Missing Google credentials', { status: 500 });

  // Garantir coluna google_sub mesmo sem migrar arquivo de migrações
  try { await (env as any).DB.prepare(`ALTER TABLE users ADD COLUMN google_sub TEXT`).run(); } catch {}
  try { await (env as any).DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub) WHERE google_sub IS NOT NULL`).run(); } catch {}

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response('Missing code', { status: 400 });

  const token = await exchangeCodeForToken(code, clientId, clientSecret, buildRedirectUri(request));
  const profile = await fetchUserInfo(token.access_token);

  const now = Date.now();
  // Tenta achar por google_sub
  const bySub = await (env as any).DB.prepare(`SELECT id FROM users WHERE google_sub = ?`).bind(profile.sub).first<{ id: string }>();
  let userId = bySub?.id;
  if (!userId) {
    // Tenta por e-mail
    const byEmail = await (env as any).DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(profile.email.toLowerCase()).first<{ id: string }>();
    if (byEmail?.id) {
      userId = byEmail.id;
      await (env as any).DB.prepare(`UPDATE users SET google_sub = ?, email_verified = 1 WHERE id = ?`).bind(profile.sub, userId).run();
    } else {
      userId = crypto.randomUUID();
      const username = (profile.name || profile.email.split('@')[0]).slice(0, 30);
      await (env as any).DB.prepare(
        `INSERT INTO users(id, email, pass_hash, created_at, email_verified, username, google_sub)
         VALUES (?, ?, '', ?, 1, ?, ?)`
      ).bind(userId, profile.email.toLowerCase(), now, username, profile.sub).run();
    }
  }

  const sessionId = crypto.randomUUID();
  const expires = now + 1000 * 60 * 60 * 24 * 7;
  await (env as any).DB.prepare(
    `INSERT INTO sessions(session_id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`
  ).bind(sessionId, userId, now, expires).run();

  const headers = new Headers({ 'Content-Type': 'text/html' });
  const host = new URL(request.url).host;
  const apex = host.replace(/^www\./, '');
  const cookieDomain = `.${apex}`;
  headers.append('Set-Cookie', `ps_session=${sessionId}; Path=/; Domain=${cookieDomain}; HttpOnly; Secure; SameSite=Lax; Max-Age=${60*60*24*7}`);
  headers.append('Location', '/');
  return new Response('<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>', { status: 302, headers });
}
