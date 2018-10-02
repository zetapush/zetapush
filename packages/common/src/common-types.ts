import { Module } from '@zetapush/core';

export type WorkerDeclaration = any;
export type Service = any;
export type CustomCloudService = any;
export interface Config {
  appName?: string;
  developerLogin?: string;
  developerPassword?: string;
  platformUrl?: string;
}
export interface NormalizedWorkerDeclaration {
  [namespace: string]: Function;
}
export interface ResolvedConfig extends Config {
  appName: string;
  developerLogin: string;
  developerPassword: string;
  platformUrl: string;
  workerServiceId?: string;
  npmRegistry?: string;
  skipIgnore?: string;
}
export type ServerClient = any;

export type WorkerDeclarationNormalizer = (declaration: WorkerDeclaration) => Promise<Module>;
