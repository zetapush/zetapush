import { URL } from 'url';

import { log, debugObject } from './log';
import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';

import { Config, ResolvedConfig } from '../common-types';

export const fetch = ({
  anonymous = false,
  body,
  config,
  method = 'GET',
  pathname,
  debugName = 'fetch'
}: {
  anonymous?: boolean;
  body?: any;
  config: Config;
  pathname: string;
  method?: string;
  debugName?: string;
}): Promise<any> =>
  new Promise((resolve, reject) => {
    const headers: any = {
      'Content-Type': 'application/json;charset=UTF-8'
    };
    if (!anonymous) {
      const { developerLogin, developerPassword } = config;
      headers['X-Authorization'] = JSON.stringify({
        username: developerLogin,
        password: developerPassword
      });
    }
    const { platformUrl } = config;
    if (!platformUrl) {
      throw new Error('platformUrl is required');
    }
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/${pathname}`;
    const options = {
      data: body,
      headers,
      method,
      url
    };
    log(method, url, body);
    return axios(options)
      .then((response: AxiosResponse<any>) => {
        debugAxiosResponse(options, debugName, response);
        return resolve(response.data);
      })
      .catch((error: AxiosError) => {
        debugAxiosError(options, debugName, error);
        log(method, url, error);
        return reject({
          error,
          statusCode: error.response && error.response.status,
          request: options,
          body: error.response && error.response.data,
          config
        });
      });
    // request(options, (failure: any, response: Response, body: any) => {
    //   debugObject(
    //     'fetch',
    //     { request: options },
    //     { failure },
    //     { response },
    //     { body },
    //   );
    //   // if (failure) {
    //   //   log(method, url, failure);
    //   //   return reject({ failure, request: options });
    //   // }
    //   // if (response.statusCode !== 200) {
    //   //   log(method, url, response);
    //   //   return reject({
    //   //     response,
    //   //     statusCode: response.statusCode,
    //   //     body,
    //   //     request: options,
    //   //     config,
    //   //   });
    //   // }
    //   // try {
    //   //   const parsed = JSON.parse(body);
    //   //   return resolve(parsed);
    //   // } catch (failure) {
    //   //   log(method, url, failure);
    //   //   return reject({
    //   //     failure,
    //   //     statusCode: response.statusCode,
    //   //     body,
    //   //     request: options,
    //   //     config,
    //   //   });
    //   // }
    // });
  });

export const debugAxiosResponse = (options: AxiosRequestConfig, debugName: string, response: AxiosResponse<any>) => {
  debugObject(
    `${debugName}`,
    { request: options },
    {
      response: {
        data: response.data,
        statusCode: response.status,
        headers: response.headers
      }
    },
    { body: response.data }
  );
};

export const debugAxiosError = (options: AxiosRequestConfig, debugName: string, error: AxiosError) => {
  debugObject(
    `${debugName}-catch`,
    { request: options },
    {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    },
    {
      response: error.response
        ? {
            data: error.response.data,
            statusCode: error.response.status,
            headers: error.response.headers
          }
        : {}
    },
    { body: error.response && error.response.data }
  );
};
