/**
 * @access protected
 */
export class Service {
  protected $publish: any;
  constructor({ $publish }) {
    this.$publish = $publish;
  }
}
