export type ServicePublisher = (...args: any[]) => any;

/**
 * @access protected
 */
export class Service {
  public readonly contextId?: string;
  public readonly $publish: ServicePublisher;
  constructor({ $publish }: { $publish: ServicePublisher }) {
    this.$publish = $publish;
  }
}
