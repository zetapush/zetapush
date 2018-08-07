import { given, autoclean, runInWorker } from '@zetapush/testing';
import { MailjetEmailConfigurerImpl } from '../../../../src';
import { mock, anyString, anything, when, verify } from 'ts-mockito';
import { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe(`TemplatedEmail`, () => {
  const axiosInstance = axios.create({});
  const parent = mock(<any>{});
  const mockAxios = new MockAdapter(axiosInstance);

  beforeEach(async () => {
    await given()
      .credentials()
      /**/ .fromEnv()
      /**/ .newApp()
      /**/ .and()
      // .worker()
      // /**/ .dependencies(Simple)
      // /**/ .bootstrap((simple: Simple) => {})
      // /**/ .and()
      .apply(this);
  });

  it(`configured with
      - template string
      - mailjet
      - mocked axios that responds 200 OK
     and run with
      - {from: 'odile.deray@zetapush.com', subject: 'Mailjet sender test', body: {html: '<h1>Yeah !</h1>'}}
     should 
      - execute valid http request
      - end successfully`, async () => {
    await runInWorker(this, [], async () => {
      // GIVEN
      mockAxios.onPost('mailjet-url').reply(200, {});

      // // create configurer
      // const configurer = new configurer.apiKeyPublic('public-key').apiKeyPrivate('private-key').url('mailjet-url');
      // const sender = await configurer.build();
      // // WHEN
      // const result = await sender.send({
      //   from: 'odile.deray@zetapush.com',
      //   subject: 'Mailjet sender test',
      //   body: {
      //     html: '<h1>Yeah !</h1>'
      //   }
      // });
      // // THEN
      // verify(
      //   axiosInstance.post(
      //     'mailjet-url',
      //     {
      //       Messages: [
      //         {
      //           From: {
      //             Name: 'Kara',
      //             Email: 'kara@zetapush.com'
      //           },
      //           To: [
      //             {
      //               Name: '',
      //               Email: 'odile.deray@zetapush.com'
      //             }
      //           ],
      //           Cc: [],
      //           Bcc: [],
      //           Subject: 'Mailjet sender test',
      //           TextPart: undefined,
      //           HTMLPart: '<h1>Yeah !</h1>'
      //         }
      //       ]
      //     },
      //     anything()
      //   )
      // );
    });
  });

  afterEach(async () => {
    await autoclean(this);
  });
});
