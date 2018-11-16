import { EmailAddress, EmailWithFallbackContent, EmailContent, Content } from '../../api';

const EMAIL_WITH_PERSONAL_PATTERN = /^(.+)[ ]+<(.+)>$/;

export class EmailAddressWrapper implements EmailAddress {
  private address: string;
  private personal?: string;

  constructor(address: EmailAddress | { address: string; personal?: string } | string) {
    if (typeof address === 'string') {
      this.parse(address);
    } else if ((<EmailAddress>address).getEmailAddress) {
      this.address = (<EmailAddress>address).getEmailAddress();
      this.personal = (<EmailAddress>address).getPersonal();
    } else {
      this.address = (<any>address).address;
      this.personal = (<any>address).personal;
    }
  }

  private parse(address: string) {
    const m = address.match(EMAIL_WITH_PERSONAL_PATTERN);
    if (m && m.length) {
      this.address = m[2];
      this.personal = m[1];
    } else {
      this.address = address;
    }
  }

  toString(): string {
    if (!this.getPersonal()) {
      return this.getEmailAddress();
    }
    return `${this.getPersonal()} <${this.getEmailAddress()}>`;
  }

  getEmailAddress(): string {
    return this.address;
  }

  getPersonal(): string | undefined {
    return this.personal;
  }
}

export class EmailContentWrapper {
  public html?: string;
  public text?: string;

  constructor(content: EmailContent) {
    if (typeof content === 'string') {
      this.html = content;
    } else if ((<EmailWithFallbackContent>content).html || (<EmailWithFallbackContent>content).text) {
      const casted = <EmailWithFallbackContent>content;
      this.html = casted.html ? casted.html.toString() : undefined;
      this.text = casted.text ? casted.text.toString() : undefined;
    } else {
      this.html = content.toString();
    }
  }
}

export interface SmtpConfiguration {
  host: string;
  port?: number;
  username?: string;
  password?: string;
  ssl?: boolean;
  startTls?: boolean;
}

export type ConfigureSmtpTransport = Function;
