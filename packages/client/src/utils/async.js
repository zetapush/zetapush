import { getType } from './types';

export class TimeoutError extends Error {}

/**
 * Wrap async function execution in timeout
 * @param {() => Promise<any>} task
 * @param {number} timeout
 */
export function timeoutify(task, timeout = 1000, details = '') {
  return function(...parameters) {
    return new Promise(function(resolve, reject) {
      const timer = setTimeout(
        () =>
          reject(
            Object.assign(new TimeoutError(`Timeout reached after ${timeout}ms ${details}`), {
              code: 'TIMEOUT'
            })
          ),
        timeout
      );
      try {
        const response = task(...parameters);
        if (getType(response) === Promise.name) {
          return response.then(
            (...success) => (clearInterval(timer), resolve(...success)),
            (...failed) => (clearInterval(timer), reject(...failed))
          );
        } else {
          clearInterval(timer);
          return resolve(response);
        }
      } catch (error) {
        clearInterval(timer);
        return reject(error);
      }
    });
  };
}
