// Serviço de Email Gratuito - Resend Integration
export interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  SENDGRID_API_KEY?: string;
  BREVO_API_KEY?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

interface WinnerEmailData {
  userEmail: string;
  giveawayTitle: string;
  prize: string;
  position: number;
  totalPoints: number;
  winnerAnnouncement?: string;
}

// 📧 ENVIO PRINCIPAL - TENTA MÚLTIPLOS PROVEDORES
export async function sendWinnerNotification(
  env: Env,
  winnerData: WinnerEmailData,
  customMessage?: string
): Promise<EmailResult> {
  
  // 1. TENTAR RESEND (PREFERÊNCIA)
  if (env.RESEND_API_KEY) {
    const resendResult = await sendViaResend(env, winnerData, customMessage);
    if (resendResult.success) {
      return resendResult;
    }
    console.log('Resend failed, trying alternatives...');
  }

  // 2. TENTAR SENDGRID
  if (env.SENDGRID_API_KEY) {
    const sendgridResult = await sendViaSendGrid(env, winnerData, customMessage);
    if (sendgridResult.success) {
      return sendgridResult;
    }
    console.log('SendGrid failed, trying alternatives...');
  }

  // 3. TENTAR BREVO
  if (env.BREVO_API_KEY) {
    const brevoResult = await sendViaBrevo(env, winnerData, customMessage);
    if (brevoResult.success) {
      return brevoResult;
    }
    console.log('Brevo failed...');
  }

  // 4. FALLBACK: SALVAR PARA ENVIO MANUAL
  return await saveForManualSending(env, winnerData, customMessage);
}

// 📧 RESEND API (3.000 emails/mês grátis)
async function sendViaResend(env: Env, winnerData: WinnerEmailData, customMessage?: string): Promise<EmailResult> {
  try {
    const emailContent = generateEmailHTML(winnerData, customMessage);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || 'ProfitShards <noreply@resend.dev>',
        to: [winnerData.userEmail],
        subject: `🎉 Você ganhou! ${winnerData.giveawayTitle}`,
        html: emailContent,
        text: generateEmailText(winnerData, customMessage)
      })
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: result.id,
        provider: 'resend'
      };
    } else {
      return {
        success: false,
        error: result.message || 'Resend API error',
        provider: 'resend'
      };
    }

  } catch (error) {
    return {
      success: false,
      error: `Resend exception: ${error.message}`,
      provider: 'resend'
    };
  }
}

// 📧 SENDGRID API (100 emails/dia grátis)
async function sendViaSendGrid(env: Env, winnerData: WinnerEmailData, customMessage?: string): Promise<EmailResult> {
  try {
    const emailContent = generateEmailHTML(winnerData, customMessage);
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: winnerData.userEmail }],
          subject: `🎉 Você ganhou! ${winnerData.giveawayTitle}`
        }],
        from: { 
          email: env.EMAIL_FROM || 'noreply@profitshards.online', 
          name: 'ProfitShards' 
        },
        content: [{
          type: 'text/html',
          value: emailContent
        }, {
          type: 'text/plain',
          value: generateEmailText(winnerData, customMessage)
        }]
      })
    });

    if (response.ok) {
      return {
        success: true,
        messageId: response.headers.get('x-message-id') || 'sendgrid-sent',
        provider: 'sendgrid'
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        error: `SendGrid error: ${errorText}`,
        provider: 'sendgrid'
      };
    }

  } catch (error) {
    return {
      success: false,
      error: `SendGrid exception: ${error.message}`,
      provider: 'sendgrid'
    };
  }
}

// 📧 BREVO API (300 emails/dia grátis)
async function sendViaBrevo(env: Env, winnerData: WinnerEmailData, customMessage?: string): Promise<EmailResult> {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { 
          email: env.EMAIL_FROM || 'noreply@profitshards.online',
          name: 'ProfitShards'
        },
        to: [{ email: winnerData.userEmail }],
        subject: `🎉 Você ganhou! ${winnerData.giveawayTitle}`,
        htmlContent: generateEmailHTML(winnerData, customMessage),
        textContent: generateEmailText(winnerData, customMessage)
      })
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: result.messageId,
        provider: 'brevo'
      };
    } else {
      return {
        success: false,
        error: result.message || 'Brevo API error',
        provider: 'brevo'
      };
    }

  } catch (error) {
    return {
      success: false,
      error: `Brevo exception: ${error.message}`,
      provider: 'brevo'
    };
  }
}

// 💾 FALLBACK: SALVAR PARA ENVIO MANUAL
async function saveForManualSending(env: Env, winnerData: WinnerEmailData, customMessage?: string): Promise<EmailResult> {
  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS manual_emails (
        id TEXT PRIMARY KEY,
        winner_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        html_content TEXT NOT NULL,
        text_content TEXT NOT NULL,
        giveaway_title TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        sent_manually BOOLEAN DEFAULT FALSE
      )
    `).run();

    const emailId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO manual_emails (
        id, winner_email, subject, html_content, text_content, 
        giveaway_title, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      emailId,
      winnerData.userEmail,
      `🎉 Você ganhou! ${winnerData.giveawayTitle}`,
      generateEmailHTML(winnerData, customMessage),
      generateEmailText(winnerData, customMessage),
      winnerData.giveawayTitle,
      Date.now()
    ).run();

    return {
      success: true,
      messageId: emailId,
      provider: 'manual_fallback'
    };

  } catch (error) {
    return {
      success: false,
      error: `Manual save failed: ${error.message}`,
      provider: 'manual_fallback'
    };
  }
}

// 🎨 GERAR HTML PROFISSIONAL
function generateEmailHTML(winnerData: WinnerEmailData, customMessage?: string): string {
  const message = customMessage || `
🎉 Parabéns! Você ganhou o "${winnerData.giveawayTitle}"!

🏆 Prêmio: ${winnerData.prize}
📊 Sua posição: #${winnerData.position}
⭐ Pontos acumulados: ${winnerData.totalPoints}

Para reivindicar seu prêmio, entre em contato conosco:

📧 Responda este email com:
• Nome completo
• Endereço completo para entrega  
• Telefone para contato

💬 Ou entre em contato no Discord: @playerhold

⏰ Você tem 7 dias para reivindicar seu prêmio.

Obrigado por participar!
  `.trim();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Você Ganhou! - ProfitShards</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
        🏆 PARABÉNS, VOCÊ GANHOU!
      </h1>
      <h2 style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">
        ${winnerData.giveawayTitle}
      </h2>
    </div>

    <!-- Prize Info -->
    <div style="padding: 30px 20px; background: linear-gradient(135deg, #fef3c7, #fde68a); text-align: center;">
      <div style="display: inline-block; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 18px;">🎁 Seu Prêmio</h3>
        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">${winnerData.prize}</p>
        <div style="margin-top: 15px; display: flex; justify-content: space-around; font-size: 14px; color: #6b7280;">
          <span><strong>Posição:</strong> #${winnerData.position}</span>
          <span><strong>Pontos:</strong> ${winnerData.totalPoints}</span>
        </div>
      </div>
    </div>

    <!-- Message Content -->
    <div style="padding: 30px 20px; line-height: 1.6; color: #374151;">
      <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0;">${message}</pre>
    </div>

    <!-- CTA Section -->
    <div style="padding: 20px; background: #f3f4f6; text-align: center;">
      <a href="https://profitshards.online" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 15px;">
        🔗 Acessar ProfitShards
      </a>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        Acesse o site para mais detalhes ou entre em contato via Discord: <strong>@playerhold</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af;">
      <p style="margin: 0; font-size: 14px;">
        <strong style="color: white;">ProfitShards</strong> - WorldShards Calculator
      </p>
      <p style="margin: 5px 0 0 0; font-size: 12px;">
        Desenvolvido pela comunidade, para a comunidade.
      </p>
    </div>

  </div>
</body>
</html>
  `;
}

// 📝 GERAR TEXTO SIMPLES (FALLBACK)
function generateEmailText(winnerData: WinnerEmailData, customMessage?: string): string {
  const message = customMessage || `
Parabéns! Você ganhou o "${winnerData.giveawayTitle}"!

Prêmio: ${winnerData.prize}
Posição: #${winnerData.position}
Pontos: ${winnerData.totalPoints}

Para reivindicar seu prêmio, responda este email com:
- Nome completo
- Endereço completo para entrega
- Telefone para contato

Ou entre em contato no Discord: @playerhold

Você tem 7 dias para reivindicar.

Obrigado por participar!

---
ProfitShards - WorldShards Calculator
https://profitshards.online
  `;

  return message.trim();
}

// 📊 VERIFICAR STATUS DE ENTREGA
export async function checkEmailDelivery(env: Env, messageId: string, provider: string): Promise<any> {
  try {
    switch (provider) {
      case 'resend':
        if (!env.RESEND_API_KEY) return null;
        const resendResponse = await fetch(`https://api.resend.com/emails/${messageId}`, {
          headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}` }
        });
        return resendResponse.ok ? await resendResponse.json() : null;

      case 'sendgrid':
        // SendGrid não tem endpoint público para check de status
        return { status: 'sent', provider: 'sendgrid' };

      default:
        return null;
    }
  } catch (error) {
    console.error('Error checking email delivery:', error);
    return null;
  }
}

// 📋 OBTER EMAILS PARA ENVIO MANUAL
export async function getManualEmails(env: Env): Promise<any[]> {
  try {
    const result = await env.DB.prepare(`
      SELECT * FROM manual_emails 
      WHERE sent_manually = FALSE 
      ORDER BY created_at DESC
    `).all();

    return result.results || [];
  } catch (error) {
    console.error('Error getting manual emails:', error);
    return [];
  }
}