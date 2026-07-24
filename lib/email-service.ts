export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
}

// Persist the logs across Next.js dev server reloads
const globalRef = global as any;
if (!globalRef.emailQueue) {
  globalRef.emailQueue = [];
}

export const emailQueue: EmailLog[] = globalRef.emailQueue;

export async function sendEmail(to: string, subject: string, body: string) {
  const log: EmailLog = {
    id: "mail_" + Math.random().toString(36).substring(2, 9),
    to,
    subject,
    body,
    timestamp: new Date().toISOString(),
  };
  emailQueue.unshift(log);
  console.log(`[EMAIL SERVICE] Sent email to ${to}. Subject: ${subject}`);
  return log;
}
