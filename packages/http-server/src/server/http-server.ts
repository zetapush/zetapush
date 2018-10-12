import { Provider, InjectionToken } from '@zetapush/core';
import { IncomingMessage, ServerResponse } from 'http';
// FIXME: do not use express types directly
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export interface HttpServerConfigurer {
  configure(): void;

  getProviders(): Promise<Provider[]>;
}

// export enum RequestMethod {
//   GET = 0,
//   POST,
//   PUT,
//   DELETE,
//   PATCH,
//   ALL,
//   OPTIONS,
//   HEAD
// }

export type Path = string | RegExp;
export type Request = ExpressRequest;
export type Response = ExpressResponse;

export type ErrorHandler = (error: any, req: Request, res: Response | any, next?: Function) => any;
export type RequestHandler = (req: Request, res: Response | any, next?: Function) => any;

export interface HttpServer {
  use(handler: RequestHandler | ErrorHandler): any;
  use(path: Path, handler: RequestHandler | ErrorHandler): any;
  get(handler: RequestHandler): any;
  get(path: Path, handler: RequestHandler): any;
  post(handler: RequestHandler): any;
  post(path: Path, handler: RequestHandler): any;
  head(handler: RequestHandler): any;
  head(path: Path, handler: RequestHandler): any;
  delete(handler: RequestHandler): any;
  delete(path: Path, handler: RequestHandler): any;
  put(handler: RequestHandler): any;
  put(path: Path, handler: RequestHandler): any;
  patch(handler: RequestHandler): any;
  patch(path: Path, handler: RequestHandler): any;
  options(handler: RequestHandler): any;
  options(path: Path, handler: RequestHandler): any;
  // listen(port: number | string, callback?: () => void): void;
  // listen(port: number | string, hostname: string, callback?: () => void): void;
  // reply(response: any, body: any, statusCode: number): any;
  // render(response: any, view: string, options: any): any;
  // setHeader(response: any, name: string, value: string): void;
  // setErrorHandler?(handler: Function): void;
  // setNotFoundHandler?(handler: Function): void;
  // useStaticAssets?(...args: any[]): this;
  // setBaseViewsDir?(path: string): this;
  // setViewEngine?(engineOrOptions: any): this;
  // createMiddlewareFactory(
  //   method: RequestMethod,
  // ): (path: string, callback: Function) => any;
  // getRequestMethod?(request): string;
  // getRequestUrl?(request): string;
  // getInstance(): any;
  // getHttpServer(): any;
  // close(): void;
}
export abstract class HttpServerInjectable implements HttpServer {
  abstract use(handler: RequestHandler | ErrorHandler): any;
  abstract use(path: Path, handler: RequestHandler | ErrorHandler): any;
  abstract get(handler: RequestHandler): any;
  abstract get(path: Path, handler: RequestHandler): any;
  abstract post(handler: RequestHandler): any;
  abstract post(path: Path, handler: RequestHandler): any;
  abstract head(handler: RequestHandler): any;
  abstract head(path: Path, handler: RequestHandler): any;
  abstract delete(handler: RequestHandler): any;
  abstract delete(path: Path, handler: RequestHandler): any;
  abstract put(handler: RequestHandler): any;
  abstract put(path: Path, handler: RequestHandler): any;
  abstract patch(handler: RequestHandler): any;
  abstract patch(path: Path, handler: RequestHandler): any;
  abstract options(handler: RequestHandler): any;
  abstract options(path: Path, handler: RequestHandler): any;
}
