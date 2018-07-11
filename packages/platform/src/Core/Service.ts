export type ServicePublisher = (...args: any[]) => any;

/**
 * @access protected
 */
export class Service {
  protected $publish: ServicePublisher;
  constructor({ $publish }: { $publish: ServicePublisher }) {
    this.$publish = $publish;
  }
}
