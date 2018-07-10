import { Service } from '../Core/index';
import {
  GameInfo,
  GameJoin,
  GameJoinResponse,
  GameOrganization,
  GameOrganizationResponse,
  GamePlay,
  GameRunnerRegistration,
  GameStart,
  GameState,
} from './GameTypes';

/**
 * Game engine
 *
 * Abstract Game Engine
 *  Concrete game engines are remote cometd clients or internal macros
 * */
export class Game extends Service {
  /**
   * Get deployment type associated to Game service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'game';
  }
  /**
   * Get default deployment id associated to Game service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'game_0';
  }
  /**
   * Game Engine API
   *
   * The Game Engine API is for game engine clients, not end-users.
   * @access public
   * */
  join_result(body: GameJoinResponse) {
    return this.$publish('join_result', body);
  }
  organize_result(body: GameOrganizationResponse) {
    return this.$publish('organize_result', body);
  }
  register(body: GameRunnerRegistration) {
    return this.$publish('register', body);
  }
  start_result(body: GameStart) {
    return this.$publish('start_result', body);
  }
  state(body: GameState) {
    return this.$publish('state', body);
  }
  unjoin_result(body: GameJoinResponse) {
    return this.$publish('unjoin_result', body);
  }
  /**
   * User API for games
   *
   * Users can list, start, join games, and play.
   * @access public
   * */
  available(): Promise<GameInfo[]> {
    return this.$publish('available');
  }
  join(body: GameJoin) {
    return this.$publish('join', body);
  }
  organize(body: GameOrganization) {
    return this.$publish('organize', body);
  }
  play(body: GamePlay) {
    return this.$publish('play', body);
  }
  start(body: GameStart) {
    return this.$publish('start', body);
  }
  unjoin(body: GameJoin) {
    return this.$publish('unjoin', body);
  }
}
