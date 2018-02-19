/**
 * Search engine
 *
 * ElasticSearch engine, to index and search data
 *  An admin creates indices
 *  Users index and search documents
 *
 * */
/**
 * ElasticSearch Service
 *
 * This API is a very thin wrapper around ElasticSearch's API.
 * @access public
 * */
export class Search extends Service {
  /**
   * Get default deployment id associated to Search service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'search_0';
  }
  /**
   * Deletes data
   *
   * Deletes a document from the elasticsearch engine by id.
   * */
  delete({ type, id, index }) {
    return this.$publish('delete', { type, id, index });
  }
  /**
   * Gets data
   *
   * Retrieves a document from the elasticsearch engine by id.
   * */
  get({ type, id, index }) {
    return this.$publish('get', { type, id, index });
  }
  /**
   * Indexes data
   *
   * Inserts or updates a document into the elasticsearch engine.
   * */
  index({ type, id, index, data }) {
    return this.$publish('index', { type, id, index, data });
  }
  /**Searches for data*/
  search({ indices, query, sort, page, types }) {
    return this.$publish('search', { indices, query, sort, page, types });
  }
}
