import { Configurer } from '../Core/index';
import { Search } from './Search';
import { PageContent } from '../CommonTypes';
import { SearchIndex } from './SearchTypes';

/**ElasticSearch engine, to index and search data. An admin creates indices. Users index and search documents.*/
export class SearchConfigurer extends Configurer {
  /**Administrative API for elasticsearch index management*/
  /**
   * Creates an index
   *
   * Creates a new elasticsearch index, with the given mappings.
   * The settings fields only supports a sub-set of ES settings : analysis
   * */
  createIndex(body: SearchIndex): Promise<SearchIndex> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Search.DEFAULT_DEPLOYMENT_ID,
      '/search/createIndex'
    );
  }
  /**
   * Lists existing indices
   *
   * Returns a paginated list of existing indices.
   * */
  listIndices(): Promise<PageContent<SearchIndex>> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Search.DEFAULT_DEPLOYMENT_ID,
      '/search/listIndices'
    );
  }
}
