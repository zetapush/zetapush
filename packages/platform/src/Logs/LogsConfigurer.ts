import { Configurer } from '../Core/index';
import { Logs } from './Logs';
import { LogConfig, LogEntries, LogListRequest } from './LogsTypes';

/**json file based authentication*/
export class LogsConfigurer extends Configurer {
  /**
   * Administrative API for log management.
   *
   * You can configure and list logs
   * */
  /**
   * Configures the logs
   *
   * Creates a table, with the given structure.
   * A table consists of a name and column definitions. You can provide as many columns as you wish.
   * This API never deletes columns.
   * */
  configure(body: LogConfig): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Logs.DEFAULT_DEPLOYMENT_ID,
      '/logs/configure',
    );
  }
  /**List log entries*/
  list(body: LogListRequest): Promise<LogEntries> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Logs.DEFAULT_DEPLOYMENT_ID,
      '/logs/list',
    );
  }
}
