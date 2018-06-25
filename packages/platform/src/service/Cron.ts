import { Service } from '../core/index';
import { Impersonable, PageContent, Paginable } from '../../es';

type CronLikeExpression = string | number;

type CronTaskParameter = {
  [property: string]: any;
};

export interface CronPlanning {
  /** Cron planning request */
  request: CronTaskListRequest;
  /** List of all tasks matching the request */
  tasks: PageContent<CronTaskRequest>;
}

export interface CronTaskListRequest extends Impersonable, Paginable {
  /** Start timestamp for the task list. Not implemented */
  start: number;
  /** Stop timestamp for the task list. Not implemented */
  stop: number;
}

export interface CronTaskDeletion extends Impersonable {
  /** Cron identifier. mandatory for creation or update. */
  cronName: string;
}

export interface CronTaskRequest extends Impersonable {
  /** Cron identifier. mandatory for creation or update. */
  cronName: string;
  /** Cron-like expression (with fixed minutes and hours) or unix timestamp (as milliseconds from the epoch). Times are UTC. */
  schedule: CronLikeExpression;
  /** Parameter that will be passed to the target verb when called. The format is the format accepted by the target. */
  parameter?: CronTaskParameter;
  /** Max number of executions. */
  stop?: number;
  /** DeploymentId of the target service. */
  deploymentId: string;
  /** Verb to be called within the target service. */
  verb: string;
  /** Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false */
  loud?: boolean;
}

export interface TimerRequest extends Impersonable {
  /** Parameter that will be passed to the target verb when called. The format is the format accepted by the target. */
  parameter?: CronTaskParameter;
  /** DeploymentId of the target service. */
  deploymentId: string;
  /** Verb to be called within the target service. */
  verb: string;
  /** Delay in seconds before calling the given API. Must be a integer between 1 and 120. */
  delay?: number;
  /** Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false */
  loud?: boolean;
}

export interface TimerResult {
  /** Timer identifier */
  id: string;
}

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
  list({
    start,
    stop,
    owner,
    page,
  }: CronTaskListRequest): Promise<CronPlanning> {
    return this.$publish('list', { start, stop, owner, page });
  }
  /**
   * Schedules a task for later execution. Tasks are executed asynchronously with the identity of the calling user.
   * Tasks will be executed at a fixed moment in time in the future, or repeatedly, with minute precision.
   * If a task already exists with the same cronName (a cronName is unique for a given user), this new task completely replaces it.
   * A task can be scheduled with a cron-like syntax for repetitive or one-shot execution.
   * Wildcards are not allowed for minutes and hours.
   * When scheduling for one-shot execution, the time must be at least two minutes into the future.
   * */
  schedule({
    cronName,
    schedule,
    parameter,
    stop,
    deploymentId,
    owner,
    verb,
    loud,
  }: CronTaskRequest): Promise<CronTaskRequest> {
    return this.$publish('schedule', {
      cronName,
      schedule,
      parameter,
      stop,
      deploymentId,
      owner,
      verb,
      loud,
    });
  }
  /**
   * Schedules a task for later execution. Tasks are executed asynchronously with the identity of the calling user.
   * Tasks will be executed with second precision in the near future (120 seconds delay max).
   * */
  setTimeout({
    parameter,
    deploymentId,
    owner,
    verb,
    delay,
    loud,
  }: TimerRequest): Promise<TimerResult> {
    return this.$publish('setTimeout', {
      parameter,
      deploymentId,
      owner,
      verb,
      delay,
      loud,
    });
  }
  /**
   * Removes a previously scheduled task.
   * Does absolutely nothing if asked to remove a non-existent task.
   * */
  unschedule({ cronName, owner }: CronTaskDeletion): Promise<CronTaskDeletion> {
    return this.$publish('unschedule', { cronName, owner });
  }
}
