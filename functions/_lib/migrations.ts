export interface Env {
  DB: D1Database;
}

export async function ensureMigrations(env: Env): Promise<void> {
  try {
    // Check if migrations table exists
    const migrationsTable = await env.DB.prepare(`
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

      // Create sessions table
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS sessions (
          session_id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          expires_at INTEGER NOT NULL
        )
      `).run();

      // Create indexes
      try {
        await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`).run();
        await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub)`).run();
        await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`).run();
        await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`).run();
      } catch (e) {
        console.log('Some indexes may already exist');
      }

      // Mark migration as completed
      await env.DB.prepare(`
        INSERT INTO migrations (name, executed_at) VALUES ('add_google_oauth_columns', ?)
      `).bind(Date.now()).run();

      console.log('Migration add_google_oauth_columns completed successfully');
    }

  } catch (error) {
    console.error('Migration error:', error);
    // Don't throw - let the function continue even if migration fails
  }
}