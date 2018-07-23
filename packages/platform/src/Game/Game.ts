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
  /**
   * Notify the result for a join request
   *
   * A Game Engine notifies the STR of the result of a join request that it received on join_callback
   * @access public
   * */
  join_result(body: GameJoinResponse) {
    return this.$publish('join_result', body);
  }
  /**
   * Notify the result for an organization request
   *
   * A Game Engine notifies the STR of the result of an organization request that it received on organize_callback
   * @access public
   * */
  organize_result(body: GameOrganizationResponse) {
    return this.$publish('organize_result', body);
  }
  /**
   * Registers a game engine
   *
   * A client registers itself to the STR as a Game Engine.
   * The STR may, from now on, dispatch game of the given game type to said client.
   * Unregistration is done automatically on logoff.
   * @access public
   * */
  register(body: GameRunnerRegistration) {
    return this.$publish('register', body);
  }
  /**
   * Notify the result for a start request
   *
   * A Game Engine notifies the STR of the result of a start request that it received on start_callback
   * @access public
   * */
  start_result(body: GameStart) {
    return this.$publish('start_result', body);
  }
  /**
   * Notify a game event
   *
   * A Game Engine notifies the STR of some arbitrary game event.
   * @access public
   * */
  state(body: GameState) {
    return this.$publish('state', body);
  }
  /**
   * Notify the result for an unjoin request
   *
   * A Game Engine notifies the STR of the result of an unjoin request that it received on unjoin_callback
   * @access public
   * */
  unjoin_result(body: GameJoinResponse) {
    return this.$publish('unjoin_result', body);
  }
  /**
   * User API for games
   *
   * Users can list, start, join games, and play.
   * @access public
   * */
  /**
   * Lists game types
   *
   * Returns the list of game types supported by the server and the currently registered game engines.
   * @access public
   * */
  available(): Promise<GameInfo[]> {
    return this.$publish('available');
  }
  /**
   * A user joins a game
   *
   * @access public
   * */
  join(body: GameJoin) {
    return this.$publish('join', body);
  }
  /**
   * Organizes a game
   *
   * @access public
   * */
  organize(body: GameOrganization) {
    return this.$publish('organize', body);
  }
  /**
   * Gives some command to the game engine
   *
   * @access public
   * */
  play(body: GamePlay) {
    return this.$publish('play', body);
  }
  /**
   * Starts a game
   *
   * @access public
   * */
  start(body: GameStart) {
    return this.$publish('start', body);
  }
  /**
   * A user cancels joining a game
   *
   * @access public
   * */
  unjoin(body: GameJoin) {
    return this.$publish('unjoin', body);
  }
}
