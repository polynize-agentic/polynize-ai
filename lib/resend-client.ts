import { Resend } from 'resend';

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type SendEmailResult =
  | { status: 'sent'; id: string }
  | { status: 'skipped'; reason: 'resend_disabled' };

let cached: Resend | null = null;

function client(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY must be set');
  }
  cached = new Resend(key);
  return cached;
}

function fromAddress(): string {
  const from = process.env.RESEND_FROM;
  if (!from) {
    throw new Error('RESEND_FROM must be set');
  }
  return from;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<SendEmailResult> {
  if (process.env.RESEND_ENABLED !== 'true') {
    console.warn(
      `[resend-client] RESEND_ENABLED is not 'true'. Skipping send to ${to} (subject: ${subject})`
    );
    return { status: 'skipped', reason: 'resend_disabled' };
  }

  const { data, error } = await client().emails.send({
    from: fromAddress(),
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
  if (!data) {
    throw new Error('Resend send returned no data');
  }
  return { status: 'sent', id: data.id };
}
