import { given, autoclean, runInWorker } from '@zetapush/testing';
import { SmtpEmailConfigurerImpl, MessageSender, MessageSenderInjectable } from '../../../../../src';
import { mock } from 'ts-mockito';
import nodemailerMock from 'nodemailer-mock';

import 'jasmine';

describe(`SmtpHttpEmailSender`, () => {
  const parent = mock(<any>{});
  let instanceOfTransport;

  function createAndGetTransport(...args) {
    instanceOfTransport = nodemailerMock.createTransport(...args);
    return instanceOfTransport;
  }

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

            const configurer = new SmtpEmailConfigurerImpl(parent, {}, createAndGetTransport);
            configurer
              .enable(true)
              .host('smtp-host')
              .port(465)
              .username('smtp-user')
              .password('smtp-password');

            return {
              providers: await configurer.getProviders()
            };
          })
          /**/ .dependencies(MessageSenderInjectable)
          /**/ .and()
          .apply(this);
      });

      it(`sends the email through SMTP configuration`, async () => {
        await runInWorker(this, async (sender: MessageSender) => {
          // WHEN
          const result = <any>await sender.send({
            from: 'contact@zetapush.com',
            to: ['odile.deray@zetapush.com'],
            subject: 'SMTP sender test',
            body: {
              html: '<h1>Yeah !</h1>'
            }
          });

          const sentMail = nodemailerMock.mock.sentMail();

          expect(result.message.response).toContain('success');
          expect(sentMail[0].from).toEqual('contact@zetapush.com');
          expect(sentMail[0].to).toContain('odile.deray@zetapush.com');
          expect(sentMail[0].subject).toEqual('SMTP sender test');
          expect(sentMail[0].html).toEqual('<h1>Yeah !</h1>');
          expect(instanceOfTransport.mock.options.host).toEqual('smtp-host');
          expect(instanceOfTransport.mock.options.port).toEqual(465);
          expect(instanceOfTransport.mock.options.secure).toEqual(false);
          expect(instanceOfTransport.mock.options.auth.user).toEqual('smtp-user');
          expect(instanceOfTransport.mock.options.auth.pass).toEqual('smtp-password');
        });
      });

      afterEach(async () => {
        await autoclean(this);
      });
    });
  });
});
