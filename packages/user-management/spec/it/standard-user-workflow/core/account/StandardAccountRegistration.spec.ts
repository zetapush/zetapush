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
  UuidGenerator,
  TimestampBasedUuidGenerator,
  LegacyAdapterUserRepository,
  GdaTokenRepository
} from '../../../../../src';
import { StandardUserWorkflowConfigurer } from '../../../../../src/common/configurer/grammar';
import { StandardUserWorkflowConfigurerImpl } from '../../../../../src/standard-user-workflow/configurer/StandardUserWorkflowConfigurer';
import { StandardUserWorkflow } from '../../../../../src/standard-user-workflow/core/StandardUserWorkflow';
import { ConfirmationUrlHttpHandler } from '../../../../../src/standard-user-workflow/core/account/confirmation/ConfirmationUrlHttpHandler';
import { ConfigurationProperties, ZetaPushContext } from '@zetapush/core';
import { Simple } from '@zetapush/platform-legacy';
import { getLocal } from 'mockttp';
import { MockedConfigurationProperties, MockedZetaPushContext } from '@zetapush/testing';

describe(`StandardAccountRegistration`, () => {
  const axiosInstance = axios.create({});
  const mockAxios = new MockAdapter(axiosInstance);
  const tokenGenerator: TokenGenerator = mock(Base36RandomTokenGenerator);
  const uuidGenerator: UuidGenerator = mock(TimestampBasedUuidGenerator);
  const confirmationUrl = async ({ account, token }: { account: Account; token: Token }) =>
    `https://zetapush.com/${account.accountId}/${token.value}`;
  const htmlTemplate = ({ account, confirmationUrl }: { account: Account; confirmationUrl: string }) =>
    `Hello ${account.profile.username}, 
    <a href="${confirmationUrl}">Please confirm your account</a>`;
  const textTemplate = ({ account, confirmationUrl }: { account: Account; confirmationUrl: string }) =>
    `Hello ${account.profile.username}, 
    Please confirm your account:${confirmationUrl}`;

  describe(`signup()`, () => {
    describe(`on valid account`, () => {
      beforeEach(async () => {
        // mock server is used to simulate a front application
        this.mockServer = getLocal();
        await this.mockServer.start();
        await this.mockServer.get('/home').thenReply(200, 'Home !');
        await this.mockServer.get('/confirmation-failed').thenReply(200, 'Error !');
        this.successUrl = this.mockServer.urlFor('/home');
        this.failureUrl = this.mockServer.urlFor('/confirmation-failed');
        this.properties = mock(MockedConfigurationProperties);
        this.zetapushContext = mock(MockedZetaPushContext);
        when(this.zetapushContext.getLocalZetaPushHttpPort()).thenReturn(2999);
        mockAxios.onPost('mailjet-url').reply(200, {});
        when(tokenGenerator.generate()).thenResolve({ value: '123456' });
        when(uuidGenerator.generate()).thenResolve({ value: '42' });
        await given()
          .credentials()
          /**/ .fromEnv()
          /**/ .newApp()
          /**/ .and()
          .worker()
          /**/ .testModule(async () => {
            // create configurer
            const configurer = new StandardUserWorkflowConfigurerImpl(
              instance(this.properties),
              instance(this.zetapushContext)
            );
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
              /*  */ .url(confirmationUrl)
              /*  */ .token()
              /*    */ .generator(instance(tokenGenerator))
              /*    */ .validity(5000)
              /*    */ .storage(GdaTokenRepository)
              /*    */ .and()
              /*  */ .email()
              /*    */ .mailjet()
              /*      */ .enable(true)
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
              /*      */ .template(textTemplate)
              /*      */ .and()
              /*    */ .and()
              /*  */ .redirection()
              /*    */ .successUrl(this.successUrl)
              /*    */ .failureUrl(this.failureUrl);
            return {
              providers: [
                ...(await configurer.getProviders()),
                { provide: ConfigurationProperties, useValue: instance(this.properties) },
                { provide: ZetaPushContext, useValue: instance(this.zetapushContext) }
              ]
            };
          })
          /**/ .dependencies(StandardUserWorkflow, Simple, ConfirmationUrlHttpHandler)
          /**/ .and()
          .apply(this);
      });

      it(
        `creates the account and send an email with confirmation link to the email address of the user`,
        async () => {
          await runInWorker(this, async (workflow: StandardUserWorkflow, simple: Simple) => {
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

            // THEN
            // check in database if user is well registered and confirmed
            const user = await simple.checkAccount({ key: 'odile.deray' });
            expect(user).toBeDefined();
            expect(user.fields.accountId).toBeDefined();
            expect(user.fields.accountId).toBe('42');
            expect(user.status.data).toBe(StandardAccountStatus.WaitingConfirmation);
            expect(user.status.active).toBe(false);
            expect(user.fields.userProfile).toEqual({
              firstname: 'Odile',
              lastname: 'DERAY',
              email: 'odile.deray@zetapush.com',
              username: 'odile.deray'
            });
            // check that the email has been sent
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

      it(
        `confirms the account when link is clicked and redirect to a particular page`,
        async () => {
          await runInWorker(this, async (workflow: StandardUserWorkflow, simple: Simple) => {
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
            // make HTTP request to confirm the account
            const response = await axios.get('http://localhost:2999/users/42/confirm/123456');

            // THEN
            // check redirection
            expect(response.status).toBe(200);
            expect(response.data).toBe('Home !');
            // check in database if user is well registered and confirmed
            const user = await simple.checkAccount({ key: 'odile.deray' });
            expect(user).toBeDefined();
            expect(user.fields.accountId).toBeDefined();
            expect(user.fields.accountId).toBe('42');
            expect(user.status.data).toBe(StandardAccountStatus.Active);
            expect(user.status.active).toBe(true);
            expect(user.fields.userProfile).toEqual({
              firstname: 'Odile',
              lastname: 'DERAY',
              email: 'odile.deray@zetapush.com',
              username: 'odile.deray'
            });
          });
        },
        5 * 60 * 1000
      );

      afterEach(async () => {
        await this.mockServer.stop();
        await autoclean(this);
      });
    });
  });
});
