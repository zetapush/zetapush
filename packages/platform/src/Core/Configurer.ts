import { Service } from './Service';

export class Configurer extends Service {
  static get DEPLOYMENT_TYPE() {
    return 'queue';
  }

  static get DEFAULT_DEPLOYMENT_ID() {
    return `${Configurer.DEPLOYMENT_TYPE}_0`;
  }

  protected $configure(
    parameters: object | null,
    deploymentId: string,
    verb: string,
  ) {
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
