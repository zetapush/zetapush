import { StringAnyMap, StringStringMap } from '../CommonTypes';

export interface GameInfo {
  /**Game description*/
  description?: string;
  /**Available commands when playing*/
  commands?: StringStringMap;
  /**Game type identifier*/
  name?: string;
  /**Available options whan creating*/
  options?: StringStringMap;
}
export interface GameJoin {
  /**Optional role for the player. Meaning is game specific*/
  role?: string;
  /**Server attributed game identifier*/
  gameId?: string;
  /**User unique key*/
  userId?: string;
  /**Player name inside the game*/
  userName?: string;
}
export interface GameJoinResponse {
  /**unique ID for this message, matching the request ID*/
  msgId?: string;
  /**response payload*/
  payload?: GameJoin;
  /**error message*/
  error?: string;
  /**caller ID from the original request*/
  callerId?: string;
}
export interface GameJoinWithCallback {
  /**unique ID for this message*/
  msgId?: string;
  /**message payload*/
  payload?: GameJoin;
  /**callback info*/
  callerId?: string;
}
export interface GameOrganization {
  /**Game type*/
  type: GameType;
  /**Game identifier*/
  gameId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
  /**Game creation options*/
  options?: StringAnyMap;
}
export interface GameOrganizationResponse {
  /**unique ID for this message, matching the request ID*/
  msgId?: string;
  /**response payload*/
  payload?: GameOrganization;
  /**error message*/
  error?: string;
  /**caller ID from the original request*/
  callerId?: string;
}
export interface GameOrganizationWithCallback {
  /**unique ID for this message*/
  msgId?: string;
  /**message payload*/
  payload?: GameOrganization;
  /**callback info*/
  callerId?: string;
}
export interface GamePlay {
  /**Server attributed game identifier*/
  gameId?: string;
  /**User unique key*/
  userId?: string;
  /**Game-specific data*/
  data?: StringAnyMap;
}
export interface GameRunnerFullLocation {
  /**Session identifier of the game engine. Server-attributed*/
  sessionId?: string;
  /**Reserved for future use*/
  requestChannel?: string;
  /**Reserved for future use*/
  responseChannel?: string;
  /**Seti identifier of the game engine. Server-attributed*/
  setiId?: string;
}
export interface GameRunnerRegistration {
  /**Maximum number of simultaneous games that the registering runner can handle*/
  maxGames?: number;
  /**Game Type information*/
  gameInfo: GameInfo;
  /**Location of the engine. The server will fill it if left null.*/
  location?: GameRunnerFullLocation;
}
export interface GameStart {
  /**Server attributed game identifier*/
  gameId?: string;
}
export interface GameState {
  /**Current game status*/
  status?: GameStatus;
  /**Server attributed game identifier*/
  gameId?: string;
  /**Game specific data*/
  data?: StringAnyMap;
}
export enum GameStatus {
  /**The game is running*/
  RUNNING = 'RUNNING',
  /**The game is finished*/
  FINISHED = 'FINISHED',
  /**The game has been created*/
  CREATED = 'CREATED',
  /**The game is starting*/
  STARTING = 'STARTING',
}
export interface GameType {
  /**Game description*/
  description?: string;
  /**Game type identifier*/
  name?: string;
}
