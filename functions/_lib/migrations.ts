export interface Env {
	DB: D1Database;
}

interface Migration {
	version: string;
	statements: string[];
}

const migrations: Migration[] = [
	{
		version: '2024-08-15_auth_v1',
		statements: [
			`CREATE TABLE IF NOT EXISTS users (
				id TEXT PRIMARY KEY,
				email TEXT NOT NULL UNIQUE,
				pass_hash TEXT NOT NULL,
				username TEXT,
				created_at INTEGER NOT NULL,
				email_verified INTEGER DEFAULT 0
			)` ,
			`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)`
		]
	},
	{
		version: '2024-08-16_auth_v2_sessions',
		statements: [
			`CREATE TABLE IF NOT EXISTS sessions (
				session_id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL,
				created_at INTEGER NOT NULL,
				expires_at INTEGER NOT NULL,
				FOREIGN KEY(user_id) REFERENCES users(id)
			)`
		]
	},
	{
		version: '2024-08-22_auth_v3_google',
		statements: [
			`ALTER TABLE users ADD COLUMN google_sub TEXT`,
			`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub)
			   WHERE google_sub IS NOT NULL`
		]
	},
];

async function getAppliedVersions(env: Env): Promise<Set<string>> {
	await env.DB.prepare(`CREATE TABLE IF NOT EXISTS _migrations (version TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)`).run();
	const rows = await env.DB.prepare(`SELECT version FROM _migrations`).all<{ version: string }>();
	const set = new Set<string>();
	for (const row of rows.results || []) set.add(row.version);
	return set;
}

export async function ensureMigrations(env: Env): Promise<void> {
	const applied = await getAppliedVersions(env);
	for (const m of migrations) {
		if (applied.has(m.version)) continue;
		const tx = await env.DB.batch(m.statements.map((sql) => env.DB.prepare(sql)));
		await env.DB.prepare(`INSERT INTO _migrations(version, applied_at) VALUES (?, ?)`)
			.bind(m.version, Date.now())
			.run();
	}
}