import { getType } from './types';

/**
 * Wrap async function execution in timeout
 * @param {() => Promise<any>} task
 * @param {number} timeout
 */
export const timeoutify = (task, timeout = 1000) => (...parameters) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(
          Object.assign(new Error(`Timeout reached after ${timeout}ms`), {
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
