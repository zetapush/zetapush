/**
 * Producer consumer
 *
 * Producer consumer service
 *  Users can submit tasks and other users consume them
 * */
/**
 * Producer / consumer real-time API
 *
 * Task producers submits their tasks.
 * The server dispatches the tasks.
 * Consumers process them and report completion back to the server.
 * Tasks are global to the service (i.e. NOT per user).
 * @access public
 * */
export class Queue extends Service {
  /**
   * Get default deployment id associated to Queue service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'queue_0';
  }
  /**
   * Submits a task
   *
   * Producer API.
   * A task producer submits the given task to the server.
   * The server will find a tasker with processing capacity and dispatch the task.
   * The task result will be returned to the caller.
   * When called from inside a macro, the comsumer generated result is available for further use.
   * */
  call({ description, originBusinessId, originDeploymentId, data, owner }) {
    return this.$publish('call', {
      description,
      originBusinessId,
      originDeploymentId,
      data,
      owner,
    });
  }
  /**
   * Notifies completion of a task
   *
   * Consumer API.
   * The tasker notifies completion of the given task to the server.
   * The tasker can optionally include a result or an error code.
   * */
  done({ result, taskId, success }) {
    return this.$publish('done', { result, taskId, success });
  }
  /**
   * Registers a consumer
   *
   * Consumer API.
   * Registers the current user resource as an available task consumer.
   * Tasks will be then dispatched to that consumer.
   * */
  register({ capacity }) {
    return this.$publish('register', { capacity });
  }
  /**
   * Submits a task
   *
   * Producer API.
   * A task producer submits the given task to the server.
   * The server will find a tasker with processing capacity and dispatch the task.
   * The task result will be ignored : the producer will not receive any notification of any kind, even in case of errors (including capacity exceeded errors).
   * This verb will return immediately : you can use this API to asynchronously submit a task.
   * */
  submit({ description, originBusinessId, originDeploymentId, data, owner }) {
    return this.$publish('submit', {
      description,
      originBusinessId,
      originDeploymentId,
      data,
      owner,
    });
  }
  /**
   * Unregisters a consumer
   *
   * Consumer API.
   * Unregisters the current user resource as an available task consumer.
   * All non finished tasks are returned to the server.
   * */
  unregister() {
    return this.$publish('unregister', {});
  }
}
