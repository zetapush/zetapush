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
  /**
   * Deletes data
   *
   * Deletes a document from the elasticsearch engine by id.
   * @access public
   * */
  delete(body: SearchDocumentId) {
    this.$publish('delete', body);
  }
  /**
   * Gets data
   *
   * Retrieves a document from the elasticsearch engine by id.
   * @access public
   * */
  get(body: SearchDocumentId): Promise<SearchData> {
    return this.$publish('get', body);
  }
  /**
   * Indexes data
   *
   * Inserts or updates a document into the elasticsearch engine.
   * @access public
   * */
  index(body: SearchData) {
    this.$publish('index', body);
  }
  /**
   * Searches for data
   *
   * @access public
   * */
  search(body: SearchRequest): Promise<SearchResults> {
    return this.$publish('search', body);
  }
}
