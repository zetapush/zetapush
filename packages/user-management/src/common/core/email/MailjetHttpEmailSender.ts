import { Sender, MessageSender, Message, SentMessage, Email, EmailAddress } from '../../api';
import { AxiosInstance } from 'axios';
import { EmailAddressWrapper, EmailContentWrapper } from './email-utils';
import { EmailError } from '../../api/exception/MessageError';

export class MailjetAuth {
  constructor(public mailjetApiKeyPublic: string, public mailjetApiKeyPrivate: string) {}
}

export class MailjetHttpError extends EmailError {}

// TODO: handle mailjet template
export class MailjetHttpEmailSender implements MessageSender {
  constructor(
    private mailjetUrl: string,
    private mailjetAuth: MailjetAuth,
    private defaults: Partial<Email>,
    private axios: AxiosInstance
  ) {}

  async send(email: Email): Promise<SentMessage> {
    try {
      await this.axios.post(
        this.mailjetUrl,
        {
          Messages: [this.toMailjetMessage(email)]
        },
        {
          headers: this.headers(),
          auth: this.auth()
        }
      );
      return { message: email };
    } catch (e) {
      throw new MailjetHttpError(`Failed to send email through Mailjet`, email, e);
    }
  }

  headers() {
    return {
      'Content-Type': 'application/json'
    };
  }

  auth() {
    return {
      username: this.mailjetAuth.mailjetApiKeyPublic,
      password: this.mailjetAuth.mailjetApiKeyPrivate
    };
  }

  toMailjetMessage(email: Email): any {
    return {
      From: this.toMailjetAddress(email.from || this.defaults.from),
      To: (email.to || this.defaults.to || []).map(this.toMailjetAddress.bind(this)),
      Cc: (email.cc || this.defaults.cc || []).map(this.toMailjetAddress.bind(this)),
      Bcc: (email.bcc || this.defaults.bcc || []).map(this.toMailjetAddress.bind(this)),
      Subject: email.subject || this.defaults.subject,
      TextPart: new EmailContentWrapper(email.body).text,
      HTMLPart: new EmailContentWrapper(email.body).html
    };
  }

  toMailjetAddress(address?: EmailAddress | string): { Email: string; Name?: string } | null {
    if (!address) {
      return null;
    }
    if (typeof address === 'string') {
      return this.toMailjetAddress(new EmailAddressWrapper(address));
    }
    return {
      Email: address.getEmailAddress(),
      Name: address.getPersonal() || ''
    };
  }
}
