import { Bootstrapable, Context, Injectable } from '@zetapush/core';
import { LogsConfigurer, LogLevel, LogSinkType, Queue } from '@zetapush/platform-legacy';

@Injectable()
export class LoggerConfig implements Bootstrapable  {
  constructor(
    private $logs: LogsConfigurer
  ) {}
  async onApplicationBootstrap(context?: Context) {
    return this.$logs.configure({
      rootLoggerConfig: {
        level: LogLevel.TRACE,
        sinkNames: [
          'internal',
          'realtime'
        ]
      },
      sinkConfigs: [
        {
          name: 'internal',
          sinkType: LogSinkType.INTERNAL
        },
        {
          name: 'realtime',
          sinkType: LogSinkType.REAL_TIME
        }
      ],
      loggers: [
        {
          level: LogLevel.DEBUG,
          logger: `${Queue.DEFAULT_DEPLOYMENT_ID}.done`
        }
      ]
    });
  }
}