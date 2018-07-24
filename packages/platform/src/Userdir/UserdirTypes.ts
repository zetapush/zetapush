import { PageDirection, Pagination, StringAnyMap, StringObjectMap } from '../CommonTypes';

export interface UserInfoRequest {
  /**Set of user keys*/
  userKeys: string[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
}
export interface UserInfoResponse {
  /**Maps user keys to maps of their public data. Note that user data maps may have different formats for different authentication providers*/
  users?: StringObjectMap;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId?: string;
}
export interface UserSearchConfig {
  /**ES mappings for the 'users' type*/
  usersMapping?: StringAnyMap;
  /**ElasticSearch index settings.*/
  settings?: StringAnyMap;
}
export interface UserSearchRequest {
  /**Optional request ID*/
  requestId?: string;
  /**ElasticSearch filter*/
  filter?: StringAnyMap;
  /**Elasticsearch query*/
  query: StringAnyMap;
  /**Pagination information*/
  page?: Pagination;
}
export interface UserSearchResponse {
  /**Maps user keys to maps of their public data. Note that user data maps may have different formats for different authentication providers*/
  users?: StringObjectMap;
  /**Request ID, as given by the user*/
  requestId?: string;
  /**Requested pagination*/
  page?: Pagination;
  /**Total number of users matching the query*/
  totalHits?: number;
}
