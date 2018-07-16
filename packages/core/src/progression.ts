import { Config } from './common-types';

import { fetch } from './utils/network';
import { log, error, info, warn, trace, debugObject } from './utils/log';

import { EventEmitter } from 'events';

/**
 * Get deployment progression for a given recipe id (aka deployment token)
 * @param {Object} config
 * @param {String} recipeId
 */
const getProgress = (config: Config, recipeId: string) =>
  fetch({
    config,
    method: 'GET',
    pathname: `orga/recipe/status/${config.appName}/${recipeId}`,
  }).then((progress) => {
    trace('progress', progress.progressDetail);
    return progress;
  });

/**
 * Get Application live status
 * @param {Object} config
 */
export const getLiveStatus = (config: Config) =>
  fetch({
    config,
    method: 'GET',
    pathname: `orga/business/live/${config.appName}`,
  }).then((response) => {
    const nodes = Object.values(response.nodes);
    return nodes.reduce((reduced, node: any) => {
      const contexts = node.liveData['jetty.local.static.files.contexts'] || [];
      return {
        ...reduced,
        ...contexts.reduce((acc: any, context: any) => {
          acc[context.name] = context.urls;
          return acc;
        }, {}),
      };
    }, {});
  });

export interface ProgressionInfo {
  progressDetail: any;
  config: Config;
  recipeId: string;
}
export interface ProgressionSuccess {
  front: any;
  progressDetail: any;
  config: Config;
  recipeId: string;
}

export interface ProgressionError {
  progressDetail?: any;
  config: Config;
  recipeId: string;
  cause: ProgressFailureCauses;
  failure?: any;
}

export enum ProgressEvents {
  /**
   * Event that is triggered when progression update is received.
   * The data associated to this event is a ProgressionInfo.
   *
   * @see {ProgressionInfo}
   */
  PROGRESSION = 'progression',
  /**
   * Event that is triggered when there is an error:
   * - either when the server indicates that there is an unrecoverable error (cause will be ProgressFailureCauses.UNRECOVERABLE_ERRORS)
   * - or when the server has succeeded but gathering additional information has failed (cause will be ProgressFailureCauses.LIVE_STATUS_FAILED)
   * - or when the progression can't be retrieved from server after 10 retries (cause will be ProgressFailureCauses.PROGRESSION_UNAVAILABLE)
   *
   * The data associated to this event is a ProgressionError.
   *
   * @see {ProgressionError}
   * @see {ProgressFailureCauses}
   */
  FAILED = 'failed',
  /**
   * Event that is triggered when the deployment has suceeded.
   * The data associated to this event is a ProgressionSuccess.
   *
   * @see {ProgressionSuccess}
   */
  SUCCESS = 'success',
}

export enum ProgressFailureCauses {
  UNRECOVERABLE_ERRORS = 'UNRECOVERABLE_ERRORS',
  LIVE_STATUS_FAILED = 'LIVE_STATUS_FAILED',
  PROGRESSION_UNAVAILABLE = 'PROGRESSION_UNAVAILABLE',
  PROGRESSION_RETRYING = 'PROGRESSION_RETRYING',
}

/**
 * Ask the state of the progression for the deployment represented by the parameter `recipeId`.
 * The progression doesn't return anything but instead will emit events.
 *
 * @param config The ZetaPush configuration (login/password, appName...)
 * @param recipeId The identifier of either the recipe or the deployment. This is the identifier provided by the server when requesting a deployment.
 * @return {EventEmitter} event emitter to be notified about progression
 *
 * @fires ProgressEvents#PROGRESSION
 * @fires ProgressEvents#FAILED
 * @fires ProgressEvents#SUCCESS
 */
export const getDeploymentProgression = (config: Config, recipeId: string) => {
  const events = new EventEmitter();

  let remainingRetries = 10;

  (async function check() {
    try {
      const { progressDetail } = await getProgress(config, recipeId);
      const { finished, hasUnrecoverableErrors } = progressDetail;
      events.emit(ProgressEvents.PROGRESSION, {
        progressDetail,
        config,
        recipeId,
      });

      if (!finished && !hasUnrecoverableErrors) {
        setTimeout(check, 500);
      } else if (hasUnrecoverableErrors) {
        events.emit(ProgressEvents.FAILED, {
          cause: ProgressFailureCauses.UNRECOVERABLE_ERRORS,
          progressDetail,
          config,
          recipeId,
        });
        events.removeAllListeners();
      } else {
        getLiveStatus(config)
          .then((fronts) => {
            events.emit(ProgressEvents.SUCCESS, {
              fronts,
              progressDetail,
              config,
              recipeId,
            });
          })
          .catch((failure) => {
            events.emit(ProgressEvents.FAILED, {
              cause: ProgressFailureCauses.LIVE_STATUS_FAILED,
              failure,
              progressDetail,
              config,
              recipeId,
            });
            events.removeAllListeners();
          });
      }
    } catch (ex) {
      debugObject('progression check', { ex });
      if (remainingRetries-- > 0) {
        events.emit(ProgressEvents.FAILED, {
          cause: ProgressFailureCauses.PROGRESSION_RETRYING,
          failure: ex,
          config,
          recipeId,
          remainingRetries,
        });
        setTimeout(check, 500);
      } else {
        events.emit(ProgressEvents.FAILED, {
          cause: ProgressFailureCauses.PROGRESSION_UNAVAILABLE,
          failure: ex,
          config,
          recipeId,
        });
        events.removeAllListeners();
      }
    }
  })();

  return events;
};

export const checkQueueServiceDeployed = (
  config: Config,
  recipeId: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    (async function checkDeployed() {
      try {
        const { progressDetail } = await getProgress(config, recipeId);
        const { finished } = progressDetail;

        if (!finished) {
          setTimeout(checkDeployed, 2500);
        } else {
          resolve(recipeId);
        }
      } catch (ex) {
        error('Progression', ex);
        reject({ failure: ex, config, recipeId });
      }
    })();
  });
};
