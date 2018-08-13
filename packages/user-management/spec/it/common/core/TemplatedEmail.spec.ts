import { given, autoclean, runInWorker } from '@zetapush/testing';
import { MailjetEmailConfigurerImpl, EmailConfigurerImpl, Account, Token, Email } from '../../../../src';
import { mock, anyString, anything, when, verify } from 'ts-mockito';
import { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import 'jasmine';

describe(`TemplatedEmail`, () => {
  const axiosInstance = axios.create({});
  const parent = mock(<any>{});
  const mockAxios = new MockAdapter(axiosInstance);
  const variables = {};

  beforeEach(async () => {
    await given()
      .credentials()
      /**/ .fromEnv()
      /**/ .newApp()
      /**/ .and()
      .apply(this);
  });

  it(`configured with
      - html template string
      - text template string
      - mailjet
      - mocked axios that responds 200 OK
     should 
      - execute valid http request
      - end successfully`, async () => {
    await runInWorker(this, async () => {
      // GIVEN
      mockAxios.onPost('mailjet-url').reply(200, {});

      // create configurer
      const configurer = new EmailConfigurerImpl(parent);
      configurer
        .mailjet()
        /**/ .apiKeyPublic('public-key')
        /**/ .apiKeyPrivate('private-key')
        /**/ .url('mailjet-url')
        /**/ .httpClient(axiosInstance)
        /**/ .and()
        .htmlTemplate()
        /**/ .template(() => `<h1>Yeah !</h1>`)
        /**/ .and()
        .textTemplate()
        /**/ .template(() => `Yeah !`);
      const { sender, htmlTemplateManager, htmlLocation, textTemplateManager, textLocation } = await configurer.build();
      const html = await htmlTemplateManager.loadAndParse(htmlLocation, variables);
      const text = await textTemplateManager.loadAndParse(textLocation, variables);
      // WHEN
      const result = await sender.send(<Email>{
        to: ['odile.deray@zetapush.com'],
        subject: 'Mailjet sender test',
        body: {
          html: html,
          text: text
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
                  Name: 'Kara',
                  Email: 'kara@zetapush.com'
                },
                To: [
                  {
                    Name: '',
                    Email: 'odile.deray@zetapush.com'
                  }
                ],
                Cc: [],
                Bcc: [],
                Subject: 'Mailjet sender test',
                TextPart: 'Yeah !',
                HTMLPart: '<h1>Yeah !</h1>'
              }
            ]
          },
          anything()
        )
      );
    });
  });

  afterEach(async () => {
    await autoclean(this);
  });
});
