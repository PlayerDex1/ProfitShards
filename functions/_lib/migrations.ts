export interface Env {
  DB: D1Database;
}

export async function ensureMigrations(env: Env): Promise<void> {
  try {
    // Check if migrations table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        executed_at INTEGER NOT NULL
      )
    `).run();

    // Migration 001: Add Google OAuth columns
    const migration001 = await env.DB.prepare(`
      SELECT name FROM migrations WHERE name = 'add_google_oauth_columns'
    `).first();

    if (!migration001) {
      console.log('Running migration: add_google_oauth_columns');
      
      // Add columns to users table (ignore errors if columns already exist)
      try {
        await env.DB.prepare(`ALTER TABLE users ADD COLUMN google_sub TEXT`).run();
      } catch (e) {
        console.log('google_sub column may already exist');
      }

      try {
        await env.DB.prepare(`ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE`).run();
      } catch (e) {
        console.log('email_verified column may already exist');
      }

      try {
        await env.DB.prepare(`ALTER TABLE users ADD COLUMN created_at INTEGER`).run();
      } catch (e) {
        console.log('created_at column may already exist');
      }

      try {
        await env.DB.prepare(`ALTER TABLE users ADD COLUMN updated_at INTEGER`).run();
      } catch (e) {
        console.log('updated_at column may already exist');
      }

      try {
        await env.DB.prepare(`ALTER TABLE users ADD COLUMN last_login INTEGER`).run();
      } catch (e) {
        console.log('last_login column may already exist');
      }

      // Create sessions table
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS sessions (
          session_id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          expires_at INTEGER NOT NULL
        )
      `).run();

      // Mark migration as completed
      await env.DB.prepare(`
        INSERT INTO migrations (name, executed_at) VALUES ('add_google_oauth_columns', ?)
      `).bind(Date.now()).run();

      console.log('Migration add_google_oauth_columns completed successfully');
    }

    // Migration 002: Create user data tables
    const migration002 = await env.DB.prepare(`
      SELECT name FROM migrations WHERE name = 'create_user_data_tables'
    `).first();

    if (!migration002) {
      console.log('Running migration: create_user_data_tables');
      
      // User calculations/runs
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS user_calculations (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          calculation_type TEXT NOT NULL,
          calculation_data TEXT NOT NULL,
          result_data TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `).run();

      // User preferences
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          user_id TEXT PRIMARY KEY,
          theme TEXT DEFAULT 'system',
          language TEXT DEFAULT 'pt',
          currency TEXT DEFAULT 'USD',
          preferences_data TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `).run();

      // Equipment builds
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS user_equipment_builds (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          build_name TEXT NOT NULL,
          equipment_data TEXT NOT NULL,
          build_type TEXT,
          is_favorite BOOLEAN DEFAULT FALSE,
          created_at INTEGER NOT NULL,
          updated_at INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `).run();

      // Map drops history
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS user_map_drops (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          map_name TEXT NOT NULL,
          drop_data TEXT NOT NULL,
          tokens_earned INTEGER,
          time_spent INTEGER,
          efficiency_rating REAL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `).run();

      // User activity log
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS user_activity (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          activity_type TEXT NOT NULL,
          activity_data TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `).run();

      // Create all indexes
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`).run();
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub)`).run();
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login)`).run();
      
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`).run();
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`).run();
      
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON user_calculations(user_id)`).run();
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_calculations_type ON user_calculations(calculation_type)`).run();
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_calculations_created ON user_calculations(created_at)`).run();
      
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON user_equipment_builds(user_id)`).run();
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_equipment_favorite ON user_equipment_builds(is_favorite)`).run();
      
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_mapdrops_user_id ON user_map_drops(user_id)`).run();
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_mapdrops_map ON user_map_drops(map_name)`).run();
      
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_activity_user_id ON user_activity(user_id)`).run();
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity(activity_type)`).run();

      // Mark migration as completed
      await env.DB.prepare(`
        INSERT INTO migrations (name, executed_at) VALUES ('create_user_data_tables', ?)
      `).bind(Date.now()).run();

      console.log('Migration create_user_data_tables completed successfully');
    }

    // Migration 003: Fix cookie domain issue
    const migration003 = await env.DB.prepare(`
      SELECT name FROM migrations WHERE name = 'fix_cookie_domain'
    `).first();

    if (!migration003) {
      console.log('Running migration: fix_cookie_domain');
      
      // Delete duplicate sessions to clean up cookie issues
      await env.DB.prepare(`
        DELETE FROM sessions WHERE session_id IN (
          SELECT session_id FROM sessions 
          WHERE user_id IN (
            SELECT user_id FROM sessions 
            GROUP BY user_id 
            HAVING COUNT(*) > 1
          )
          AND session_id NOT IN (
            SELECT MAX(session_id) FROM sessions 
            GROUP BY user_id
          )
        )
      `).run();

      // Mark migration as completed
      await env.DB.prepare(`
        INSERT INTO migrations (name, executed_at) VALUES ('fix_cookie_domain', ?)
      `).bind(Date.now()).run();

      console.log('Migration fix_cookie_domain completed successfully');
    }

  } catch (error) {
    console.error('Migration error:', error);
    // Don't throw - let the function continue even if migration fails
  }
}