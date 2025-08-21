export interface Env {
  DB: D1Database;
}

type Migration = {
  version: string;
  statements: string[];
};

// Define ordered migrations here
const migrations: Migration[] = [
  {
    version: '2024-08-21_init',
    statements: [
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         version TEXT PRIMARY KEY,
         applied_at INTEGER NOT NULL
       )`,
      `CREATE TABLE IF NOT EXISTS history_items (
         user TEXT NOT NULL,
         timestamp INTEGER NOT NULL,
         data TEXT NOT NULL,
         PRIMARY KEY (user, timestamp)
       )`,
      `CREATE TABLE IF NOT EXISTS map_drops (
         user TEXT NOT NULL,
         timestamp INTEGER NOT NULL,
         data TEXT NOT NULL,
         PRIMARY KEY (user, timestamp)
       )`,
    ],
  },
];

export async function ensureMigrations(env: Env): Promise<void> {
  if (!env || !env.DB) return;
  // Ensure schema_migrations exists first
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       version TEXT PRIMARY KEY,
       applied_at INTEGER NOT NULL
     )`
  ).run();

  // Load applied versions
  const appliedRows = await env.DB.prepare(`SELECT version FROM schema_migrations`).all<{ version: string }>();
  const applied = new Set((appliedRows.results || []).map(r => r.version));

  // Apply pending migrations in order
  for (const m of migrations) {
    if (applied.has(m.version)) continue;
    for (const stmt of m.statements) {
      await env.DB.prepare(stmt).run();
    }
    await env.DB.prepare(`INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)`)
      .bind(m.version, Date.now()).run();
  }
}

