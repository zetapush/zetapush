const CLOUD_SERVICE_INSTANCE = Symbol('ZetaPush.CloudServiceInstance');

export class CloudServiceInstance {
  static is(instance: any): boolean {
    return instance && instance[CLOUD_SERVICE_INSTANCE] === true;
  }
  static flag(instance: any): any {
    instance[CLOUD_SERVICE_INSTANCE] = true;
    return instance;
  }
}
