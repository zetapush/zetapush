import { AbstractParent } from '../AbstractParent';
import { MailjetEmailConfigurer } from '../grammar';
import axios, { AxiosInstance } from 'axios';
import { Configurer, SimpleProviderRegistry } from '../Configurer';
import { Email, EmailSenderInjectable } from '../../api';
import { MissingMandatoryConfigurationError } from '../ConfigurerError';
import { MailjetHttpEmailSender, MailjetAuth } from '../../core';
import { Provider } from '@zetapush/core';
import { AlternativeHelper } from '../AlternativeHelper';

export const DEFAULT_MAILJET_URL = 'https://api.mailjet.com/v3.1/send';

export class MailjetEmailConfigurerImpl<P> extends AbstractParent<P> implements MailjetEmailConfigurer<P>, Configurer {
  private mailjetUrl?: string;
  private mailjetApiKeyPublic?: string;
  private mailjetApiKeyPrivate?: string;
  private axiosInstance: AxiosInstance;
  private alternativeHelper: AlternativeHelper<this>;

  constructor(parent: P, private defaults: Partial<Email>, private axios?: AxiosInstance) {
    super(parent);
    this.alternativeHelper = new AlternativeHelper(this);
  }

  enable(enable: boolean): this;
  enable(enable: () => boolean | Promise<boolean>): this;
  enable(enable: any): this {
    return this.alternativeHelper.enable(enable);
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

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    if (await this.alternativeHelper.isEnabled()) {
      providerRegistry.registerFactory(EmailSenderInjectable, [], () => {
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
      });
    }
    return providerRegistry.getProviders();
  }
}
