// Authentication utilities for API functions

export async function verifyAuth(request: Request, env: any) {
  try {
    // Extract JWT token from cookies or Authorization header
    const cookieHeader = request.headers.get('Cookie');
    const authHeader = request.headers.get('Authorization');
    
    let token = null;
    
    // Try to get token from Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Try to get token from cookies
    if (!token && cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies['auth-token'] || cookies['session'];
    }
    
    if (!token) {
      return { success: false, error: 'No authentication token provided' };
    }
    
    // Simple JWT verification (you might want to use a proper JWT library)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { success: false, error: 'Invalid token format' };
      }
      
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return { success: false, error: 'Token expired' };
      }
      
      return { 
        success: true, 
        user: {
          email: payload.email || payload.sub,
          id: payload.sub || payload.user_id,
          name: payload.name
        }
      };
    } catch (jwtError) {
      return { success: false, error: 'Invalid token' };
    }
    
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}