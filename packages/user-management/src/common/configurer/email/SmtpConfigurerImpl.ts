import { AbstractParent } from '../AbstractParent';
import { SmtpEmailConfigurer } from '../grammar';
import { Configurer, SimpleProviderRegistry } from '../Configurer';
import { Provider } from '@zetapush/core';
import { Email, EmailSenderInjectable } from '../../api';
import { MissingMandatoryConfigurationError } from '../ConfigurerError';
import { SmtpEmailSender, SmtpConfiguration } from '../../core';
import { ConfigureSmtpTransport } from '../../../common/core/email/email-utils';

export class SmtpEmailConfigurerImpl<P> extends AbstractParent<P> implements SmtpEmailConfigurer<P>, Configurer {
  private smtpHost?: string;
  private smtpPort?: number;
  private smtpUser?: string;
  private smtpPassword?: string;
  private enableSsl?: boolean;
  private enableTls?: boolean;

  constructor(parent: P, private defaults: Partial<Email>, private mailer: ConfigureSmtpTransport) {
    super(parent);
  }

  host(smtpHost: string): SmtpEmailConfigurer<P> {
    this.smtpHost = smtpHost;
    return this;
  }

  port(smtpPort: number): SmtpEmailConfigurer<P> {
    this.smtpPort = smtpPort;
    return this;
  }

  username(smtpUser: string): SmtpEmailConfigurer<P> {
    this.smtpUser = smtpUser;
    return this;
  }
  password(smtpPassword: string): SmtpEmailConfigurer<P> {
    this.smtpPassword = smtpPassword;
    return this;
  }

  ssl(enableSsl: boolean): SmtpEmailConfigurer<P> {
    this.enableSsl = enableSsl;
    return this;
  }

  starttls(enableTls: boolean): SmtpEmailConfigurer<P> {
    this.enableTls = enableTls;
    return this;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    providerRegistry.registerFactory(EmailSenderInjectable, [], () => {
      if (!this.smtpHost || !this.smtpUser || !this.smtpPassword) {
        throw new MissingMandatoryConfigurationError('Missing host, username or password for SMTP configuration');
      }

      const smtpConf: SmtpConfiguration = this.getSmtpConfiguration();

      return new SmtpEmailSender(smtpConf, this.defaults, this.mailer);
    });

    return providerRegistry.getProviders();
  }

  private getSmtpConfiguration(): SmtpConfiguration {
    return {
      host: this.smtpHost || '',
      port: this.smtpPort || this.getDefaultPort(),
      username: this.smtpUser,
      password: this.smtpPassword,
      ssl: this.enableSsl || false,
      startTls: this.enableTls || false
    };
  }

  private getDefaultPort() {
    if (this.starttls) {
      return 587;
    } else if (this.ssl) {
      return 465;
    } else {
      return 25;
    }
  }
}
