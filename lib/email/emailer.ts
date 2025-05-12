import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { getSendGridAPIKey, getSendGridFromEmail, getSendGridFromName } from '../config';

const FROM_EMAIL = getSendGridFromEmail()
const FROM_NAME = getSendGridFromName()
const SENDGRID_API_KEY = getSendGridAPIKey()

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Emails will not be sent.');
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('Failed to send email: SENDGRID_API_KEY is not set');
    return false;
  }

  try {
    const msg: MailDataRequired = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if no text version provided
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}