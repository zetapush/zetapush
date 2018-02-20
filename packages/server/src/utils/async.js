/**
 * Wrap async function execution in timeout
 * @param {() => Promise<any>} task
 * @param {number} timeout
 */
export const timeoutify = (task, timeout = 1000) =>
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
    return task().then(
      (...success) => (clearInterval(timer), resolve(...success)),
      (...failed) => (clearInterval(timer), reject(...failed)),
    );
  });
