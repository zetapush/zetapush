import { Configurer } from '../Core/index';
import { Httpclient } from './Httpclient';
import { PageContent } from '../CommonTypes';
import { HttpClientTemplate } from './HttpclientTypes';

/**Web-service client. An admin records URL templates that can be called by users. Calls are not configurable by end-users. However an admin may leverage the macro service to achieve URL, headers and body configurability*/
export class HttpclientConfigurer extends Configurer {
  /**
   * Administrative API for the http client
   *
   * Here you can manage predefined http requests.
   * */
  /**
   * Stores a request
   *
   * Stores an http request template.
   * This API can only be used for static requests ; use the real-time API for dynamic behaviour.
   * */
  create(body: HttpClientTemplate): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Httpclient.DEFAULT_DEPLOYMENT_ID,
      'http/create'
    );
  }
  /**
   * Lists the requests
   *
   * Returns a paginated list of defined request templates.
   * */
  list(): Promise<PageContent<HttpClientTemplate>> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Httpclient.DEFAULT_DEPLOYMENT_ID,
      'http/list'
    );
  }
}
