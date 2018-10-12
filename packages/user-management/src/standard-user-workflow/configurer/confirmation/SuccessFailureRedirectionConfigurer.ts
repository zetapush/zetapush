import {
  SuccessFailureRedirectionConfigurer,
  RegistrationConfirmationConfigurer
} from '../../../common/configurer/grammar';
import { AbstractParent } from '../../../common/configurer/AbstractParent';
import { Configurer, SimpleProviderRegistry, Scope, scoped } from '../../../common/configurer';
import { Provider } from '@zetapush/core';
import { RedirectionProviderInjectable } from '../../api';
import { StaticUrlRedirectionProvider } from '../../core/account/confirmation/StaticUrlRedirectionProvider';
import { ConfigurationProperties, ZetaPushContext } from '@zetapush/core';

export class SuccessFailureRedirectionConfigurerImpl<P> extends AbstractParent<P>
  implements SuccessFailureRedirectionConfigurer<P>, Configurer {
  private successRedirectUrl?: string;
  private failureRedirectUrl?: string;

  constructor(parent: P, private scope: Scope) {
    super(parent);
  }

  successUrl(url: string): SuccessFailureRedirectionConfigurer<P> {
    this.successRedirectUrl = url;
    return this;
  }

  failureUrl(url: string): SuccessFailureRedirectionConfigurer<P> {
    this.failureRedirectUrl = url;
    return this;
  }

  async getProviders(): Promise<Provider[]> {
    console.log('confirmation redirection urls', this.successRedirectUrl, this.failureRedirectUrl);
    const providerRegistry = new SimpleProviderRegistry();
    // TODO: allow more customization
    providerRegistry.registerFactory(
      scoped(this.scope.push('success'), RedirectionProviderInjectable),
      [],
      () => new StaticUrlRedirectionProvider(this.successRedirectUrl!)
    );
    providerRegistry.registerFactory(
      scoped(this.scope.push('failure'), RedirectionProviderInjectable),
      [],
      () => new StaticUrlRedirectionProvider(this.failureRedirectUrl!)
    );
    return providerRegistry.getProviders();
  }
}
