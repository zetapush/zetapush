import { Service } from '../Core/index';
import {
  CronPlanning,
  CronTaskDeletion,
  CronTaskListRequest,
  CronTaskRequest,
  TimerRequest,
  TimerResult,
} from './CronTypes';

/**
 * Scheduler
 *
 * Scheduler service
 *  End-users can schedule one-time or repetitive tasks using a classical cron syntax (with the year field) or a timestamp (milliseconds from the epoch)
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
    return 'cron_0';
  }
  /**
   * User API for the Scheduler
   *
   * User endpoints for scheduling : users can schedule, list and delete tasks.
   * Tasks are stored on a per-user basis: a task will run with the priviledges of the user who stored it.
   * Tasks are run on the server and thus can call api verbs marked as server-only.
   * @access public
   * */
  /**
   * List the configured tasks
   *
   * Returns a paginated list of the asking user's tasks.
   * @access public
   * */
  list(body: CronTaskListRequest): Promise<CronPlanning> {
    return this.$publish('list', body);
  }
  /**
   * Schedules a task
   *
   * Schedules a task for later execution. Tasks are executed asynchronously with the identity of the calling user.
   * Tasks will be executed at a fixed moment in time in the future, or repeatedly, with minute precision.
   * If a task already exists with the same cronName (a cronName is unique for a given user), this new task completely replaces it.
   * A task can be scheduled with a cron-like syntax for repetitive or one-shot execution.
   * Wildcards are not allowed for minutes and hours.
   * When scheduling for one-shot execution, the time must be at least two minutes into the future.
   * @access public
   * */
  schedule(body: CronTaskRequest): Promise<CronTaskRequest> {
    return this.$publish('schedule', body);
  }
  /**
   * Schedules a task
   *
   * Schedules a task for later execution. Tasks are executed asynchronously with the identity of the calling user.
   * Tasks will be executed with second precision in the near future (120 seconds delay max).
   * @access public
   * */
  setTimeout(body: TimerRequest): Promise<TimerResult> {
    return this.$publish('setTimeout', body);
  }
  /**
   * Removes a scheduled task
   *
   * Removes a previously scheduled task.
   * Does absolutely nothing if asked to remove a non-existent task.
   * @access public
   * */
  unschedule(body: CronTaskDeletion): Promise<CronTaskDeletion> {
    return this.$publish('unschedule', body);
  }
}
