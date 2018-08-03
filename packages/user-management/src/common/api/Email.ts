import { Message, Recipient, Sender, Content } from './Message';

export interface EmailAddress {
  toString(): string;
  getEmailAddress(): string;
  getPersonal(): string | undefined;
}

// export interface EmailSender extends Sender, EmailAddress {}
// export interface EmailRecipient extends Recipient, EmailAddress {}
export type EmailSender = EmailAddress | string;
export type EmailRecipient = EmailAddress | string;
export type EmailSubject = string;
export type EmailContent = EmailWithFallbackContent | Content | string;

export interface EmailWithFallbackContent extends Content {
  text?: Content | string;
  html?: Content | string;
}

export interface Email extends Message {
  from?: EmailSender;
  to?: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject?: EmailSubject;
  body: EmailContent;
}
