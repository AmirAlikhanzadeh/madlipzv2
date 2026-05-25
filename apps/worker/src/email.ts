import { randomUUID } from "node:crypto";

export interface EmailSender {
  send(args: {
    to: string;
    subject: string;
    body: string;
  }): Promise<{ id: string }>;
}

// Stdout sender used until we wire a real provider (Resend/Postmark) in a
// follow-up PR. Establishes the seam so business logic doesn't change later.
export class ConsoleEmailSender implements EmailSender {
  send(args: {
    to: string;
    subject: string;
    body: string;
  }): Promise<{ id: string }> {
    const id = `console-${randomUUID()}`;
    console.log(
      JSON.stringify({
        kind: "email_send",
        provider: "console",
        id,
        to: args.to,
        subject: args.subject,
        body: args.body,
      }),
    );
    return Promise.resolve({ id });
  }
}

let cached: EmailSender | undefined;

export function getEmailSender(): EmailSender {
  if (!cached) cached = new ConsoleEmailSender();
  return cached;
}
