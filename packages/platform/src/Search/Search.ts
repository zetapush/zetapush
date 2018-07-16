import { Service } from '../Core/index';
import { SearchData, SearchDocumentId, SearchRequest, SearchResults } from './SearchTypes';

/**
 * Search engine
 *
 * ElasticSearch engine, to index and search data
 *  An admin creates indices
 *  Users index and search documents
 *
 * */
export class Search extends Service {
  /**
   * Get deployment type associated to Search service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'search';
  }
  /**
   * Get default deployment id associated to Search service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'search_0';
  }
  /**
   * ElasticSearch Service
   *
   * This API is a very thin wrapper around ElasticSearch's API.
   * @access public
   * */
  delete(body: SearchDocumentId) {
    return this.$publish('delete', body);
  }
  get(body: SearchDocumentId): Promise<SearchData> {
    return this.$publish('get', body);
  }
  index(body: SearchData) {
    return this.$publish('index', body);
  }
  search(body: SearchRequest): Promise<SearchResults> {
    return this.$publish('search', body);
  }
}
