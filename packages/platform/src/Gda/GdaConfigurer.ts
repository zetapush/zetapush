import { Configurer } from '../Core/index';
import { Gda } from './Gda';
import { GdaRemoveColumns, GdaTableModification, GdaTableRemoval, GdaTableStructure } from './GdaTypes';

/**Generic Data Access Service : NoSQL storage*/
export class GdaConfigurer extends Configurer {
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
  addColumns(body: GdaTableModification): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Gda.DEFAULT_DEPLOYMENT_ID,
      '/gda/addColumns'
    );
  }
  /**
   * Creates a new table
   *
   * Creates a table, with the given structure.
   * A table consists of a name and column definitions. You can provide as many columns as you wish.
   * This API never deletes columns.
   * */
  createTable(body: GdaTableModification): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Gda.DEFAULT_DEPLOYMENT_ID,
      '/gda/createTable'
    );
  }
  /**
   * Lists tables
   *
   * Returns a non paginated list of all defined tables.
   * You can use this for a bulk export of your table definitions.
   * */
  listTables(): Promise<GdaTableStructure[]> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Gda.DEFAULT_DEPLOYMENT_ID,
      '/gda/listTables'
    );
  }
  /**
   * Alters a table (removes columns)
   *
   * Alters an existing table, with the given removed columns.
   * The given columns are removed from the existing list of columns.
   * The given columns MUST exist.
   * */
  removeColumns(body: GdaRemoveColumns): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Gda.DEFAULT_DEPLOYMENT_ID,
      '/gda/removeColumns'
    );
  }
  /**
   * Removes a table
   *
   * Removes an existing table.
   * */
  removeTable(body: GdaTableRemoval): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Gda.DEFAULT_DEPLOYMENT_ID,
      '/gda/removeTable'
    );
  }
}
