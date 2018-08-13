import {
  EmailConfigurer,
  SmtpEmailConfigurer,
  OvhEmailConfigurer,
  MailjetEmailConfigurer,
  EmailTemplateConfigurer,
  Configurer,
  TemplateConfigurer,
  TextTemplateConfigurer
} from '../grammar';
import { AbstractParent } from '../AbstractParent';
import { MailjetHttpEmailSender, MailjetAuth } from '../../core';
import { MissingMandatoryConfigurationError } from '../ConfigurerError';
import { Email, MessageSender, TemplateManager, Location } from '../../api';
import axios, { AxiosInstance } from 'axios';
import { EmailTemplateConfigurerImpl } from '../template/EmailTemplateConfigurer';
import { TemplateConfigurerImpl } from '../template/TemplateConfigurer';
import { TextTemplateConfigurerImpl } from '../template/TextTemplateConfigurer';

export interface TemplatedEmailSender {
  sender: MessageSender;
  htmlTemplateManager?: TemplateManager;
  htmlLocation?: Location;
  textTemplateManager?: TemplateManager;
  textLocation?: Location;
}

export class EmailConfigurerImpl<P> extends AbstractParent<P>
  implements EmailConfigurer<P>, Configurer<TemplatedEmailSender> {
  private mailjetConfigurer: MailjetEmailConfigurerImpl<EmailConfigurer<P>>;
  private defaults: Partial<Email> = {};
  private htmlTemplateConfigurer: EmailTemplateConfigurerImpl<EmailConfigurer<P>>;
  private textTemplateConfigurer: TextTemplateConfigurerImpl<EmailConfigurer<P>>;

  from(email: string): EmailConfigurer<P> {
    this.defaults.from = email;
    return this;
  }

  subject(subject: string): EmailConfigurer<P> {
    this.defaults.subject = subject;
    return this;
  }

  smtp(): SmtpEmailConfigurer<EmailConfigurer<P>> {
    throw new Error('Method not implemented.');
  }
  ovh(): OvhEmailConfigurer<EmailConfigurer<P>> {
    throw new Error('Method not implemented.');
  }
  mailjet(): MailjetEmailConfigurer<EmailConfigurer<P>> {
    this.mailjetConfigurer = new MailjetEmailConfigurerImpl(this, this.defaults);
    return this.mailjetConfigurer;
  }

  htmlTemplate(): EmailTemplateConfigurer<EmailConfigurer<P>> {
    this.htmlTemplateConfigurer = new EmailTemplateConfigurerImpl(this);
    return this.htmlTemplateConfigurer;
  }
  textTemplate(): TextTemplateConfigurer<EmailConfigurer<P>> {
    this.textTemplateConfigurer = new TextTemplateConfigurerImpl(this);
    return this.textTemplateConfigurer;
  }

  async build(): Promise<TemplatedEmailSender> {
    let sender;
    if (this.mailjetConfigurer) {
      sender = await this.mailjetConfigurer.build();
    }
    if (!sender) {
      // TODO: handle OVH and SMTP too
      throw new MissingMandatoryConfigurationError('Missing mailjet configuration');
    }
    let htmlTemplateManager;
    let htmlLocation;
    if (this.htmlTemplateConfigurer) {
      const html = await this.htmlTemplateConfigurer.build();
      htmlTemplateManager = html.manager;
      htmlLocation = html.location;
    }
    let textTemplateManager;
    let textLocation;
    if (this.textTemplateConfigurer) {
      const text = await this.textTemplateConfigurer.build();
      textTemplateManager = text.manager;
      textLocation = text.location;
    }
    return {
      sender,
      htmlTemplateManager,
      htmlLocation,
      textTemplateManager,
      textLocation
    };
  }
}

export const DEFAULT_MAILJET_URL = 'https://api.mailjet.com/v3.1/send';

export class MailjetEmailConfigurerImpl<P> extends AbstractParent<P>
  implements MailjetEmailConfigurer<P>, Configurer<MailjetHttpEmailSender> {
  private mailjetUrl?: string;
  private mailjetApiKeyPublic?: string;
  private mailjetApiKeyPrivate?: string;
  private axiosInstance: AxiosInstance;

  constructor(parent: P, private defaults: Partial<Email>, private axios?: AxiosInstance) {
    super(parent);
  }

  url(mailjetUrl: string): MailjetEmailConfigurer<P> {
    this.mailjetUrl = mailjetUrl;
    return this;
  }
  apiKeyPublic(mailjetApiKeyPublic: string): MailjetEmailConfigurer<P> {
    this.mailjetApiKeyPublic = mailjetApiKeyPublic;
    return this;
  }
  apiKeyPrivate(mailjetApiKeyPrivate: string): MailjetEmailConfigurer<P> {
    this.mailjetApiKeyPrivate = mailjetApiKeyPrivate;
    return this;
  }
  httpClient(axios: AxiosInstance) {
    this.axiosInstance = axios;
    return this;
  }

  async build(): Promise<MailjetHttpEmailSender> {
    const url = this.mailjetUrl || DEFAULT_MAILJET_URL;
    if (!this.mailjetApiKeyPublic || !this.mailjetApiKeyPrivate) {
      throw new MissingMandatoryConfigurationError('Missing apiKeyPublic or apiKeyPrivate for Mailjet');
    }
    return new MailjetHttpEmailSender(
      url,
      new MailjetAuth(this.mailjetApiKeyPublic, this.mailjetApiKeyPrivate),
      this.defaults,
      this.axiosInstance || this.axios || axios
    );
  }
}
