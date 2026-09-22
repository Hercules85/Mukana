/**
 * Resend-backed order confirmation emails.
 *
 * Env vars (Vercel → Settings → Environment Variables, and .env.local):
 *   RESEND_API_KEY  — key from resend.com/api-keys (sk_…)
 *   EMAIL_FROM      — e.g. "MUKANA <hello@mukana.com>"; requires the domain
 *                     to be verified in Resend. Falls back to the Resend
 *                     sandbox sender (only deliverable to the account owner).
 *
 * Email sending is best-effort: an outage never blocks order creation.
 */
import { Resend } from 'resend';
import { buildOrderConfirmationEmail, type EmailOrderData } from './email';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM || 'MUKANA <onboarding@resend.dev>';

export async function sendOrderConfirmation(to: string, data: EmailOrderData): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping order confirmation email');
    return;
  }
  const { subject, html, text } = buildOrderConfirmationEmail(data);
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: process.env.EMAIL_REPLY_TO || undefined,
      subject,
      html,
      text,
    });
    if (error) console.error('[email] Resend rejected message:', error);
  } catch (e) {
    console.error('[email] failed to send order confirmation:', e);
  }
}
