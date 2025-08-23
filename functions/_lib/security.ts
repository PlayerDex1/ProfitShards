export interface Env {
  DB: D1Database;
  KV?: KVNamespace; // Para rate limiting
}

// Rate Limiting Configuration
const RATE_LIMITS = {
  auth: { requests: 5, window: 60 }, // 5 tentativas por minuto
  api: { requests: 100, window: 60 }, // 100 requests por minuto
  strict: { requests: 3, window: 300 } // 3 tentativas por 5 minutos (para ações críticas)
};

// Security Headers
export function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // Content Security Policy
  headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://oauth2.googleapis.com https://www.googleapis.com; " +
    "frame-src https://accounts.google.com;"
  );
  
  // Security Headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS (apenas em produção)
  if (response.url && response.url.includes('https://')) {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Rate Limiting usando localStorage como fallback se KV não disponível
export async function checkRateLimit(
  env: Env, 
  identifier: string, 
  action: keyof typeof RATE_LIMITS,
  request: Request
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const limit = RATE_LIMITS[action];
  const key = `rate_limit:${action}:${identifier}`;
  const now = Date.now();
  const windowStart = now - (limit.window * 1000);
  
  try {
    // Usar KV se disponível (melhor performance)
    if (env.KV) {
      const data = await env.KV.get(key, 'json') as { requests: number[]; } | null;
      const requests = data?.requests || [];
      
      // Filtrar requests dentro da janela de tempo
      const validRequests = requests.filter(time => time > windowStart);
      
      if (validRequests.length >= limit.requests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Math.min(...validRequests) + (limit.window * 1000)
        };
      }
      
      // Adicionar nova request
      validRequests.push(now);
      await env.KV.put(key, JSON.stringify({ requests: validRequests }), {
        expirationTtl: limit.window * 2 // TTL duplo da janela
      });
      
      return {
        allowed: true,
        remaining: limit.requests - validRequests.length,
        resetTime: now + (limit.window * 1000)
      };
    }
    
    // Fallback: usar D1 para rate limiting
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        requests TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `).run();
    
    const record = await env.DB.prepare(
      'SELECT requests FROM rate_limits WHERE key = ? AND updated_at > ?'
    ).bind(key, windowStart).first() as { requests: string } | null;
    
    const requests = record ? JSON.parse(record.requests) : [];
    const validRequests = requests.filter((time: number) => time > windowStart);
    
    if (validRequests.length >= limit.requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.min(...validRequests) + (limit.window * 1000)
      };
    }
    
    validRequests.push(now);
    
    await env.DB.prepare(
      'INSERT OR REPLACE INTO rate_limits (key, requests, updated_at) VALUES (?, ?, ?)'
    ).bind(key, JSON.stringify(validRequests), now).run();
    
    return {
      allowed: true,
      remaining: limit.requests - validRequests.length,
      resetTime: now + (limit.window * 1000)
    };
    
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Em caso de erro, permitir a request (fail-open)
    return { allowed: true, remaining: limit.requests - 1, resetTime: now + (limit.window * 1000) };
  }
}

// Input Validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input.replace(/[<>'"]/g, '').substring(0, maxLength).trim();
}

export function validateCalculationData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Validar campos numéricos
  const numericFields = ['investment', 'tokenPrice', 'gemPrice', 'tokensFarmed', 'tokensEquipment', 'gemsConsumed'];
  for (const field of numericFields) {
    if (data[field] !== undefined && (typeof data[field] !== 'number' || data[field] < 0 || data[field] > 1000000000)) {
      return false;
    }
  }
  
  return true;
}

// Audit Logging
export async function logAuditEvent(
  env: Env,
  userId: string,
  action: string,
  details: any,
  ipAddress?: string
): Promise<void> {
  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at INTEGER NOT NULL
      )
    `).run();
    
    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO audit_logs (id, user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      userId,
      action,
      JSON.stringify(details),
      ipAddress || 'unknown',
      Date.now()
    ).run();
    
    console.log(`🔍 Audit: ${action} by ${userId}`);
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

// Cleanup old data
export async function cleanupOldData(env: Env): Promise<void> {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  try {
    // Limpar sessões expiradas
    await env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(Date.now()).run();
    
    // Limpar rate limits antigos
    await env.DB.prepare('DELETE FROM rate_limits WHERE updated_at < ?').bind(sevenDaysAgo).run();
    
    // Limpar audit logs antigos (manter apenas 30 dias)
    await env.DB.prepare('DELETE FROM audit_logs WHERE created_at < ?').bind(thirtyDaysAgo).run();
    
    console.log('✅ Database cleanup completed');
  } catch (error) {
    console.error('Database cleanup failed:', error);
  }
}

// Get client IP
export function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Forwarded-For')?.split(',')[0] || 
         'unknown';
}