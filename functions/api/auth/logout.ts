import { ensureMigrations } from "../../_lib/migrations";

export interface Env { DB: D1Database }

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

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  await ensureMigrations(env as any);

  const sessionId = getCookie(request, "ps_session");
  if (sessionId) {
    await (env as any).DB.prepare("DELETE FROM sessions WHERE session_id = ?").bind(sessionId).run();
  }

  const host = new URL(request.url).host;
  const apex = host.replace(/^www\./, "");
  const cookieDomain = `.${apex}`;

  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append(
    "Set-Cookie",
    `ps_session=; Path=/; Domain=${cookieDomain}; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  );

  return new Response(JSON.stringify({ ok: true }), { headers });
}