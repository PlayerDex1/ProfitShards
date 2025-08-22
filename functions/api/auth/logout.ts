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

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
	await ensureMigrations(env);
	const cookies = parseCookies(request);
	const sessionId = cookies['ps_session'];
	if (sessionId) {
		await (env as any).DB.prepare(`DELETE FROM sessions WHERE session_id = ?`).bind(sessionId).run();
	}
	const headers = new Headers({ 'Content-Type': 'application/json' });
	// Clear cookie for apex and www
	const host = new URL(request.url).host;
	const apex = host.replace(/^www\./, '');
	const cookieDomain = `.${apex}`;
	headers.append('Set-Cookie', `ps_session=; Path=/; Domain=${cookieDomain}; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
	return new Response(JSON.stringify({ ok: true }), { headers });
}