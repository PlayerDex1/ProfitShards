export interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
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

    const userId = session.user_id;

    // Get user calculations
    const calculations = await env.DB.prepare(`
      SELECT id, calculation_type, calculation_data, result_data, created_at, updated_at
      FROM user_calculations
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).bind(userId).all();

    // Get user preferences
    const preferences = await env.DB.prepare(`
      SELECT theme, language, currency, preferences_data, created_at, updated_at
      FROM user_preferences
      WHERE user_id = ?
    `).bind(userId).first();

    // Get equipment builds
    const equipmentBuilds = await env.DB.prepare(`
      SELECT id, build_name, equipment_data, build_type, is_favorite, created_at, updated_at
      FROM user_equipment_builds
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(userId).all();

    // Get map drops history
    const mapDrops = await env.DB.prepare(`
      SELECT id, map_name, drop_data, tokens_earned, time_spent, efficiency_rating, created_at
      FROM user_map_drops
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).bind(userId).all();

    // Get recent activity
    const activity = await env.DB.prepare(`
      SELECT activity_type, activity_data, created_at
      FROM user_activity
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(userId).all();

    const response = {
      success: true,
      data: {
        calculations: calculations.results.map(c => ({
          id: c.id,
          type: c.calculation_type,
          data: JSON.parse(c.calculation_data),
          results: c.result_data ? JSON.parse(c.result_data) : null,
          createdAt: c.created_at,
          updatedAt: c.updated_at
        })),
        preferences: preferences ? {
          theme: preferences.theme,
          language: preferences.language,
          currency: preferences.currency,
          data: preferences.preferences_data ? JSON.parse(preferences.preferences_data) : {},
          createdAt: preferences.created_at,
          updatedAt: preferences.updated_at
        } : null,
        equipmentBuilds: equipmentBuilds.results.map(e => ({
          id: e.id,
          name: e.build_name,
          data: JSON.parse(e.equipment_data),
          type: e.build_type,
          isFavorite: e.is_favorite,
          createdAt: e.created_at,
          updatedAt: e.updated_at
        })),
        mapDrops: mapDrops.results.map(m => ({
          id: m.id,
          mapName: m.map_name,
          data: JSON.parse(m.drop_data),
          tokensEarned: m.tokens_earned,
          timeSpent: m.time_spent,
          efficiency: m.efficiency_rating,
          createdAt: m.created_at
        })),
        activity: activity.results.map(a => ({
          type: a.activity_type,
          data: a.activity_data ? JSON.parse(a.activity_data) : null,
          createdAt: a.created_at
        }))
      }
    };

    console.log('User data retrieved for:', userId);

    return Response.json(response);

  } catch (error) {
    console.error('Get user data error:', error);
    return Response.json({ 
      error: 'Failed to retrieve user data',
      details: error.message 
    }, { status: 500 });
  }
}