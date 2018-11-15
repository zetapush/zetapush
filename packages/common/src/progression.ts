import { Config, WorkerDeclaration } from './common-types';

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
    debugName: 'getProgress'
  }).then((progress) => {
    trace('progress', progress.progressDetail);
    return progress;
  });

/**
 * Get Application live status
 * @param {Object} config
 */
export const getLiveStatus = (config: Config, debugName = 'getLiveStatus') =>
  fetch({
    config,
    method: 'GET',
    pathname: `orga/business/live/${config.appName}`,
    debugName
  }).then((response) => {
    log(`getLiveStatus`, response);
    const nodes = Object.values(response.nodes);
    let numberOfWorkers;
    return nodes.reduce(
      (reduced, node: any) => {
        const fronts = node.liveData['static.files.hosting'] || {};
        const workers = node.liveData['worker.deployer'] || {};
        numberOfWorkers = workers.length;
        return {
          fronts,
          workers
        };
      },
      {
        fronts: {},
        workers: {}
      }
    );
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
  SUCCESS = 'success'
}

export enum ProgressFailureCauses {
  UNRECOVERABLE_ERRORS = 'UNRECOVERABLE_ERRORS',
  LIVE_STATUS_FAILED = 'LIVE_STATUS_FAILED',
  PROGRESSION_UNAVAILABLE = 'PROGRESSION_UNAVAILABLE',
  PROGRESSION_RETRYING = 'PROGRESSION_RETRYING'
}

export const defaultBackoff = (delay: number, remainingRetries: number, maxRetries: number) => {
  if (remainingRetries == maxRetries) {
    return delay;
  }
  return delay * 2;
};

/**
 * Ask the state of the progression for the deployment represented by the parameter `recipeId`.
 * The progression doesn't return anything but instead will emit events.
 *
 * When progresion can't be retrieved, the progression will be retried with backoff policy.
 * By default, the backoff policy will work like this:
 * - 1st retry after 500ms
 * - 2nd retry after 1s
 * - 3rd retry after 2s
 * - 4th retry after 4s
 * - 5th retry after 8s
 * - ...
 *
 * @param config The ZetaPush configuration (login/password, appName...)
 * @param recipeId The identifier of either the recipe or the deployment. This is the identifier provided by the server when requesting a deployment.
 * @return {EventEmitter} event emitter to be notified about progression
 *
 * @fires ProgressEvents#PROGRESSION
 * @fires ProgressEvents#FAILED
 * @fires ProgressEvents#SUCCESS
 */
export const getDeploymentProgression = (
  config: Config,
  recipeId: string,
  pollDelay = 500,
  maxRetries = 10,
  retryBackoff: (currentDelay: number, remainingRetries: number, maxRetries: number) => number = defaultBackoff
) => {
  const events = new EventEmitter();

  let remainingRetries = maxRetries;
  let currentDelay = pollDelay;

  (async function check() {
    try {
      const { progressDetail } = await getProgress(config, recipeId);
      const { finished, hasUnrecoverableErrors } = progressDetail;
      remainingRetries = maxRetries;
      currentDelay = pollDelay;

      events.emit(ProgressEvents.PROGRESSION, {
        progressDetail,
        config,
        recipeId
      });

      if (!finished && !hasUnrecoverableErrors) {
        setTimeout(check, pollDelay);
      } else if (hasUnrecoverableErrors) {
        debugObject('unrecoverable-errors', { progressDetail, config, recipeId });
        events.emit(ProgressEvents.FAILED, {
          cause: ProgressFailureCauses.UNRECOVERABLE_ERRORS,
          progressDetail,
          config,
          recipeId
        });
        // events.removeAllListeners();
      } else {
        getLiveStatus(config)
          .then((status) => {
            events.emit(ProgressEvents.SUCCESS, {
              ...status,
              progressDetail,
              config,
              recipeId
            });
          })
          .catch((failure) => {
            events.emit(ProgressEvents.FAILED, {
              cause: ProgressFailureCauses.LIVE_STATUS_FAILED,
              failure,
              progressDetail,
              config,
              recipeId
            });
            // events.removeAllListeners();
          });
      }
    } catch (ex) {
      debugObject('progression-check', { ex });
      if (!isFatalServerError(ex) && remainingRetries-- > 0) {
        currentDelay = retryBackoff(currentDelay, remainingRetries, maxRetries);
        events.emit(ProgressEvents.FAILED, {
          cause: ProgressFailureCauses.PROGRESSION_RETRYING,
          failure: ex,
          config,
          recipeId,
          retry: {
            remainingRetries,
            maxRetries,
            next: currentDelay
          }
        });
        setTimeout(check, currentDelay);
      } else {
        events.emit(ProgressEvents.FAILED, {
          cause: ProgressFailureCauses.PROGRESSION_UNAVAILABLE,
          failure: ex,
          config,
          recipeId
        });
        // events.removeAllListeners();
      }
    }
  })();

  return events;
};

const isFatalServerError = (ex: any) => {
  try {
    return ex.statusCode === 409 && JSON.parse(ex.body).code === 'NOT_FOUND';
  } catch (e) {
    return false;
  }
};

export const checkQueueServiceDeployed = (
  config: Config,
  recipeId: string,
  pollDelay = 500,
  maxRetries = 10,
  retryBackoff: (currentDelay: number, remainingRetries: number, maxRetries: number) => number = defaultBackoff
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let remainingRetries = maxRetries;
    let currentDelay = pollDelay;

    (async function checkDeployed() {
      try {
        const { progressDetail } = await getProgress(config, recipeId);
        const { finished, hasUnrecoverableErrors } = progressDetail;
        remainingRetries = maxRetries;
        currentDelay = pollDelay;

        if (!finished && !hasUnrecoverableErrors) {
          setTimeout(checkDeployed, pollDelay);
        } else if (hasUnrecoverableErrors) {
          reject({
            cause: ProgressFailureCauses.UNRECOVERABLE_ERRORS,
            progressDetail,
            config,
            recipeId
          });
        } else {
          resolve(recipeId);
        }
      } catch (ex) {
        if (!isFatalServerError(ex) && remainingRetries-- > 0) {
          currentDelay = retryBackoff(currentDelay, remainingRetries, maxRetries);
          setTimeout(checkDeployed, currentDelay);
        } else {
          error('Progression', ex);
          reject({ failure: ex, config, recipeId });
        }
      }
    })();
  });
};
