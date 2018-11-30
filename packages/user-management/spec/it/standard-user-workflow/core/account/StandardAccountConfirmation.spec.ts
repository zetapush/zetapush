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
import { HttpUrlRedirection } from '../../../../../src/standard-user-workflow/api';
import { MissingConfigurationProperty } from '@zetapush/common';
import { ConfigurationValidationError } from '../../../../../src/common/configurer/ConfigurerError';
import { MockedConfigurationProperties, MockedZetaPushContext } from '@zetapush/testing';

describe(`StandardAccountConfirmation`, () => {
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
     Please confirm your account: ${confirmationUrl}`;

  describe(`confirm()`, () => {
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
        await given()
          .credentials()
          /**/ .fromEnv()
          /**/ .newApp()
          /**/ .and()
          .worker()
          /**/ .testModule(async () => {
            mockAxios.onPost('mailjet-url').reply(200, {});
            when(tokenGenerator.generate()).thenResolve({ value: '123456' });
            when(uuidGenerator.generate()).thenResolve({ value: '42' });

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
        `creates the account and validate it`,
        async () => {
          await runInWorker(this, async (workflow: StandardUserWorkflow, simple: Simple) => {
            // WHEN
            const pendingConfirmation = await workflow.signup({
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

            const resultOfConfirm = (await workflow.confirm(pendingConfirmation)) as HttpUrlRedirection;

            const confirmedUserAccount = await simple.checkAccount({
              key: 'odile.deray'
            });

            // THEN
            expect(resultOfConfirm.url).toContain('/home');
            expect(resultOfConfirm.statusCode).toEqual(302);
            expect(confirmedUserAccount.status.active).toEqual(true);
            expect(confirmedUserAccount.status.data).toEqual(StandardAccountStatus.Active);
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

  describe(`initialization`, () => {
    describe(`without email or sms sender`, () => {
      beforeEach(async () => {
        this.properties = mock(MockedConfigurationProperties);
        this.zetapushContext = mock(MockedZetaPushContext);
        when(this.zetapushContext.getLocalZetaPushHttpPort()).thenReturn(2999);
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
              /*      */ .enable(false)
              /*      */ .and()
              /*    */ .and()
              /*  */ .redirection()
              /*    */ .successUrl('dontcare')
              /*    */ .failureUrl('dontcare');
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
        `fails indicating missing configuration for email or sms`,
        async () => {
          try {
            await runInWorker(this, async (workflow: StandardUserWorkflow, simple: Simple) => {});
            fail('should have failed indicating missing configuration');
          } catch (e) {
            expect(() => {
              throw e;
            }).toThrowError(ConfigurationValidationError, 'The configuration of the worker is not valid');
          }
        },
        5 * 60 * 1000
      );

      afterEach(async () => {
        await autoclean(this);
      });
    });
  });
});
