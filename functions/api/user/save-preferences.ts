export interface Env {
  DB: D1Database;
}

interface PreferencesData {
  theme?: 'light' | 'dark' | 'system';
  language?: 'pt' | 'en';
  currency?: string;
  data?: any;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    // Get user from session
    const cookie = request.headers.get('Cookie');
    if (!cookie) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionMatch = cookie.match(/ps_session=([^;]+)/);
    if (!sessionMatch) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionId = sessionMatch[1];

    // Verify session
    const session = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > ?'
    ).bind(sessionId, Date.now()).first();

    if (!session) {
      return Response.json({ error: 'Session expired' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json() as PreferencesData;
    const now = Date.now();

    // Check if preferences exist
    const existing = await env.DB.prepare(`
      SELECT user_id FROM user_preferences WHERE user_id = ?
    `).bind(session.user_id).first();

    if (existing) {
      // Update existing preferences
      await env.DB.prepare(`
        UPDATE user_preferences 
        SET theme = COALESCE(?, theme),
            language = COALESCE(?, language),
            currency = COALESCE(?, currency),
            preferences_data = COALESCE(?, preferences_data),
            updated_at = ?
        WHERE user_id = ?
      `).bind(
        body.theme || null,
        body.language || null,
        body.currency || null,
        body.data ? JSON.stringify(body.data) : null,
        now,
        session.user_id
      ).run();
    } else {
      // Create new preferences
      await env.DB.prepare(`
        INSERT INTO user_preferences (user_id, theme, language, currency, preferences_data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        session.user_id,
        body.theme || 'system',
        body.language || 'pt',
        body.currency || 'USD',
        body.data ? JSON.stringify(body.data) : null,
        now,
        now
      ).run();
    }

    // Log activity
    await env.DB.prepare(`
      INSERT INTO user_activity (id, user_id, activity_type, activity_data, created_at)
      VALUES (?, ?, 'preferences_updated', ?, ?)
    `).bind(
      crypto.randomUUID(),
      session.user_id,
      JSON.stringify(body),
      now
    ).run();

    console.log('Preferences saved for user:', session.user_id);

    return Response.json({ 
      success: true,
      message: 'Preferences saved successfully' 
    });

  } catch (error) {
    console.error('Save preferences error:', error);
    return Response.json({ 
      error: 'Failed to save preferences',
      details: error.message 
    }, { status: 500 });
  }
}