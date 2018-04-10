import { Service } from '../core/index.js';

/**
 * Scheduler
 *
 * Scheduler service
 *  End-users can schedule one-time or repetitive tasks using a classical cron syntax (with the year field) or a timestamp (milliseconds from the epoch)
 * */
/**
 * User API for the Scheduler
 *
 * User endpoints for scheduling : users can schedule, list and delete tasks.
 * Tasks are stored on a per-user basis: a task will run with the priviledges of the user who stored it.
 * Tasks are run on the server and thus can call api verbs marked as server-only.
 * @access public
 * */
export class Cron extends Service {
  /**
   * Get deployment type associated to Cron service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'cron';
  }
  /**
   * Get default deployment id associated to Cron service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return `${Cron.DEPLOYMENT_TYPE}_0`;
  }
  /**
   * List the configured tasks
   *
   * Returns a paginated list of the asking user's tasks.
   * */
  list({ start, stop, owner, page }) {
    return this.$publish('list', { start, stop, owner, page });
  }
}
