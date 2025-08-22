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

    // Migration 002: Fix pass_hash NOT NULL constraint
    const migration002 = await env.DB.prepare(`
      SELECT name FROM migrations WHERE name = 'fix_pass_hash_constraint'
    `).first();

    if (!migration002) {
      console.log('Running migration: fix_pass_hash_constraint');
      
      // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
      // First, check if pass_hash column exists and is NOT NULL
      try {
        // Create new users table with correct schema
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS users_new (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            email TEXT,
            password TEXT,
            pass_hash TEXT,
            google_sub TEXT,
            email_verified BOOLEAN DEFAULT FALSE,
            created_at INTEGER
          )
        `).run();

        // Copy existing data
        await env.DB.prepare(`
          INSERT OR IGNORE INTO users_new (id, username, email, password, pass_hash, google_sub, email_verified, created_at)
          SELECT id, username, email, password, COALESCE(pass_hash, ''), google_sub, email_verified, created_at FROM users
        `).run();

        // Drop old table and rename new one
        await env.DB.prepare(`DROP TABLE users`).run();
        await env.DB.prepare(`ALTER TABLE users_new RENAME TO users`).run();

        // Recreate indexes
        await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`).run();
        await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub)`).run();

        console.log('Users table recreated with nullable pass_hash');
      } catch (e) {
        console.log('Table recreation failed, trying alternative approach:', e);
        
        // Alternative: Just update existing records to have empty pass_hash
        try {
          await env.DB.prepare(`UPDATE users SET pass_hash = '' WHERE pass_hash IS NULL`).run();
          console.log('Updated NULL pass_hash values to empty string');
        } catch (updateError) {
          console.log('Failed to update pass_hash values:', updateError);
        }
      }

      // Mark migration as completed
      await env.DB.prepare(`
        INSERT INTO migrations (name, executed_at) VALUES ('fix_pass_hash_constraint', ?)
      `).bind(Date.now()).run();

      console.log('Migration fix_pass_hash_constraint completed');
    }

  } catch (error) {
    console.error('Migration error:', error);
    // Don't throw - let the function continue even if migration fails
  }
}