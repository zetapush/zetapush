interface HandshakeFields {
  ext: any;
}

interface AbstractHandshakeOptions {
  authType: string;
  appName: string;
  deploymentId: string;
}

interface CredentialsHandshakeOptions {
  authType: string;
  deploymentId: string;
  login: string;
  password: string;
}

interface TokenHandshakeOptions {
  authType: string;
  deploymentId: string;
  token: string;
}

interface AbstractHandshake {
  authType: string;
  authVersion: string;
  appName: string;
  deploymentId: string;
  getHandshakeFields(client: Client): HandshakeFields;
}

interface AbstractAuthData {
  authType: string;
  deploymentId: string;
  login: string;
  password?: string;
}

interface CredentialsAuthData {
  login: string;
  password: string;
}

interface CredentialsHandshake extends AbstractHandshake {
  login: string;
  password: string;
  authData: CredentialsAuthData;
}

interface TokenAuthData {
  token: string;
}

interface TokenHandshake extends AbstractHandshake {
  token: string;
  authData: TokenAuthData;
}

type AuthenticationCallback = () => AbstractHandshake;

type AsyncMacroServicePublisher = (method: string, parameters?: PublishParameters, hardFail?: boolean, debug?: number) => Promise<any>;

type MacroServicePublisher = (method: string, parameters?: PublishParameters, hardFail?: boolean, debug?: number) => void;

type ServicePublisher = (method: string, parameters: any) => void;

interface PublishParameters {
  [property: string]: any;
}

interface Options {
  platformUrl?: string;
  appName: string;
  forceHttps?: boolean;
  resource?: string;
  transports?: any[];
}

interface Service {
  DEFAULT_DEPLOYMENT_ID: string;
}

interface ServiceDeclaration {
  deploymentId?: string;
  listener?: any;
  Type: Service;
}

interface TaskServiceDeclaration {
  deploymentId?: string;
  Type: Service;
}

interface Token {
  token: string;
}

interface Credentials {
  login: string;
  password: string;
}

interface ClientHelper {
  authentication: AuthenticationCallback;
  servers: Promise<string[]>;
  getUniqRequestId(): string;
}

interface SmartClientDeployment {
  simple?: string;
  weak?: string;
}

type ConnectionStatusHandler = number;

type ProxyService = {
  [method: string]: <Input, Output>(parameters: Input) => Output;
}

export interface ClientOptions extends Options {
  authentication(): AbstractHandshake;
}

export interface WeakClientOptions extends Options {
  deploymentId?: string;
}

export interface SmartClientOptions extends Options {
  deployment?: SmartClientDeployment
}

export class Authentication {
  static delegating(authData: TokenAuthData): TokenHandshake;
  static simple(authData: CredentialsAuthData): CredentialsHandshake;
  static weak(authData: TokenAuthData): TokenHandshake;
  static create(
    authData: AbstractAuthData
  ): CredentialsHandshake | TokenHandshake;
}

export interface ConnectionStatusListener {
  onConnectionBroken(): void;
  onConnectionClosed(): void;
  onConnectionEstablished(): void;
  onConnectionToServerFail(failure: any): void;
  onConnectionWillClose(): void;
  onFailedHandshake(failure: any): void;
  onMessageLost(): void;
  onNegotiationFailed(failure: any): void;
  onNoServerUrlAvailable(): void;
  onSuccessfulHandshake(authentication: any): void;
}

export class Client {
  helper: ClientHelper;
  constructor(options: ClientOptions);
  addConnectionStatusListener(listener: ConnectionStatusListener): ConnectionStatusHandler;
  connect(): Promise<void>;
  createService(declaration: ServiceDeclaration): Service;
  createAsyncMacroService(declaration: ServiceDeclaration): services.Macro;
  createAsyncTaskService(declaration: TaskServiceDeclaration): Service;
  createAsyncService(declaration: ServiceDeclaration): Service;
  createProxyMacroService(deploymentId?: string): ProxyService;
  createProxyService(deploymentId: string): ProxyService;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getAppName(): string;
  getResource(): string;
  getUserId(): string;
  removeConnectionStatusListener(listener: ConnectionStatusHandler): void;
  setAuthentication(authentication: AuthenticationCallback): void;
  setLogLevel(level: string): void;
  setResource(resource: string): void;
  unsubscribe(service: Service): void;
  //
  onConnectionBroken(handler: () => void): ConnectionStatusHandler;
  onConnectionClosed(handler: () => void): ConnectionStatusHandler;
  onConnectionEstablished(handler: () => void): ConnectionStatusHandler;
  onConnectionToServerFail(handler: (failure: any) => void): ConnectionStatusHandler;
  onConnectionWillClose(handler: () => void): ConnectionStatusHandler;
  onFailedHandshake(handler: (failure: any) => void): ConnectionStatusHandler;
  onMessageLost(handler: () => void): ConnectionStatusHandler;
  onNegotiationFailed(handler: (failure: any) => void): ConnectionStatusHandler;
  onNoServerUrlAvailable(handler: () => void): ConnectionStatusHandler;
  onSuccessfulHandshake(handler: (authentication: any) => void): ConnectionStatusHandler;
}

export class SmartClient extends Client {
  constructor(options: SmartClientOptions)
  getCredentials(): any;
  getSession(): any;
  hasCredentials(): boolean;
  isStronglyAuthenticated(session?: any): boolean;
  isWeaklyAuthenticated(session?: any): boolean;
  setCredentials(credentials: any): void;
}

export class WeakClient extends Client {
  constructor(options: WeakClientOptions);
  getToken(): Token;
}

export namespace services {
  class Macro implements Service {
    DEFAULT_DEPLOYMENT_ID: string;
    static DEFAULT_DEPLOYMENT_ID: string;
    $publish: AsyncMacroServicePublisher;
    constructor($publish: AsyncMacroServicePublisher);
  }
}

export const VERSION: string;

export as namespace ZetaPush;
