import { DbHelper } from "../helper";
import { ResultSet } from "react-native-sqlite-storage";
import { insertsPlaceholder } from "../../utils";
import { IFindResponse } from "../../types/utils";

export type ColumnType = 'INTEGER' | 'TEXT' | 'TEXT PRIMARY KEY' | 'INTEGER PRIMARY KEY' | 'INTEGER PRIMARY KEY AUTOINCREMENT';
export type PrimaryKeyType = 'string' | 'number';
export type SearchType = 'string' | 'number';

export abstract class Model {
  protected static table: string;
  protected static primaryKey: string;
  protected static primaryKeyType: PrimaryKeyType;
  protected static schema: Record<string, ColumnType>;

  public static getTable(): string {
    return this.table;
  }

  public static getPrimaryKey(): string {
    return this.primaryKey;
  }

  public static getColumns(withPrmaryKey: boolean = true): string[] {
    return withPrmaryKey ? Object.keys(this.schema) : Object.keys(this.schema).filter(column => column !== this.primaryKey);
  }

  public static async executeSql(sql: string, params?: any[]): Promise<ResultSet[]> {
    try {
      return await DbHelper.execute(sql, params);
    } catch (error) {
      console.error('Model.executeSql() -->', error);
      throw error;
    }
  }

  public static async get<T>(sql: string): Promise<any[]> {
    return await DbHelper.get<T>(sql);
  }

  public static async first<T>(sql: string): Promise<IFindResponse<any>> {
    let response: any = {};
    try {
      sql += sql.toLowerCase().includes('limit') ? '': ' LIMIT 1';
      let retornoQuery = await DbHelper.find<T>(sql);
      response = retornoQuery ?? response;

      return {success: Object.keys(response).length > 0, data: response};
    } catch (error) {
      console.error('Model.first() -->', error);
      return {success:false, data: response, message: 'Nenhum registro encontrado!'};
    }
  };

  public static async all<T>(limit?: number): Promise<any[]> {
    try {
      let sql = `SELECT * FROM ${this.table}`;
      sql += limit ? ` LIMIT ${limit}` : '';

      return await DbHelper.get<T>(sql);
    } catch (error) {
      console.error('Model.all() -->', error);
      return [];
    }
  };

  public static async find<T>(id: number | string): Promise<IFindResponse<any>> {
    let response: any = {};
    try {
      let sql = `SELECT * FROM ${this.table} WHERE ${this.primaryKey} = `;
      sql += this.primaryKeyType == 'number' ? id : `'${id}'`;
      sql += ' LIMIT 1';

      let retornoQuery = await DbHelper.find<T>(sql);
      response = retornoQuery ?? response;

      return {success: Object.keys(response).length > 0, data: response};
    } catch (error) {
      console.error('Model.find() -->', error);
      return {success:false, data: response, message: 'Nenhum registro encontrado!'};
    }
  };

  public static async delete(ids: number | number[] | string | string[]): Promise<boolean> {
    try {
      let idsToDelete: (string | number)[] = Array.isArray(ids) ? ids : [ids];

      if (idsToDelete.length > 0) {
        idsToDelete = this.primaryKeyType == 'number' ? idsToDelete : idsToDelete.map(item => `'${item}'`);
        let sql = `DELETE FROM ${this.table} WHERE ${this.primaryKey} IN (${idsToDelete.join()})`;
        let result = await DbHelper.execute(sql);

        return result[0].rowsAffected > 0;
      }

      return false;
    } catch (error) {
      console.error('Model.deleteAll() -->', error);
      return false;
    }
  }

  public static async count(query?: string): Promise<number> {
    try {
      let sql = query ?? `SELECT COUNT(*) FROM ${this.table}`;
      let results: ResultSet[] = await DbHelper.execute(sql);

      return results[0].rows.item(0)['COUNT(*)'];
    } catch (error) {
      console.error('Model.count() -->', error);
      return 0;
    }
  }

  public static async where<T>(column: keyof typeof this.schema, values: number | number[] | string | string[], searchType: SearchType = 'number'): Promise<any[]> {
    try {
      let valuesToSeach: (string | number)[] = Array.isArray(values) ? values : [values];

      if (valuesToSeach.length > 0) {
        valuesToSeach = searchType == 'number' ? valuesToSeach : valuesToSeach.map(item => `'${item}'`);
        let sql = `SELECT * FROM ${this.table} WHERE ${column} IN (${valuesToSeach.join()})`;

        return await DbHelper.get<T>(sql);
      }

      return [];
    } catch (error) {
      console.error('Model.where() -->', error);
      return [];
    }
  };

  public static async whereNot<T>(column: keyof typeof this.schema, values: number | number[] | string | string[], searchType: SearchType = 'number'): Promise<any[]> {
    try {
      let valuesToSeach: (string | number)[] = Array.isArray(values) ? values : [values];

      if (valuesToSeach.length > 0) {
        valuesToSeach = searchType == 'number' ? valuesToSeach : valuesToSeach.map(item => `'${item}'`);
        let sql = `SELECT * FROM ${this.table} WHERE ${column} NOT IN (${valuesToSeach.join()}) LIMIT 10`;

        return await DbHelper.get<T>(sql);
      }

      return [];
    } catch (error) {
      console.error('Model.whereNot() -->', error);
      return [];
    }
  };

  public static async createTable(): Promise<boolean> {
    try {
      let columns = Object.entries(this.schema)
        .map(([colName, colType]) => `${colName} ${colType}`)
        .join(', ');

      const sql = `CREATE TABLE IF NOT EXISTS ${this.table} (${columns})`;

      await DbHelper.execute(sql);
      return true;
    } catch (error) {
      console.error('Model.createTable() -->', error);
      return false;
    }
  }

  public static async dropTable(): Promise<boolean> {
    try {
      const sql = `DROP TABLE IF EXISTS ${this.table}`;
      await DbHelper.execute(sql);
      return true;
    } catch (error) {
      console.error('Model.dropTable() -->', error);
      return false;
    }
  }

  public static async deleteAll(): Promise<boolean> {
    try {
      const sql = `DELETE FROM ${this.table}`;
      let result = await DbHelper.execute(sql);

      return result.length > 0;
    } catch (error) {
      console.error('Model.deleteAll() -->', error);
      return false;
    }
  }

  public static async insert(values: any | any[], insertWithPrmaryKey: boolean = true): Promise<boolean> {
    try {
      let {sql, params} = this.mountInsertScript(values, insertWithPrmaryKey);
      let result = await DbHelper.execute(sql, params);

      return result.length > 0;
    } catch (error) {
      console.error('Model.insert() -->', error);
      return false;
    }
  }

  public static async update<T>(values: any): Promise<boolean> {
    try {
      let sql = this.mountUpdateScript(values);
      let results = await DbHelper.execute(sql);

      return results[0].rowsAffected > 0;
    } catch (error) {
      console.error('Model.update() -->', error);
      return false;
    }
  }

  public static async exists(): Promise<boolean> {
    try {
      let sql = `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${this.table}'`;
      let results = await DbHelper.execute(sql);

      return results[0].rows.length > 0;
    } catch (error) {
      console.error('Model.exists() -->', error);
      throw error;
    }
  };

  public static async getWhereRaw<T>(condition: string):  Promise<any[]> {
    if (condition) {
      let sql =  `SELECT * FROM ${this.table}`;
      sql += condition.toLowerCase().includes('where') ? '' : ' WHERE';
      sql += ' ' + condition;

      return await DbHelper.get<T>(sql);
    }
    return [];
  }

  public static async getLike<T>(column: keyof typeof this.schema, value: number | string, columnType: SearchType = 'string'):  Promise<any[]> {
    let sql = `SELECT * FROM ${this.table} WHERE `;
    sql += columnType == 'string' ? column : `CAST(${column} AS TEXT)`;
    sql += ` LIKE '%${value}%'`;

    return await DbHelper.get<T>(sql);
  }

  public static async getByColumn<T>(column: keyof typeof this.schema, value: number | string, columnType: SearchType = 'string'):  Promise<any[]> {
    let sql = `SELECT * FROM ${this.table} WHERE ${column} = `;
    sql += columnType == 'string' ? `'${value}'`: value;

    return await DbHelper.get<T>(sql);
  }

  public static async getByColumns<T>(columns: (keyof typeof this.schema)[], values: any[]): Promise<any[]> {
    let sql = `SELECT * FROM ${this.table} `;

    columns.forEach((column, index) => {
      let prefix = index == 0 ? 'WHERE' : 'AND'
      sql += `${prefix} ${column} =  ${values[index]} `;
    });

    return await DbHelper.get<T>(sql);
  };

  public static async firstWhereRaw<T>(condition: string): Promise<IFindResponse<any>> {
    let response: any = {};
    try {
      if (condition) {
        let sql =  `SELECT * FROM ${this.table}`;
        sql += condition.toLowerCase().includes('where') ? '' : ' WHERE';
        sql += ' ' + condition;
        sql += condition.toLowerCase().includes('LIMIT') ? '' : '  LIMIT 1';

        let retornoQuery = await DbHelper.find<T>(sql);
        response = retornoQuery ?? response;
      }

      return {success: Object.keys(response).length > 0, data: response};
    } catch (error) {
      console.error('Model.firstWhereRaw() -->', error);
      return {success:false, data: response, message: 'Nenhum registro encontrado!'};
    }
  };

  public static async firstLike<T>(column: keyof typeof this.schema, value: number | string, columnType: SearchType = 'string'): Promise<IFindResponse<any>> {
    let response: any = {};
    try {
      let sql = `SELECT * FROM ${this.table} WHERE `;
      sql += columnType == 'string' ? column : `CAST(${column} AS TEXT)`;
      sql += ` LIKE '%${value}%'`;
      sql += ' LIMIT 1';

      let retornoQuery = await DbHelper.find<T>(sql);
      response = retornoQuery ?? response;

      return {success: Object.keys(response).length > 0, data: response};
    } catch (error) {
      console.error('Model.firstLike() -->', error);
      return {success:false, data: response, message: 'Nenhum registro encontrado!'};
    }
  };

  public static async firstByColumn<T>(column: keyof typeof this.schema, value: number | string, columnType: SearchType = 'string'): Promise<IFindResponse<any>> {
    let response: any = {};
    try {
      let sql = `SELECT * FROM ${this.table} WHERE ${column} = `;
      sql += columnType == 'string' ? `'${value}'`: value;
      sql += ' LIMIT 1';

      let retornoQuery = await DbHelper.find<T>(sql);
      response = retornoQuery ?? response;

      return {success: Object.keys(response).length > 0, data: response};
    } catch (error) {
      console.error('Model.firstByColumn() -->', error);
      return {success:false, data: response, message: 'Nenhum registro encontrado!'};
    }
  };

  public static async firstByColumns<T>(columns: (keyof typeof this.schema)[], values: any[]): Promise<IFindResponse<any>> {
    let response: any = {};
    try {
      let sql = `SELECT * FROM ${this.table} `;

      columns.forEach((column, index) => {
        let prefix = index == 0 ? 'WHERE' : 'AND'
        sql += `${prefix} ${column} =  ${values[index]} `;
      });
      sql += ' LIMIT 1';

      let retornoQuery = await DbHelper.find<T>(sql);
      response = retornoQuery ?? response;

      return {success: Object.keys(response).length > 0, data: response};
    } catch (error) {
      console.error('Model.firstByColumns() -->', error);
      return {success:false, data: response, message: 'Nenhum registro encontrado!'};
    }
  };

  public static mountInsertScript(values: any | any[], insertWithPrmaryKey: boolean = true): { sql: string; params: any[] } {
    values = Array.isArray(values) ? values : [values];
    let integerColumns = this.getIntegerColumns();

    // para itens em que a primaryKey é auto increment e ela não deve ser inclusa no script
    let columns = insertWithPrmaryKey ? Object.keys(this.schema) : Object.keys(this.schema).filter(column => column !== this.primaryKey);
    let template = insertsPlaceholder(columns.length, values.length);

    let sql =  `INSERT OR REPLACE INTO ${this.table} (${columns.join(', ')}) VALUES ${template}`;
    let params: any [] = this.mountInsertArray(values, integerColumns, columns);

    return {sql, params};
  }

  private static mountInsertArray(values: any[], integerColumns: string[], orderedColumns: string[]): any[][] {
    try {
      return values.map((item) => {
        return orderedColumns.map((column) => {
          let value = item[column];
          if (integerColumns.includes(column)) {
            return value ? Number(value) : null;
          }
          return value;
        });
      });
    } catch (error) {
      console.error('Model.mountInsertArray() -->', error);
      throw error;
    }
  }

  private static getIntegerColumns(): string[]  {
    let integerColumns: string[] = [];
    Object.entries(this.schema).forEach(([colName, colType]) => {
      if (colType.includes('INTEGER')) {
        integerColumns.push(colName);
      }
    });

    return integerColumns;
  }

  public static mountUpdateScript(values: object): string  {
    let insertValues: string = '';
    Object.keys(values).forEach((key) => {
      if (key != this.primaryKey) {
        insertValues += `${key} = '${values[key]}', `;
      }
    })

    // Remover vírgula e espaço do final da string
    insertValues = insertValues.slice(0, -2);
    return `UPDATE ${this.table} SET ${insertValues} WHERE ${this.primaryKey} = ${values[this.primaryKey]}`;
  }
}
