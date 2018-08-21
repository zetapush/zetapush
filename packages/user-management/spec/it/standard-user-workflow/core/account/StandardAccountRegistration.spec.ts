import { given, autoclean, runInWorker } from '@zetapush/testing';
import { mock, anyString, anything, when, verify, instance } from 'ts-mockito';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import 'jasmine';
import {
  Account,
  Token,
  StandardAccountStatus,
  TokenGenerator,
  Base36RandomTokenGenerator,
  ConfigurationProperties,
  ZetaPushContext,
  UuidGenerator,
  TimestampBasedUuidGenerator,
  LegacyAdapterUserRepository,
  GdaTokenRepository
} from '../../../../../src';
import { StandardUserWorkflowConfigurer } from '../../../../../src/common/configurer/grammar';
import { StandardUserWorkflowConfigurerImpl } from '../../../../../src/standard-user-workflow/configurer/StandardUserWorkflowConfigurer';
import { StandardUserWorkflow } from '../../../../../src/standard-user-workflow/core/StandardUserWorkflow';

describe(`StandardAccountRegistration`, () => {
  const axiosInstance = axios.create({});
  const parent = mock<StandardUserWorkflowConfigurer>(<any>{});
  const mockAxios = new MockAdapter(axiosInstance);
  const tokenGenerator: TokenGenerator = mock(Base36RandomTokenGenerator);
  const uuidGenerator: UuidGenerator = mock(TimestampBasedUuidGenerator);
  const properties = mock<ConfigurationProperties>(<any>{});
  const zetapushContext = mock<ZetaPushContext>(<any>{});
  const htmlTemplate = ({ account, token }: { account: Account; token: Token }) =>
    `Hello ${account.profile.username}, 
    <a href="https://zetapush.com/${account.accountId}/${token.value}">Please confirm your account</a>`;
  const textTemplate = ({ account, token }: { account: Account; token: Token }) =>
    `Hello ${account.profile.username}, 
    Please confirm your account: https://zetapush.com/${account.accountId}/${token.value}`;

  describe(`signup()`, () => {
    describe(`on valid account`, () => {
      beforeEach(async () => {
        await given()
          .credentials()
          /**/ .fromEnv()
          /**/ .newApp()
          /**/ .and()
          .worker()
          /**/ .configuration(async () => {
            mockAxios.onPost('mailjet-url').reply(200, {});
            when(tokenGenerator.generate()).thenResolve({ value: '123456' });
            when(uuidGenerator.generate()).thenResolve({ value: '42' });

            // create configurer
            const configurer = new StandardUserWorkflowConfigurerImpl(properties, zetapushContext);
            configurer
              .registration()
              /**/ .account()
              /*  */ .uuid()
              /*    */ .generator(instance(uuidGenerator))
              /*    */ .and()
              /*  */ .initialStatus()
              /*    */ .value(StandardAccountStatus.WaitingConfirmation)
              /*    */ .and()
              /*  */ .storage(LegacyAdapterUserRepository)
              /*  */ .and()
              // /*  */ .fields()
              // /*    */.scan()
              // /*      */.annotations()
              // /*      */.and()
              // /*    */.and()
              /**/ .confirmation()
              /*  */ .token()
              /*    */ .generator(instance(tokenGenerator))
              /*    */ .validity(5000)
              /*    */ .storage(GdaTokenRepository)
              /*    */ .and()
              /*  */ .email()
              /*    */ .mailjet()
              /*      */ .apiKeyPublic('public-key')
              /*      */ .apiKeyPrivate('private-key')
              /*      */ .url('mailjet-url')
              /*      */ .httpClient(axiosInstance)
              /*      */ .and()
              /*    */ .from('no-reply@zetapush.com')
              /*    */ .subject(`Confirm your inscription`)
              /*    */ .htmlTemplate()
              /*      */ .template(htmlTemplate)
              /*      */ .and()
              /*    */ .textTemplate()
              /*      */ .template(textTemplate);
            // /*  */ .and()
            // /**/ .and()
            // .redirection();
            return await configurer.getProviders();
          })
          /**/ .dependencies(StandardUserWorkflow)
          /**/ .and()
          .apply(this);
      });

      it(
        `creates the account and send an email with confirmation link to the email address of the user`,
        async () => {
          await runInWorker(this, async (_, workflow: StandardUserWorkflow) => {
            // WHEN
            const result = await workflow.signup({
              credentials: {
                login: 'odile.deray',
                password: 'password'
              },
              profile: {
                firstname: 'Odile',
                lastname: 'DERAY',
                email: 'odile.deray@zetapush.com',
                username: 'odile.deray'
              }
            });

            // TODO: check confirmation
            // TODO: check response

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
