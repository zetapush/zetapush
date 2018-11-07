import { Service } from '../Core/index';
import {
  TaskCompletion,
  TaskConsumerConfiguration,
  TaskConsumerRegistration,
  TaskProgress,
  TaskRequest,
  WorkerAdminBulkRequest,
  WorkerAdminBulkResponse,
  WorkerAdminBulkServiceCreation,
  WorkerStartupContext
} from './QueueTypes';

/**
 * Producer consumer
 *
 * Producer consumer service
 *  Users can submit tasks and other users consume them
 * */
export class Queue extends Service {
  /**
   * Get deployment type associated to Queue service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'queue';
  }
  /**
   * Get default deployment id associated to Queue service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'worker';
  }
  /**
   * Producer / consumer real-time API
   *
   * Task producers submits their tasks (by calling 'call' or 'submit').
   * The server dispatches the tasks, on a notification channel, which is often 'dispatch'.
   * Consumers process them and report completion back to the server on the 'done' channel.
   * Tasks are global to the service (i.e. NOT per user).
   * @access public
   * */
  /**
   * Submits a task
   *
   * Producer API.
   * A task producer submits the given task to the server.
   * The server will find a tasker with processing capacity and dispatch the task.
   * The task result will be returned to the caller.
   * When called from inside a macro, the consumer generated result is available for further use.
   * @access public
   * */
  call(body: TaskRequest): Promise<TaskCompletion> {
    return this.$publish('call', body);
  }
  /**
   * Notifies completion of a task
   *
   * Consumer API.
   * The worker notifies completion of the given task to the server.
   * The worker can optionally include a result or an error code.
   * @access public
   * */
  done(body: TaskCompletion) {
    this.$publish('done', body);
  }
  /**
   * Reports progress for a task
   *
   * Consumer API.
   * A worker might call this API any number of times for a given taskId, between the start of the task and the call to 'done'.
   * Calling 'progress' is entirely optional and is just informative.
   * @access public
   * */
  progress(body: TaskProgress) {
    this.$publish('progress', body);
  }
  /**
   * Registers a consumer
   *
   * Consumer API.
   * Registers the current user resource as an available task consumer.
   * Tasks will be then dispatched to that consumer.
   * IMPORTANT : after a disconnect and a new handshake, consumers must register again.
   * @access public
   * */
  register(body: TaskConsumerRegistration): Promise<TaskConsumerConfiguration> {
    return this.$publish('register', body);
  }
  /**
   * Submits a task
   *
   * Producer API.
   * A task producer submits the given task to the server.
   * The server will find a tasker with processing capacity and dispatch the task.
   * The task result will be ignored : the producer will not receive any notification of any kind, even in case of errors (including capacity exceeded errors).
   * This verb will return immediately : you can use this API to asynchronously submit a task.
   * @access public
   * */
  submit(body: TaskRequest) {
    this.$publish('submit', body);
  }
  /**
   * Unregisters a consumer
   *
   * Consumer API.
   * Unregisters the current user resource as an available task consumer.
   * All non finished tasks are returned to the server.
   * Consumers that disconnect from the STR will be automatically unregistered from this service.
   * @access public
   * */
  unregister() {
    this.$publish('unregister');
  }
  /**
   * Admin API when the queue service is used to provide server-side workers
   *
   * Task producers submits their tasks.
   * The server dispatches the tasks.
   * @access public
   * */
  /**
   * Makes several admin API calls at once.
   *
   * Calls are made sequentially in the given order.
   * There is no rollback if something goes wrong.
   * @access public
   * */
  admin(body: WorkerAdminBulkRequest): Promise<WorkerAdminBulkResponse> {
    return this.$publish('admin', body);
  }
  /**
   * Creates several services
   *
   * Configures missing services, restarts modified services.
   * Does not touch existing services with the same exact configuration.
   * There is no rollback if something goes wrong.
   * This cannot be used to redeploy the current service.
   * @access public
   * */
  createServices(body: WorkerAdminBulkServiceCreation): Promise<WorkerAdminBulkResponse> {
    return this.$publish('createServices', body);
  }
  /**
   * Returns information about currently deployed app fragments.
   *
   * @access public
   * */
  getContext(): Promise<WorkerStartupContext> {
    return this.$publish('getContext');
  }
}
