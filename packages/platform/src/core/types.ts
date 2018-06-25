export interface Impersonable {
  /** Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user */
  owner?: string;
}

export interface Paginable {
  /** Pagination information */
  page?: Pagination;
}

export interface PageContent<T> {
  /** Content */
  content: T[];
  /** Pagination information */
  page: Pagination;
}

export type PageDirection = 'ASC' | 'DESC';

export interface Pagination {
  /** Page size (minimum 1) */
  pageSize?: number;
  /** Page number (zero-based) */
  pageNumber?: number;
  /** Sort direction. Default is ASC when not specified. */
  direction?: PageDirection;
}

export type Resource = string;

export type Target = string | string[];

export type UserKey = string;
