import { given, autoclean, runInWorker } from '@zetapush/testing';
import { MailjetEmailConfigurerImpl, MessageSender, EmailSenderInjectable } from '../../../../../src';
import { mock, anyString, anything, when, verify } from 'ts-mockito';
import { AxiosInstance, AxiosResponse, AxiosPromise } from 'axios';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import 'jasmine';

describe(`MailjetHttpEmailSender`, () => {
  const axiosInstance = axios.create({});
  const mockAxios = new MockAdapter(axiosInstance);
  mockAxios.onPost('mailjet-url').reply(200, {});
  const parent = mock(<any>{});

  describe(`send()`, () => {
    describe(`with only html body`, () => {
      beforeEach(async () => {
        await given()
          .credentials()
          /**/ .fromEnv()
          /**/ .newApp()
          /**/ .and()
          .worker()
          /**/ .testModule(async () => {
            // create configurer
            const configurer = new MailjetEmailConfigurerImpl(
              parent,
              { from: 'Kara <kara@zetapush.com>' },
              axiosInstance
            );
            configurer
              .apiKeyPublic('public-key')
              .apiKeyPrivate('private-key')
              .url('mailjet-url');
            return {
              providers: await configurer.getProviders()
            };
          })
          /**/ .dependencies(EmailSenderInjectable)
          /**/ .and()
          .apply(this);
      });

      fit(`sends the email through mailjet`, async () => {
        await runInWorker(this, async (sender: MessageSender) => {
          // WHEN
          const result = await sender.send({
            to: ['odile.deray@zetapush.com'],
            subject: 'Mailjet sender test',
            body: {
              html: '<h1>Yeah !</h1>'
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
                    TextPart: undefined,
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
  });
});
