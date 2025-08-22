import { ensureMigrations } from "../../../_lib/migrations";

export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
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

  if (!res.ok) {
    throw new Error('Token exchange failed');
  }

  return res.json() as Promise<{ access_token: string }>;
}

async function fetchUserInfo(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    throw new Error('Userinfo failed');
  }

  return res.json() as Promise<{ sub: string; email: string; name?: string; picture?: string }>;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  try {
    // Run migrations automatically before processing
    await ensureMigrations(env);
    
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return new Response('Missing Google credentials', { status: 500 });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return new Response('Missing authorization code', { status: 400 });
    }

    const redirectUri = `${url.protocol}//${url.host}/api/auth/google/callback`;

    console.log('Starting OAuth callback for:', url.host);

    // Exchange code for token
    const token = await exchangeCodeForToken(code, clientId, clientSecret, redirectUri);
    console.log('Token exchange successful');
    
    // Get user info from Google
    const profile = await fetchUserInfo(token.access_token);
    console.log('User profile obtained:', profile.email);

    const now = Date.now();

    // Check if user exists by Google ID
    let user = await env.DB.prepare(`
      SELECT id, email, username FROM users WHERE google_sub = ?
    `).bind(profile.sub).first();

    let isNewUser = false;

    if (!user) {
      // Check if user exists by email
      const existingUser = await env.DB.prepare(`
        SELECT id, username FROM users WHERE email = ?
      `).bind(profile.email.toLowerCase()).first();

      if (existingUser) {
        console.log('Linking Google account to existing user:', existingUser.id);
        // Link Google account to existing user
        await env.DB.prepare(`
          UPDATE users SET google_sub = ?, email_verified = 1, updated_at = ?, created_at = COALESCE(created_at, ?) WHERE id = ?
        `).bind(profile.sub, now, now, existingUser.id).run();
        
        user = await env.DB.prepare(`
          SELECT id, email, username FROM users WHERE id = ?
        `).bind(existingUser.id).first();
      } else {
        console.log('Creating new user for:', profile.email);
        isNewUser = true;
        
        // Create new user
        const userId = crypto.randomUUID();
        const username = (profile.name || profile.email.split('@')[0]).substring(0, 50);
        
        await env.DB.prepare(`
          INSERT INTO users (id, email, username, google_sub, email_verified, created_at, updated_at, pass_hash)
          VALUES (?, ?, ?, ?, 1, ?, ?, '')
        `).bind(userId, profile.email.toLowerCase(), username, profile.sub, now, now).run();

        user = { id: userId, email: profile.email.toLowerCase(), username };
        
        // Create default preferences for new user
        await env.DB.prepare(`
          INSERT INTO user_preferences (user_id, theme, language, currency, created_at, updated_at)
          VALUES (?, 'system', 'pt', 'USD', ?, ?)
        `).bind(userId, now, now).run();
      }
    } else {
      // Update timestamp for existing Google user
      await env.DB.prepare(`
        UPDATE users SET updated_at = ? WHERE id = ?
      `).bind(now, user.id).run();
    }

    if (!user) {
      console.error('User creation/lookup failed');
      return new Response('User creation failed', { status: 500 });
    }

    console.log('User ready:', user.id, user.email);

    // Delete any existing sessions for this user to avoid duplicates
    await env.DB.prepare(`
      DELETE FROM sessions WHERE user_id = ?
    `).bind(user.id).run();

    // Create new session
    const sessionId = crypto.randomUUID();
    const expires = now + (7 * 24 * 60 * 60 * 1000); // 7 days

    await env.DB.prepare(`
      INSERT INTO sessions (session_id, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).bind(sessionId, user.id, now, expires).run();

    console.log('Session created:', sessionId);

    // Log login activity
    const userAgent = request.headers.get('User-Agent') || '';
    const ipAddress = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    
    await env.DB.prepare(`
      INSERT INTO user_activity (id, user_id, activity_type, activity_data, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      user.id,
      isNewUser ? 'user_registered' : 'user_login',
      JSON.stringify({ 
        method: 'google_oauth',
        email: profile.email,
        name: profile.name,
        isNewUser 
      }),
      ipAddress,
      userAgent,
      now
    ).run();

    // Set cookie with correct domain
    const hostname = url.hostname;
    let cookieDomain = '';
    
    // Configure cookie domain based on hostname
    if (hostname.includes('profitshards.online')) {
      cookieDomain = '; Domain=.profitshards.online';
    } else if (hostname.includes('pages.dev')) {
      cookieDomain = '; Domain=.pages.dev';
    }

    const cookieValue = `ps_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${cookieDomain}`;

    console.log('Setting cookie:', cookieValue);

    // Redirect with success message
    const headers = new Headers({
      'Location': '/?login=success',
      'Set-Cookie': cookieValue
    });

    return new Response(null, { status: 302, headers });

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return new Response(`Authentication failed: ${error.message}`, { status: 500 });
  }
}