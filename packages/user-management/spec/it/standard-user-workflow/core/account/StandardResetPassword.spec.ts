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
import { DEFAULT_ASK_RESET_PASSWORD_URL } from '../../../../../src/standard-user-workflow/configurer/defaults';
import { ResetPasswordPropertiesKeys } from '../../../../../src/standard-user-workflow/configurer/properties';

describe(`StandardResetPassword`, () => {
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
  const htmlTemplateResetPassword = ({
    account,
    askResetPasswordUrl
  }: {
    account: Account;
    askResetPasswordUrl: string;
  }) =>
    `Hello ${account.profile.username}, 
    <a href="${askResetPasswordUrl}">Reset your password</a>`;
  const textTemplateResetPassword = ({
    account,
    askResetPasswordUrl
  }: {
    account: Account;
    askResetPasswordUrl: string;
  }) =>
    `Hello ${account.profile.username}, 
    Reset your password:${askResetPasswordUrl}`;

  describe(`askResetPassword()`, () => {
    describe(`on valid account`, () => {
      beforeEach(async () => {
        // mock server is used to simulate a front application
        this.mockServer = getLocal();
        await this.mockServer.start();
        await this.mockServer.get('/home').thenReply(200, 'Home !');
        await this.mockServer.get('/confirmation-failed').thenReply(200, 'Error !');
        this.successUrl = this.mockServer.urlFor('/home');
        this.failureUrl = this.mockServer.urlFor('/confirmation-failed');
        this.successUrlConfirmResetPassword = this.mockServer.urlFor('/confirm-reset-password');
        this.failureConfirmResetPassword = this.mockServer.urlFor('/confirm-reset-password-failed');
        this.properties = mock(MockedConfigurationProperties);
        this.zetapushContext = mock(MockedZetaPushContext);
        when(this.zetapushContext.getLocalZetaPushHttpPort()).thenReturn(2999);
        when(this.properties.get(ResetPasswordPropertiesKeys.AskUrl, anyString())).thenReturn('http://locahost:8000');
        when(this.zetapushContext.getFrontUrl()).thenReturn('http://locahost:8000');
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
              /*    */ .failureUrl(this.failureUrl)
              /*    */ .and()
              /*  */ .and()
              /**/ .and()
              .lostPassword()
              /**/ .reset()
              /*   */ .ask()
              /*     */ .url(DEFAULT_ASK_RESET_PASSWORD_URL)
              /*     */ .email()
              /*       */ .from('no-reply@zetapush.com')
              /*       */ .subject('Reset your password')
              /*       */ .mailjet()
              /*         */ .enable(true)
              /*         */ .apiKeyPublic('public-key')
              /*         */ .apiKeyPrivate('private-key')
              /*         */ .url('mailjet-url')
              /*         */ .httpClient(axiosInstance)
              /*         */ .and()
              /*       */ .htmlTemplate(/*new MustacheTemplateProvider('templates/email/confirm.html')*/)
              /*         */ .template(htmlTemplateResetPassword)
              /*         */ .and()
              /*      */ .textTemplate(/*new MustacheTemplateProvider('templates/email/confirm.txt')*/)
              /*        */ .template(textTemplateResetPassword)
              /*        */ .and()
              /*      */ .and()
              /*     */ .and()
              /*   */ .confirm();
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
        `Ask to reset password`,
        async () => {
          await runInWorker(this, async (workflow: StandardUserWorkflow, simple: Simple) => {
            // GIVEN (TODO: move in before)
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

            await workflow.confirm(pendingConfirmation);

            // WHEN
            const pendingAskResetPassword = await workflow.askResetPassword({ login: 'odile.deray' });

            expect(pendingAskResetPassword.token).toBeDefined();
            expect(pendingAskResetPassword.token.value).toBe('123456');
            expect(pendingAskResetPassword.account).toBeDefined();
            expect(pendingAskResetPassword.account.accountId).toBeDefined();
            expect(pendingAskResetPassword.account.accountId).toBe('42');
            expect(pendingAskResetPassword.account.accountStatus).toBe(StandardAccountStatus.Active);
            expect(pendingAskResetPassword.account.profile).toEqual({
              firstname: 'Odile',
              lastname: 'DERAY',
              email: 'odile.deray@zetapush.com',
              username: 'odile.deray'
            });
          });
        },
        5 * 60 * 1000
      );

      it(
        `Change the password`,
        async () => {
          await runInWorker(this, async (workflow: StandardUserWorkflow, simple: Simple) => {
            // GIVEN (TODO: move in before)
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

            await workflow.confirm(pendingConfirmation);

            // WHEN
            const pendingAskResetPassword = await workflow.askResetPassword({ login: 'odile.deray' });

            expect(pendingAskResetPassword.token).toBeDefined();
            expect(pendingAskResetPassword.token.value).toBe('123456');
            expect(pendingAskResetPassword.account).toBeDefined();
            expect(pendingAskResetPassword.account.accountId).toBeDefined();
            expect(pendingAskResetPassword.account.accountId).toBe('42');
            expect(pendingAskResetPassword.account.accountStatus).toBe(StandardAccountStatus.Active);
            expect(pendingAskResetPassword.account.profile).toEqual({
              firstname: 'Odile',
              lastname: 'DERAY',
              email: 'odile.deray@zetapush.com',
              username: 'odile.deray'
            });

            const resultChangePassword = await workflow.confirmResetPassword({
              firstPassword: 'pwd',
              secondPassword: 'pwd',
              token: pendingAskResetPassword.token.value
            });

            // expect(resultChangePassword).toBeDefined();
            // expect(resultChangePassword['url']).toBe('http://localhost:8000/confirm-reset-password');
            // expect(resultChangePassword['statusCode']).toBe(302);
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
