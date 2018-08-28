import {
  HttpServerConfigurer,
  HttpServerInjectable,
  HttpServer,
  RequestHandler,
  ErrorHandler,
  Path
} from '../server/http-server';
const express = require('express');
import { Application } from 'express';
import { Bootstrappable, Provider, Cleanable } from '@zetapush/core';
import { trace } from '@zetapush/common';
import { Server } from 'http';

export class ExpressServerConfigurer implements HttpServerConfigurer {
  configure() {}

  async getProviders(): Promise<Provider[]> {
    return [
      {
        provide: HttpServerInjectable,
        useFactory: () => {
          return new ExpressServerWrapper(express());
        },
        deps: []
      }
    ];
  }
}

export class ExpressServerWrapper implements HttpServer, Bootstrappable, Cleanable {
  private server?: Server;

  constructor(private app: Application) {}

  async onApplicationBootstrap() {
    const port = process.env.ZETAPUSH_HTTP_PORT || 2999;
    this.server = this.app.listen(port, () => trace(`express server started on port ${port}`));
  }

  async onApplicationCleanup() {
    try {
      if (this.server) {
        this.server.close(() => trace(`express server stopped`));
      }
    } catch (e) {
      // TODO: logs
      console.warn(`Failed to stop express server`, e);
    }
  }

  use(...args: any[]) {
    return this.app.use(...args);
  }

  get(handler: RequestHandler): any;
  get(path: any, handler: RequestHandler): any;
  get(...args: any[]) {
    return (<any>this.app).get(...args);
  }

  post(handler: RequestHandler): any;
  post(path: any, handler: RequestHandler): any;
  post(...args: any[]) {
    return (<any>this.app).post(...args);
  }

  head(handler: RequestHandler): any;
  head(path: any, handler: RequestHandler): any;
  head(...args: any[]) {
    return (<any>this.app).head(...args);
  }

  delete(handler: RequestHandler): any;
  delete(path: any, handler: RequestHandler): any;
  delete(...args: any[]) {
    return (<any>this.app).delete(...args);
  }

  put(handler: RequestHandler): any;
  put(path: any, handler: RequestHandler): any;
  put(...args: any[]) {
    return (<any>this.app).put(...args);
  }

  patch(handler: RequestHandler): any;
  patch(path: any, handler: RequestHandler): any;
  patch(...args: any[]) {
    return (<any>this.app).patch(...args);
  }

  options(handler: RequestHandler): any;
  options(path: any, handler: RequestHandler): any;
  options(...args: any[]) {
    return (<any>this.app).options(...args);
  }
}
