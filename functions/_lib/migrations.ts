export interface Env { DB: D1Database }

export async function ensureMigrations(env: Env): Promise<void> {
  // Create base tables if they do not exist
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      pass_hash TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      email_verified INTEGER NOT NULL DEFAULT 0,
      username TEXT,
      google_sub TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  `);

  // Ensure google_sub column exists (older schemas may miss it)
  const googleSub = await env.DB
    .prepare(`SELECT name FROM pragma_table_info('users') WHERE name = 'google_sub'`)
    .first<{ name: string }>();
  if (!googleSub?.name) {
    try {
      await env.DB.prepare(`ALTER TABLE users ADD COLUMN google_sub TEXT`).run();
    } catch {
      // Ignore if not supported or already exists
    }
  }

  // Unique index for google_sub when present
  try {
    await env.DB.exec(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub) WHERE google_sub IS NOT NULL;`
    );
  } catch {
    // Ignore if already exists
  }
}