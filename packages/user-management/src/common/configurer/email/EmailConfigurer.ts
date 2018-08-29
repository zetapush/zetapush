import {
  EmailConfigurer,
  SmtpEmailConfigurer,
  OvhEmailConfigurer,
  MailjetEmailConfigurer,
  EmailTemplateConfigurer,
  TemplateConfigurer,
  TextTemplateConfigurer
} from '../grammar';
import { AbstractParent } from '../AbstractParent';
import { MailjetHttpEmailSender, MailjetAuth } from '../../core';
import { MissingMandatoryConfigurationError } from '../ConfigurerError';
import { Email, EmailSenderInjectable } from '../../api';
import axios, { AxiosInstance } from 'axios';
import { EmailTemplateConfigurerImpl } from '../template/EmailTemplateConfigurer';
import { TemplateConfigurerImpl } from '../template/TemplateConfigurer';
import { TextTemplateConfigurerImpl } from '../template/TextTemplateConfigurer';
import { Configurer, SimpleProviderRegistry, Scope } from '../Configurer';
import { Provider, InjectionToken } from '@zetapush/core';

export class EmailConfigurerImpl<P> extends AbstractParent<P> implements EmailConfigurer<P>, Configurer {
  private mailjetConfigurer: MailjetEmailConfigurerImpl<EmailConfigurer<P>>;
  private defaults: Partial<Email> = {};
  private htmlTemplateConfigurer: EmailTemplateConfigurerImpl<EmailConfigurer<P>>;
  private textTemplateConfigurer: TextTemplateConfigurerImpl<EmailConfigurer<P>>;

  constructor(parent: P, private scope: Scope) {
    super(parent);
  }

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
    this.htmlTemplateConfigurer = new EmailTemplateConfigurerImpl(this, this.scope.push('html'));
    return this.htmlTemplateConfigurer;
  }
  textTemplate(): TextTemplateConfigurer<EmailConfigurer<P>> {
    this.textTemplateConfigurer = new TextTemplateConfigurerImpl(this, this.scope.push('text'));
    return this.textTemplateConfigurer;
  }

  async getProviders(): Promise<Provider[]> {
    let providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerConfigurer(this.mailjetConfigurer);
    await providerRegistry.registerConfigurer(this.htmlTemplateConfigurer);
    await providerRegistry.registerConfigurer(this.textTemplateConfigurer);
    return providerRegistry.getProviders();
  }
}

export const DEFAULT_MAILJET_URL = 'https://api.mailjet.com/v3.1/send';

export class MailjetEmailConfigurerImpl<P> extends AbstractParent<P> implements MailjetEmailConfigurer<P>, Configurer {
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
    console.log('kdfkjsdkggfhdjsgdjgs', mailjetApiKeyPublic);
    console.log('kdfkjsdkggfhdjsgdjgs');
    console.log('kdfkjsdkggfhdjsgdjgs');
    console.log('kdfkjsdkggfhdjsgdjgs');
    console.log('kdfkjsdkggfhdjsgdjgs');
    console.log('kdfkjsdkggfhdjsgdjgs');
    this.mailjetApiKeyPublic = mailjetApiKeyPublic;
    return this;
  }
  apiKeyPrivate(mailjetApiKeyPrivate: string): MailjetEmailConfigurer<P> {
    console.log('kdfkjsdkggfhdjsgdjgs', mailjetApiKeyPrivate);
    console.log('kdfkjsdkggfhdjsgdjgs');
    console.log('kdfkjsdkggfhdjsgdjgs');
    console.log('kdfkjsdkggfhdjsgdjgs');
    console.log('kdfkjsdkggfhdjsgdjgs');
    this.mailjetApiKeyPrivate = mailjetApiKeyPrivate;
    return this;
  }
  httpClient(axios: AxiosInstance) {
    this.axiosInstance = axios;
    return this;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    providerRegistry.registerFactory(EmailSenderInjectable, [], () => {
      const url = this.mailjetUrl || DEFAULT_MAILJET_URL;

      console.log('CONSOLE ====>', this.mailjetApiKeyPublic, this.mailjetApiKeyPrivate);

      if (!this.mailjetApiKeyPublic || !this.mailjetApiKeyPrivate) {
        throw new MissingMandatoryConfigurationError('Missing apiKeyPublic or apiKeyPrivate for Mailjet');
      }
      return new MailjetHttpEmailSender(
        url,
        new MailjetAuth(this.mailjetApiKeyPublic, this.mailjetApiKeyPrivate),
        this.defaults,
        this.axiosInstance || this.axios || axios
      );
    });
    return providerRegistry.getProviders();
  }
}
