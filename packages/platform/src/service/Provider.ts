import { Service } from '../core/index';

export class Provider extends Service {
  static get DEPLOYMENT_TYPE() {
    return 'queue';
  }

  static get DEFAULT_DEPLOYMENT_ID() {
    return `${Provider.DEPLOYMENT_TYPE}_0`;
  }

  async provide(parameters: object, deploymentId: string, verb: string) {
    return this.$publish('admin', {
      requests: [
        {
          parameters,
          deploymentId,
          verb,
        },
      ],
    });
  }
}
