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
  call(body: TaskRequest): Promise<TaskCompletion> {
    return this.$publish('call', body);
  }
  done(body: TaskCompletion) {
    return this.$publish('done', body);
  }
  register(body: TaskConsumerRegistration) {
    return this.$publish('register', body);
  }
  submit(body: TaskRequest) {
    return this.$publish('submit', body);
  }
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
  admin(body: WorkerAdminBulkRequest): Promise<WorkerAdminBulkResponse> {
    return this.$publish('admin', body);
  }
  createServices(
    body: WorkerAdminBulkServiceCreation,
  ): Promise<WorkerAdminBulkResponse> {
    return this.$publish('createServices', body);
  }
}
