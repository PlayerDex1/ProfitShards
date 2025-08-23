import { addSecurityHeaders } from '../../_lib/security';

interface Env {
  DB: D1Database;
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }) {
  try {
    console.log('👤 UPDATE NICKNAME: Iniciando...');

    if (!env.DB) {
      const response = Response.json({ 
        success: false,
        error: 'Database not available' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    // Verificar autenticação
    const cookieHeader = request.headers.get('Cookie');
    const sessionCookie = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith('ps_session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      const response = Response.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Buscar usuário pela sessão
    const session = await env.DB.prepare(`
      SELECT u.id, u.email, u.username 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.session_id = ? AND s.expires_at > ?
    `).bind(sessionCookie, Date.now()).first() as { id: string; email: string; username: string } | null;

    if (!session) {
      const response = Response.json({ 
        success: false,
        error: 'Invalid session' 
      }, { status: 401 });
      return addSecurityHeaders(response);
    }

    // Parse do novo nickname
    const body = await request.json();
    const { nickname } = body;

    console.log('👤 Usuário:', session.email, 'quer alterar nickname para:', nickname);

    // Validar nickname
    if (!nickname || typeof nickname !== 'string') {
      const response = Response.json({ 
        success: false,
        error: 'Nickname é obrigatório' 
      }, { status: 400 });
      return addSecurityHeaders(response);
    }

    // Limpar e validar nickname
    const cleanNickname = nickname.trim();
    
    if (cleanNickname.length < 2) {
      const response = Response.json({ 
        success: false,
        error: 'Nickname deve ter pelo menos 2 caracteres' 
      }, { status: 400 });
      return addSecurityHeaders(response);
    }

    if (cleanNickname.length > 20) {
      const response = Response.json({ 
        success: false,
        error: 'Nickname deve ter no máximo 20 caracteres' 
      }, { status: 400 });
      return addSecurityHeaders(response);
    }

    // Verificar caracteres permitidos (letras, números, _, -)
    const nicknameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!nicknameRegex.test(cleanNickname)) {
      const response = Response.json({ 
        success: false,
        error: 'Nickname pode conter apenas letras, números, _ e -' 
      }, { status: 400 });
      return addSecurityHeaders(response);
    }

    // Verificar se nickname já existe (opcional - pode permitir duplicatas)
    const existingUser = await env.DB.prepare(`
      SELECT id FROM users WHERE username = ? AND id != ?
    `).bind(cleanNickname, session.id).first();

    if (existingUser) {
      const response = Response.json({ 
        success: false,
        error: 'Este nickname já está em uso' 
      }, { status: 409 });
      return addSecurityHeaders(response);
    }

    // Atualizar nickname
    const updateResult = await env.DB.prepare(`
      UPDATE users SET username = ? WHERE id = ?
    `).bind(cleanNickname, session.id).run();

    console.log('👤 Nickname atualizado:', updateResult);

    if (!updateResult.success) {
      const response = Response.json({ 
        success: false,
        error: 'Erro ao atualizar nickname' 
      }, { status: 500 });
      return addSecurityHeaders(response);
    }

    const response = Response.json({
      success: true,
      message: 'Nickname atualizado com sucesso',
      oldNickname: session.username,
      newNickname: cleanNickname,
      user: {
        id: session.id,
        email: session.email,
        username: cleanNickname
      }
    });
    
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('❌ Erro ao atualizar nickname:', error);
    const response = Response.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
    return addSecurityHeaders(response);
  }
}