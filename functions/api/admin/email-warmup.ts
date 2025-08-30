// Sistema de Warming Up de Email
import { createResponse, createErrorResponse } from '../../_lib/response';
import { checkRateLimit, getClientIP } from '../../_lib/security';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const clientIP = getClientIP(request);

  try {
    // Rate limiting para warming up
    const rateLimitResult = await checkRateLimit(env, clientIP, 'strict', request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Too many warmup attempts', 429);
    }

    const data = await request.json();
    const { adminEmail, testCount = 5 } = data;

    if (!adminEmail) {
      return createErrorResponse('Admin email is required', 400);
    }

    const results = [];

    // Enviar emails de teste para o próprio admin
    for (let i = 0; i < testCount; i++) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'ProfitShards <onboarding@resend.dev>',
            to: [adminEmail],
            subject: `[ProfitShards] Teste de sistema #${i + 1}`,
            html: generateWarmupHTML(i + 1),
            text: generateWarmupText(i + 1),
            headers: {
              'X-Entity-Ref-ID': crypto.randomUUID(),
              'List-Unsubscribe': '<mailto:unsubscribe@profitshards.online>',
              'X-Mailer': 'ProfitShards-System-v1.0'
            }
          })
        });

        const result = await response.json();
        results.push({
          testNumber: i + 1,
          success: response.ok,
          messageId: result.id || null,
          error: response.ok ? null : result.message
        });

        // Aguardar entre envios para parecer natural
        if (i < testCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        results.push({
          testNumber: i + 1,
          success: false,
          messageId: null,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return createResponse({
      success: true,
      message: `Warming up completed: ${successCount}/${testCount} emails sent`,
      results,
      instructions: [
        '1. Verifique sua caixa de entrada',
        '2. Marque emails como "Não é spam" se necessário',
        '3. Responda alguns emails para criar histórico positivo',
        '4. Aguarde 1-2 horas antes de enviar para ganhadores',
        '5. Reputação do remetente será melhorada gradualmente'
      ]
    });

  } catch (error) {
    console.error('❌ WARMUP ERROR:', error);
    return createErrorResponse('Warmup failed: ' + error.message, 500);
  }
}

function generateWarmupHTML(testNumber: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Teste de Sistema - ProfitShards</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="margin: 0;">ProfitShards</h1>
    <p style="margin: 5px 0 0 0;">WorldShards Calculator</p>
  </div>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #4f46e5; margin-top: 0;">Teste de Sistema #${testNumber}</h2>
    <p>Este é um email de teste para verificar a funcionalidade do nosso sistema de notificações.</p>
    
    <p><strong>Objetivo:</strong> Garantir que nossos emails chegem corretamente aos usuários.</p>
    
    <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
  </div>

  <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #4f46e5;">
    <p style="margin: 0;"><strong>Ação necessária:</strong></p>
    <p style="margin: 5px 0 0 0;">Se este email chegou na caixa de spam, por favor marque como "Não é spam" para melhorar nossa reputação de remetente.</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://profitshards.online" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Acessar ProfitShards
    </a>
  </div>

  <div style="border-top: 1px solid #dee2e6; padding-top: 15px; text-align: center; color: #6c757d; font-size: 14px;">
    <p>ProfitShards - WorldShards Calculator</p>
    <p>Sistema de teste automatizado</p>
  </div>

</body>
</html>
  `;
}

function generateWarmupText(testNumber: number): string {
  return `
ProfitShards - WorldShards Calculator

Teste de Sistema #${testNumber}

Este é um email de teste para verificar a funcionalidade do nosso sistema de notificações.

Objetivo: Garantir que nossos emails chegem corretamente aos usuários.
Data/Hora: ${new Date().toLocaleString('pt-BR')}

AÇÃO NECESSÁRIA:
Se este email chegou na caixa de spam, por favor marque como "Não é spam" para melhorar nossa reputação de remetente.

Acesse: https://profitshards.online

---
ProfitShards - WorldShards Calculator
Sistema de teste automatizado
  `;
}