import { getType } from './types';
import { BaseError } from '../error';
import { trace } from './log';

type Task = Function;

export class TimeoutError extends BaseError {
  public code: string;
  public taskName: string;
  public taskSource: string;

  constructor(message: string, public timeout: number, task: Task, public details?: string) {
    super(message);
    this.code = 'TIMEOUT';
    this.taskName = task.name;
    this.taskSource = typeof (<any>task).toSource === 'undefined' ? task.toString() : (<any>task).toSource();
  }
}

/**
 * Wrap async function execution in timeout
 * @param {() => Promise<any>} task
 * @param {number} timeout
 */
export const timeoutify = (task: Task, timeout = 1000, details = '') =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new TimeoutError(`Timeout reached after ${timeout}ms ${details}`, timeout, task, details)),
      timeout
    );
    try {
      const response = task();
      if (getType(response) === Promise.name) {
        return response.then(
          (...success: any[]) => (clearInterval(timer), resolve(...success)),
          (...failed: any[]) => (clearInterval(timer), reject(...failed))
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
