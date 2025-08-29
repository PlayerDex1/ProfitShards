// Endpoint para testar configuração de email
import { createResponse } from '../../_lib/response';

export async function onRequestGet(context: any) {
  const { env } = context;

  try {
    const config = {
      resend: {
        hasKey: !!env.RESEND_API_KEY,
        keyPreview: env.RESEND_API_KEY ? env.RESEND_API_KEY.substring(0, 8) + '...' : 'not set',
        emailFrom: env.EMAIL_FROM || 'not set'
      },
      sendgrid: {
        hasKey: !!env.SENDGRID_API_KEY,
        keyPreview: env.SENDGRID_API_KEY ? env.SENDGRID_API_KEY.substring(0, 8) + '...' : 'not set'
      },
      brevo: {
        hasKey: !!env.BREVO_API_KEY,
        keyPreview: env.BREVO_API_KEY ? env.BREVO_API_KEY.substring(0, 8) + '...' : 'not set'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'not set',
        cfPages: !!process.env.CF_PAGES,
        allEnvKeys: Object.keys(env).filter(key => key.includes('EMAIL') || key.includes('RESEND') || key.includes('SENDGRID') || key.includes('BREVO'))
      }
    };

    console.log('📧 EMAIL CONFIG CHECK:', config);

    return createResponse({
      success: true,
      config,
      message: 'Email configuration check completed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ CONFIG CHECK ERROR:', error);
    return createResponse({
      success: false,
      error: error.message,
      message: 'Failed to check email configuration'
    });
  }
}