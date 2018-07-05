import { Provider } from '../Provider';
import { Search } from '../Search';
import * as zp from '../all_types';

/**ElasticSearch engine, to index and search data. An admin creates indices. Users index and search documents.*/
export class SearchProvider extends Provider {
  /**Administrative API for elasticsearch index management*/
  /**
   * Creates an index
   *
   * Creates a new elasticsearch index, with the given mappings.
   * The settings fields only supports a sub-set of ES settings : analysis
   * */
  async createIndex(body: zp.SearchIndex): Promise<zp.SearchIndex> {
    return await this.provide(
      body,
      Search.DEFAULT_DEPLOYMENT_ID,
      '/search/createIndex',
    );
  }
  /**
   * Lists existing indices
   *
   * Returns a paginated list of existing indices.
   * */
  async listIndices(): Promise<zp.PageContent<zp.SearchIndex>> {
    return await this.provide(
      null,
      Search.DEFAULT_DEPLOYMENT_ID,
      '/search/listIndices',
    );
  }
}
