import { ensureMigrations } from "../../_lib/migrations";

export interface Env { DB: D1Database }

type UserRow = { id: string; email: string }

type SessionRow = { user_id: string; expires_at: number }

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...(init || {}),
  });
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie") || "";
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v || "");
  }
  return null;
}

export async function onRequestGet({ env, request }: { env: Env; request: Request }) {
  await ensureMigrations(env as any);

  const sessionId = getCookie(request, "ps_session");
  if (!sessionId) return json({ user: null });

  const now = Date.now();
  const session = await (env as any).DB
    .prepare("SELECT user_id, expires_at FROM sessions WHERE session_id = ?")
    .bind(sessionId)
    .first<SessionRow>();

  if (!session) return json({ user: null });

  if (session.expires_at <= now) {
    await (env as any).DB.prepare("DELETE FROM sessions WHERE session_id = ?").bind(sessionId).run();
    return json({ user: null });
  }

  const user = await (env as any).DB
    .prepare("SELECT id, email FROM users WHERE id = ?")
    .bind(session.user_id)
    .first<UserRow>();

  if (!user) return json({ user: null });

  return json({ user });
}