import { getType } from './types';

type Task = Function;

/**
 * Wrap async function execution in timeout
 * @param {() => Promise<any>} task
 * @param {number} timeout
 */
export const timeoutify = (task: Task, timeout = 1000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(
          Object.assign(new Error(`Timeout reached after ${timeout}ms`), {
            code: 'TIMEOUT',
          }),
        ),
      timeout,
    );
    try {
      const response = task();
      if (getType(response) === Promise.name) {
        return response.then(
          (...success: any[]) => (clearInterval(timer), resolve(...success)),
          (...failed: any[]) => (clearInterval(timer), reject(...failed)),
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
