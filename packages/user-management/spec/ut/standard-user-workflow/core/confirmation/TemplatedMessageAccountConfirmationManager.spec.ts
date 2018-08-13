import { given, autoclean, runInWorker, bootstrapRegisteredInstances } from '@zetapush/testing';
import { mock, anyString, anything, when, verify, instance } from 'ts-mockito';
import { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import 'jasmine';
import {
  RegistrationConfirmationConfigurerImpl,
  Account,
  Token,
  StandardAccountStatus,
  TokenGenerator,
  Base36RandomTokenGenerator
} from '../../../../../src';
import { RegistrationConfigurer } from '../../../../../src/common/configurer/grammar';
import { Gda, GdaConfigurer, Simple } from '@zetapush/platform-legacy';
import { Injector } from 'injection-js';

describe(`TemplatedMessageAccountConfirmationManager`, () => {
  const axiosInstance = axios.create({});
  const parent = mock<RegistrationConfigurer>(<any>{});
  const mockAxios = new MockAdapter(axiosInstance);
  const tokenGenerator: TokenGenerator = mock(Base36RandomTokenGenerator);
  const htmlTemplate = ({ account, token }: { account: Account; token: Token }) =>
    `Hello ${account.userProfile.username}, 
    <a href="https://zetapush.com/${account.accountId}/${token.value}">Please confirm your account</a>`;
  const textTemplate = ({ account, token }: { account: Account; token: Token }) =>
    `Hello ${account.userProfile.username}, 
    Please confirm your account: https://zetapush.com/${account.accountId}/${token.value}`;

  beforeEach(async () => {
    await given()
      .credentials()
      /**/ .fromEnv()
      /**/ .newApp()
      /**/ .and()
      .worker()
      /**/ .dependencies(Gda, GdaConfigurer, Simple)
      /**/ .and()
      .apply(this);
  });

  it(
    `configured with
      - html template string
      - text template string
      - mailjet
      - mocked axios that responds 200 OK
      - mocked token generator
     and run with
      - Odile DERAY fake account
     should 
      - execute valid http request
      - provide html and text content
      - send email to odile.deray@zetapush.com`,
    async () => {
      await runInWorker(this, async (injector: Injector) => {
        // GIVEN
        mockAxios.onPost('mailjet-url').reply(200, {});
        when(tokenGenerator.generate()).thenResolve({ value: '123456' });

        // create configurer
        // const configurer = new MailjetEmailConfigurerImpl(parent, { from: 'Kara <kara@zetapush.com>' }, axiosInstance);
        const configurer = new RegistrationConfirmationConfigurerImpl(parent, injector);
        configurer
          .token()
          /**/ .generator(instance(tokenGenerator))
          /**/ .validity(5000)
          /**/ .storage(undefined)
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
          /*  */ .template(textTemplate);
        // /*  */ .and()
        // /**/ .and()
        // .redirection();
        const manager = await configurer.build();
        await bootstrapRegisteredInstances();

        // WHEN
        const result = await manager.askConfirmation({
          accountId: '42',
          accountStatus: StandardAccountStatus.WaitingConfirmation,
          userProfile: {
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
