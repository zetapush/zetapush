import { Provider } from '../Provider';
import { Gda } from '../Gda';
import * as zp from '../all_types';

/**Generic Data Access Service : NoSQL storage*/
export class GdaProvider extends Provider {
  /**
   * Administrative API for data access management.
   *
   * You can create and list tables
   * At the moment, no admin API is provided for data provisionning, but you can always use an initialization macro in your recipe.
   * */
  /**
   * Alters a table (adds columns)
   *
   * Alters an existing table, with the given columns.
   * The given columns are added to the existing list of columns.
   * The given columns MUST NOT exist.
   * Adding non existing columns WILL cause the whole table to be unavailable for up to one minute.
   * This API never deletes columns.
   * */
  async addColumns(body: zp.GdaTableModification): Promise<void> {
    return await this.provide(
      body,
      Gda.DEFAULT_DEPLOYMENT_ID,
      '/gda/addColumns',
    );
  }
  /**
   * Creates a new table
   *
   * Creates a table, with the given structure.
   * A table consists of a name and column definitions. You can provide as many columns as you wish.
   * This API never deletes columns.
   * */
  async createTable(body: zp.GdaTableModification): Promise<void> {
    return await this.provide(
      body,
      Gda.DEFAULT_DEPLOYMENT_ID,
      '/gda/createTable',
    );
  }
  /**
   * Lists tables
   *
   * Returns a non paginated list of all defined tables.
   * You can use this for a bulk export of your table definitions.
   * */
  async listTables(): Promise<zp.GdaTableStructure[]> {
    return await this.provide(
      null,
      Gda.DEFAULT_DEPLOYMENT_ID,
      '/gda/listTables',
    );
  }
  /**
   * Alters a table (removes columns)
   *
   * Alters an existing table, with the given removed columns.
   * The given columns are removed from the existing list of columns.
   * The given columns MUST exist.
   * */
  async removeColumns(body: zp.GdaRemoveColumns): Promise<void> {
    return await this.provide(
      body,
      Gda.DEFAULT_DEPLOYMENT_ID,
      '/gda/removeColumns',
    );
  }
  /**
   * Removes a table
   *
   * Removes an existing table.
   * */
  async removeTable(body: zp.GdaTableRemoval): Promise<void> {
    return await this.provide(
      body,
      Gda.DEFAULT_DEPLOYMENT_ID,
      '/gda/removeTable',
    );
  }
}
