import { given, autoclean, runInWorker } from '@zetapush/testing';
import { mock, anything, when, verify, instance } from 'ts-mockito';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import 'jasmine';
import {
  RegistrationConfirmationConfigurerImpl,
  Account,
  Token,
  StandardAccountStatus,
  TokenGenerator,
  Base36RandomTokenGenerator,
  ConfigurationProperties,
  ZetaPushContext,
  AccountConfirmationManager,
  AccountConfirmationManagerInjectable,
  TokenRepository,
  TokenRepositoryInjectable,
  GdaTokenRepository
} from '../../../../../src';
import { RegistrationConfigurer } from '../../../../../src/common/configurer/grammar';

describe(`TemplatedMessageAccountConfirmationManager`, () => {
  const axiosInstance = axios.create({});
  const parent = mock<RegistrationConfigurer>(<any>{});
  const mockAxios = new MockAdapter(axiosInstance);
  const tokenGenerator: TokenGenerator = mock(Base36RandomTokenGenerator);
  const tokenStorage: TokenRepository = mock(GdaTokenRepository);
  const properties = mock<ConfigurationProperties>(<any>{});
  const zetapushContext = mock<ZetaPushContext>(<any>{});
  const confirmationUrl = async ({ account, token }: { account: Account; token: Token }) =>
    `https://zetapush.com/${account.accountId}/${token.value}`;
  const htmlTemplate = ({ account, confirmationUrl }: { account: Account; confirmationUrl: string }) =>
    `Hello ${account.profile.username}, 
    <a href="${confirmationUrl}">Please confirm your account</a>`;
  const textTemplate = ({ account, confirmationUrl }: { account: Account; confirmationUrl: string }) =>
    `Hello ${account.profile.username}, 
    Please confirm your account:${confirmationUrl}`;
  const successUrl = 'http://my-front-app.zetapush-apps.com#home';
  const failureUrl = 'http://my-front-app.zetapush-apps.com#confirmation-failed';

  describe(`askConfirmation()`, () => {
    describe(`that sends templated email with confirmation link through mailjet`, () => {
      beforeEach(async () => {
        mockAxios.onPost('mailjet-url').reply(200, {});
        when(tokenGenerator.generate()).thenResolve({ value: '123456' });
        when(tokenStorage.store(anything(), anything())).thenResolve({ value: '123456' });

        await given()
          .credentials()
          /**/ .fromEnv()
          /**/ .newApp()
          /**/ .and()
          .worker()
          /**/ .testModule(async () => {
            // create configurer
            const configurer = new RegistrationConfirmationConfigurerImpl(parent, properties, zetapushContext);
            configurer
              .url(confirmationUrl)
              .token()
              /**/ .generator(instance(tokenGenerator))
              /**/ .validity(5000)
              /**/ .storage(instance(tokenStorage))
              /**/ .and()
              .email()
              /**/ .mailjet()
              /*  */ .apiKeyPublic('public-key')
              /*  */ .apiKeyPrivate('private-key')
              /*  */ .url('mailjet-url')
              /*  */ .httpClient(axiosInstance)
              /*  */ .and()
              /**/ .from('no-reply@zetapush.com')
              /**/ .subject(`Confirm your inscription`)
              /**/ .htmlTemplate()
              /*  */ .template(htmlTemplate)
              /*  */ .and()
              /**/ .textTemplate()
              /*  */ .template(textTemplate)
              /*  */ .and()
              /**/ .and()
              .redirection()
              /**/ .successUrl(successUrl)
              /**/ .failureUrl(failureUrl);
            return {
              providers: await configurer.getProviders()
            };
          })
          /**/ .dependencies(AccountConfirmationManagerInjectable)
          /**/ .and()
          .apply(this);
      });

      it(
        `sends the email to the account to confirm`,
        async () => {
          await runInWorker(this, async (manager: AccountConfirmationManager) => {
            // WHEN
            const result = await manager.askConfirmation({
              accountId: '42',
              accountStatus: StandardAccountStatus.WaitingConfirmation,
              profile: {
                firstname: 'Odile',
                lastname: 'DERAY',
                email: 'odile.deray@zetapush.com',
                username: 'odile.deray'
              }
            });

            // THEN
            verify(
              axiosInstance.post(
                'mailjet-url',
                {
                  Messages: [
                    {
                      From: {
                        Name: '',
                        Email: 'no-reply@zetapush.com'
                      },
                      To: [
                        {
                          Name: '',
                          Email: 'odile.deray@zetapush.com'
                        }
                      ],
                      Cc: [],
                      Bcc: [],
                      Subject: 'Confirm your inscription',
                      TextPart: `Hello odile.deray, Please confirm your account: https://zetapush.com/42/123456`,
                      HTMLPart: `Hello odile.deray, <a href="https://zetapush.com/42/123456">Please confirm your account</a>`
                    }
                  ]
                },
                anything()
              )
            );
          });
        },
        5 * 60 * 1000
      );

      afterEach(async () => {
        await autoclean(this);
      });
    });
  });
});
