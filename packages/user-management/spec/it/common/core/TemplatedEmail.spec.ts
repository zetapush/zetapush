import { given, autoclean, runInWorker } from '@zetapush/testing';
import {
  MailjetEmailConfigurerImpl,
  EmailConfigurerImpl,
  Account,
  Token,
  Email,
  Scope,
  scopedDependency,
  MessageSender,
  TemplateManager,
  TemplateManagerInjectable,
  EmailSenderInjectable
} from '../../../../src';
import { mock, anyString, anything, when, verify } from 'ts-mockito';
import { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import 'jasmine';
import { NamedLocation } from '../../../../src/common/core/resource/Named';

describe(`TemplatedEmail`, () => {
  const axiosInstance = axios.create({});
  const parent = mock(<any>{});
  const mockAxios = new MockAdapter(axiosInstance);
  const variables = {};

  describe(`send()`, () => {
    describe(`configured with mailjet`, () => {
      describe(`with templated html and text bodies`, () => {
        beforeEach(async () => {
          await given()
            .credentials()
            /**/ .fromEnv()
            /**/ .newApp()
            /**/ .and()
            .worker()
            /**/ .testModule(async () => {
              mockAxios.onPost('mailjet-url').reply(200, {});

              // create configurer
              const configurer = new EmailConfigurerImpl(parent, new Scope('foo'));
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
              return {
                providers: await configurer.getProviders()
              };
            })
            /**/ .dependenciesWithScope(() => [
              EmailSenderInjectable,
              scopedDependency('foo.html', TemplateManagerInjectable),
              scopedDependency('foo.text', TemplateManagerInjectable)
            ])
            /**/ .and()
            .apply(this);
        });

        it(`sends the email through mailjet`, async () => {
          await runInWorker(
            this,
            async (
              _,
              sender: MessageSender,
              htmlTemplateManager: TemplateManager,
              textTemplateManager: TemplateManager
            ) => {
              const html = await htmlTemplateManager.loadAndParse(new NamedLocation('unused'), variables);
              const text = await textTemplateManager.loadAndParse(new NamedLocation('unused'), variables);

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
            }
          );
        });

        afterEach(async () => {
          await autoclean(this);
        });
      });
    });
  });
});
