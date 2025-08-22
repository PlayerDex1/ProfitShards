import { ensureMigrations, type Env } from "../../_lib/migrations";

function parseCookies(request: Request): Record<string, string> {
	const cookie = request.headers.get('cookie') || '';
	const map: Record<string, string> = {};
	for (const part of cookie.split(/;\s*/)) {
		if (!part) continue;
		const idx = part.indexOf('=');
		if (idx === -1) continue;
		const k = part.slice(0, idx).trim();
		const v = decodeURIComponent(part.slice(idx + 1));
		map[k] = v;
	}
	return map;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
	await ensureMigrations(env);
	const cookies = parseCookies(request);
	const sessionId = cookies['ps_session'];
	if (!sessionId) return new Response(JSON.stringify({ user: null }), { headers: { 'Content-Type': 'application/json' } });

	const now = Date.now();
	const session = await (env as any).DB.prepare(
		`SELECT user_id, expires_at FROM sessions WHERE session_id = ?`
	).bind(sessionId).first<{ user_id: string; expires_at: number }>();
	if (!session || session.expires_at < now) {
		return new Response(JSON.stringify({ user: null }), { headers: { 'Content-Type': 'application/json' } });
	}
	const user = await (env as any).DB.prepare(
		`SELECT id, email FROM users WHERE id = ?`
	).bind(session.user_id).first<{ id: string; email: string }>();
	if (!user) {
		return new Response(JSON.stringify({ user: null }), { headers: { 'Content-Type': 'application/json' } });
	}
	return new Response(JSON.stringify({ user }), { headers: { 'Content-Type': 'application/json' } });
}