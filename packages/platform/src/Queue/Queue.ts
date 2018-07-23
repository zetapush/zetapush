import { Service } from '../Core/index';
import {
  TaskCompletion,
  TaskConsumerRegistration,
  TaskRequest,
  WorkerAdminBulkRequest,
  WorkerAdminBulkResponse,
  WorkerAdminBulkServiceCreation,
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
    return 'queue_0';
  }
  /**
   * Producer / consumer real-time API
   *
   * Task producers submits their tasks.
   * The server dispatches the tasks.
   * Consumers process them and report completion back to the server.
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
   * The tasker notifies completion of the given task to the server.
   * The tasker can optionally include a result or an error code.
   * @access public
   * */
  done(body: TaskCompletion) {
    return this.$publish('done', body);
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
  register(body: TaskConsumerRegistration) {
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
    return this.$publish('submit', body);
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
    return this.$publish('unregister');
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
  createServices(
    body: WorkerAdminBulkServiceCreation,
  ): Promise<WorkerAdminBulkResponse> {
    return this.$publish('createServices', body);
  }
}
