import {
  EmailConfigurer,
  SmtpEmailConfigurer,
  OvhEmailConfigurer,
  MailjetEmailConfigurer,
  EmailTemplateConfigurer,
  TextTemplateConfigurer
} from '../grammar';
import { AbstractParent } from '../AbstractParent';
import { Email } from '../../api';
import { EmailTemplateConfigurerImpl } from '../template/EmailTemplateConfigurer';
import { TextTemplateConfigurerImpl } from '../template/TextTemplateConfigurer';
import { Configurer, SimpleProviderRegistry, Scope } from '../Configurer';
import { Provider } from '@zetapush/core';
import { MailjetEmailConfigurerImpl } from './MailjetConfigurerImpl';
import { SmtpEmailConfigurerImpl } from './SmtpConfigurerImpl';
import { createTransport } from 'nodemailer';

export class EmailConfigurerImpl<P> extends AbstractParent<P> implements EmailConfigurer<P>, Configurer {
  private mailjetConfigurer: MailjetEmailConfigurerImpl<EmailConfigurer<P>>;
  private smtpConfigurer: SmtpEmailConfigurerImpl<EmailConfigurer<P>>;
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
    this.smtpConfigurer = new SmtpEmailConfigurerImpl(this, this.defaults, createTransport);
    return this.smtpConfigurer;
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
    await providerRegistry.registerConfigurer(this.smtpConfigurer);
    await providerRegistry.registerConfigurer(this.htmlTemplateConfigurer);
    await providerRegistry.registerConfigurer(this.textTemplateConfigurer);
    return providerRegistry.getProviders();
  }
}
