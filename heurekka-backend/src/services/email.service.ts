import { Resend } from 'resend';

/**
 * Email Service
 * Handles sending emails using Resend
 */
class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    // For development, use Resend's test domain: onboarding@resend.dev
    // For production, verify your domain at https://resend.com/domains
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    if (!apiKey) {
      console.warn('⚠️  RESEND_API_KEY not configured - emails will not be sent');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;

    console.log(`✅ Email service initialized (from: ${fromEmail})`);
  }

  /**
   * Send verification code email
   */
  async sendVerificationCode(
    to: string,
    code: string,
    type: 'email' | 'phone' = 'email'
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log(`📧 [DEV MODE] Verification code for ${to}: ${code}`);
        return { success: true, messageId: 'dev-mode' };
      }

      const subject = type === 'email'
        ? 'Verifica tu email - Heurekka'
        : 'Código de verificación - Heurekka';

      const html = this.getVerificationEmailTemplate(code, type);

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('Error sending email:', error);
        return { success: false };
      }

      console.log(`✅ Verification email sent to ${to}`);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false };
    }
  }

  /**
   * Get verification email template
   */
  private getVerificationEmailTemplate(code: string, type: 'email' | 'phone'): string {
    const title = type === 'email' ? 'Verifica tu Email' : 'Código de Verificación';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">Heurekka</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                        ${title}
                      </h2>

                      <p style="margin: 0 0 30px 0; color: #6B7280; font-size: 16px; line-height: 24px;">
                        Ingresa el siguiente código de 6 dígitos para verificar tu cuenta:
                      </p>

                      <!-- Code Box -->
                      <div style="background-color: #F3F4F6; border-radius: 8px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563EB; font-family: 'Courier New', monospace;">
                          ${code}
                        </div>
                      </div>

                      <p style="margin: 0 0 20px 0; color: #6B7280; font-size: 14px; line-height: 20px;">
                        Este código expira en <strong>5 minutos</strong>.
                      </p>

                      <p style="margin: 0; color: #9CA3AF; font-size: 14px; line-height: 20px;">
                        Si no solicitaste este código, puedes ignorar este email de forma segura.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                      <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 14px;">
                        © ${new Date().getFullYear()} Heurekka. Todos los derechos reservados.
                      </p>
                      <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                        Tegucigalpa, Honduras
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

export { EmailService };
