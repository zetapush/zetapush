export type ServicePublisher = (...args: any[]) => any;

/**
 * @access protected
 */
export class Service {
  protected readonly contextId?: string;
  protected readonly $publish: ServicePublisher;
  constructor({ $publish }: { $publish: ServicePublisher }) {
    this.$publish = $publish;
  }
}
