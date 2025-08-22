export interface Env { DB: D1Database }

interface Migration {
  version: string;
  statements: string[];
}

const migrations: Migration[] = [
  {
    version: '2024-01-01_initial',
    statements: [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        pass_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        email_verified INTEGER DEFAULT 0,
        username TEXT,
        google_sub TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub) WHERE google_sub IS NOT NULL`
    ],
  },
];

export async function ensureMigrations(env: Env): Promise<void> {
  const db = env.DB;
  
  // Create migrations table if it doesn't exist
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS migrations (
      version TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )
  `).run();

  // Get applied migrations
  const applied = await db.prepare('SELECT version FROM migrations').all<{ version: string }>();
  const appliedVersions = new Set(applied.results?.map(r => r.version) || []);

  // Apply pending migrations
  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      console.log(`Applying migration: ${migration.version}`);
      
      for (const statement of migration.statements) {
        await db.prepare(statement).run();
      }
      
      await db.prepare('INSERT INTO migrations (version, applied_at) VALUES (?, ?)')
        .bind(migration.version, Date.now())
        .run();
    }
  }
}