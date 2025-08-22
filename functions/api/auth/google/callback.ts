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

async function exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
  const body = new URLSearchParams({
    code, 
    client_id: clientId, 
    client_secret: clientSecret, 
    redirect_uri: redirectUri, 
    grant_type: 'authorization_code'
  });
  
  const res = await fetch('https://oauth2.googleapis.com/token', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, 
    body 
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
  await ensureMigrations(env);
  
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return new Response('Missing Google credentials', { status: 500 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  try {
    const token = await exchangeCodeForToken(code, clientId, clientSecret, buildRedirectUri(request));
    const profile = await fetchUserInfo(token.access_token);

    const now = Date.now();
    
    // Check if user exists by Google sub
    const bySub = await env.DB.prepare(`SELECT id FROM users WHERE google_sub = ?`).bind(profile.sub).first<{ id: string }>();
    let userId = bySub?.id;
    
    if (!userId) {
      // Check if user exists by email
      const byEmail = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(profile.email.toLowerCase()).first<{ id: string }>();
      
      if (byEmail?.id) {
        userId = byEmail.id;
        // Link existing account to Google
        await env.DB.prepare(`UPDATE users SET google_sub = ?, email_verified = 1 WHERE id = ?`).bind(profile.sub, userId).run();
      } else {
        // Create new user
        userId = crypto.randomUUID();
        const username = (profile.name || profile.email.split('@')[0]).slice(0, 30);
        
        await env.DB.prepare(
          `INSERT INTO users(id, email, pass_hash, created_at, email_verified, username, google_sub)
           VALUES (?, ?, '', ?, 1, ?, ?)`
        ).bind(userId, profile.email.toLowerCase(), now, username, profile.sub).run();
      }
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const expires = now + 1000 * 60 * 60 * 24 * 7; // 7 days
    
    await env.DB.prepare(
      `INSERT INTO sessions(session_id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`
    ).bind(sessionId, userId, now, expires).run();

    // Set session cookie
    const headers = new Headers({ 'Content-Type': 'text/html' });
    const host = new URL(request.url).host;
    const apex = host.replace(/^www\./, '');
    const cookieDomain = `.${apex}`;
    
    headers.append('Set-Cookie', `ps_session=${sessionId}; Path=/; Domain=${cookieDomain}; HttpOnly; Secure; SameSite=Lax; Max-Age=${60*60*24*7}`);
    headers.append('Location', '/');
    
    return new Response(
      '<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>', 
      { status: 302, headers }
    );
  } catch (error) {
    console.error('Google OAuth error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
}
