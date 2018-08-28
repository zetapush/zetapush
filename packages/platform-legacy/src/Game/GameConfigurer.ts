import { Configurer } from '../Core/index';
import { Game } from './Game';
import { GameRunnerRegistration } from './GameTypes';

/**Abstract Game Engine. Concrete game engines are remote cometd clients or internal macros*/
export class GameConfigurer extends Configurer {
  /**
   * Experimental API for administrative game engine macros registration.
   *
   * EXPERIMENTAL. DO NOT actually use in production.
   * */
  /**
   * Registers a game engine
   *
   * Registers the coordinates of a game engine.
   * */
  registerGame(body: GameRunnerRegistration): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Game.DEFAULT_DEPLOYMENT_ID,
      'game/registerGame'
    );
  }
}
