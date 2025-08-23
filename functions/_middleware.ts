import { addSecurityHeaders } from "./_lib/security";

export async function onRequest(context: { request: Request; next: () => Promise<Response> }) {
  const { request, next } = context;
  
  try {
    // Processar a request normalmente
    const response = await next();
    
    // Aplicar headers de segurança em todas as responses
    return addSecurityHeaders(response);
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Em caso de erro, retornar resposta de erro com headers de segurança
    const errorResponse = new Response('Internal Server Error', { status: 500 });
    return addSecurityHeaders(errorResponse);
  }
}