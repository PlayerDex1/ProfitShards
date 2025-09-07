export async function onRequestGet() {
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Auth API is working!',
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}