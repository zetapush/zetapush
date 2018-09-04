import { MessageSender, SentMessage, Email, EmailAddress } from '../../api';
import { EmailError } from '../../api/exception/MessageError';
import { EmailAddressWrapper, EmailContentWrapper, SmtpConfiguration, ConfigureSmtpTransport } from './email-utils';
import { Transporter } from 'nodemailer';

export class SmtpError extends EmailError {}

export class SmtpEmailSender implements MessageSender {
  constructor(
    private smtpConf: SmtpConfiguration,
    private defaults: Partial<Email>,
    private mailer: ConfigureSmtpTransport
  ) {}

  private transporter: Transporter;

  async send(email: Email): Promise<SentMessage> {
    try {
      this.transporter = this.mailer({
        host: this.smtpConf.host,
        port: this.smtpConf.port,
        secure: this.smtpConf.ssl,
        tls: this.smtpConf.startTls,
        auth: {
          user: this.smtpConf.username,
          pass: this.smtpConf.password
        },
        logger: false,
        debug: false
      });

      const sentMessageByNodemailer = await this.transporter.sendMail(this.toSmtpMessage(email));

      return {
        message: {
          recipients: sentMessageByNodemailer.accepted,
          rejected: sentMessageByNodemailer.rejected,
          response: sentMessageByNodemailer.response,
          from: sentMessageByNodemailer.envelope.from,
          to: sentMessageByNodemailer.envelope.to,
          subject: sentMessageByNodemailer.envelope.subject,
          cc: sentMessageByNodemailer.envelope.cc,
          bcc: sentMessageByNodemailer.envelope.bcc,
          messageId: sentMessageByNodemailer.envelope.messageId,
          body: email.body
        }
      };
    } catch (e) {
      throw new SmtpError(`Failed to send email through SMTP configuration`, email, e);
    }
  }

  toSmtpMessage(email: Email): any {
    return {
      from: this.toSmtpAddress(email.from || this.defaults.from),
      to: (email.to || this.defaults.to || []).map(this.toSmtpAddress.bind(this)),
      cc: (email.cc || this.defaults.cc || []).map(this.toSmtpAddress.bind(this)),
      bcc: (email.bcc || this.defaults.bcc || []).map(this.toSmtpAddress.bind(this)),
      subject: email.subject || this.defaults.subject,
      text: new EmailContentWrapper(email.body).text,
      html: new EmailContentWrapper(email.body).html
    };
  }

  toSmtpAddress(address?: EmailAddress | string): string | null {
    if (!address) {
      return null;
    }
    if (typeof address === 'string') {
        return address;
    }

    return address.getEmailAddress();
  }
}
