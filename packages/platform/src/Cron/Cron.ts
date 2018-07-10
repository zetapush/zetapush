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
  list(body: CronTaskListRequest): Promise<CronPlanning> {
    return this.$publish('list', body);
  }
  schedule(body: CronTaskRequest): Promise<CronTaskRequest> {
    return this.$publish('schedule', body);
  }
  setTimeout(body: TimerRequest): Promise<TimerResult> {
    return this.$publish('setTimeout', body);
  }
  unschedule(body: CronTaskDeletion): Promise<CronTaskDeletion> {
    return this.$publish('unschedule', body);
  }
}
