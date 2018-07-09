export interface RdbmsQuery {
  /**Parameters of the query*/
  parameters?: any[];
  /**SQL query*/
  statement?: string;
}
export interface RdbmsResultSet {}
export interface RdbmsSimpleQuery {
  /**SQL query*/
  statement?: string;
}
