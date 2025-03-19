import { DbHelper } from "../helper";
import { ResultSet } from "react-native-sqlite-storage";
import { insertsPlaceholder } from "../../utils";
import { IFindResponse } from "../../types/utils";

export type ColumnType = 'INTEGER' | 'TEXT' | 'TEXT PRIMARY KEY' | 'INTEGER PRIMARY KEY' | 'INTEGER PRIMARY KEY AUTOINCREMENT';
export type PrimaryKeyType = 'string' | 'number';
export type SearchType = 'string' | 'number';

export abstract class Model {
  protected static tableName: string;
  protected static primaryKey: string;
  protected static primaryKeyType: PrimaryKeyType;
  protected static schema: Record<string, ColumnType>;

  public static getTableName(): string {
    return this.tableName;
  }

  public static getPrimaryKey(): string {
    return this.primaryKey;
  }

  public static async executeSql(sql: string):  Promise<ResultSet[]> {
    try {
      return await DbHelper.execute(sql);
    } catch (error) {
      throw error;
    }
  }

  public static async get<T>(sql: string):  Promise<any[]> {
    return await DbHelper.get<T>(sql);
  }

  public static async first<T>(sql: string): Promise<IFindResponse<any>> {
    let response: any = {};
    try {
      let retornoQuery = await DbHelper.find<T>(sql);
      response = retornoQuery ?? response;

      return {success: Object.keys(response).length > 0, data: response};
    } catch (error) {
      return {success:false, data: response, message: 'Nenhum registro encontrado!'};
    }
  };

  public static async all<T>(limit?: number): Promise<any[]> {
    try {
      let sql = `SELECT * FROM ${this.tableName}`;
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
      let sql = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = `;
      sql += this.primaryKeyType == 'number' ? id : `'${id}'`;

      let retornoQuery = await DbHelper.find<T>(sql);
      response = retornoQuery ?? response;

      return {success: Object.keys(response).length > 0, data: response};
    } catch (error) {
      return {success:false, data: response, message: 'Nenhum registro encontrado!'};
    }
  };

  public static async createTable(): Promise<boolean> {
    try {
      let columns = Object.entries(this.schema)
        .map(([colName, colType]) => `${colName} ${colType}`)
        .join(', ');

      const sql = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${columns})`;

      await DbHelper.execute(sql);
      return true;
    } catch (error) {
      console.error('Model.createTable() -->', error);
      return false;
    }
  }

  public static async dropTable(): Promise<boolean> {
    try {
      const sql = `DROP TABLE IF EXISTS ${this.tableName}`;
      await DbHelper.execute(sql);
      return true;
    } catch (error) {
      console.error('Model.dropTable() -->', error);
      return false;
    }
  }

  public static async deleteAll(): Promise<boolean> {
    try {
      const sql = `DELETE FROM ${this.tableName}`;
      let result = await DbHelper.execute(sql);

      return result.length > 0;
    } catch (error) {
      console.error('Model.deleteAll() -->', error);
      return false;
    }
  }

  public static async insert(values: any | any[], insertWithPrmaryKey: boolean = true): Promise<boolean> {
    try {
      values = Array.isArray(values) ? values : [values];
      let integerColumns = this.getIntegerColumns();

      // para itens em que a primaryKey é auto incremente e ela não deve ser inclusa no script
      let columns = insertWithPrmaryKey ? Object.keys(this.schema) : Object.keys(this.schema).filter(column => column !== this.primaryKey);

      let template = insertsPlaceholder(columns.length, values.length);

      let sql =  `INSERT OR REPLACE INTO ${this.tableName} (${columns.join(', ')}) VALUES ${template}`;
      let params: any [] = this.mountInsertArray(values, integerColumns, columns);

      let result = await DbHelper.execute(sql, params);
      return result.length > 0;
    } catch (error) {
      console.error(`Erro ao inserir dados em ${this.tableName}:`, error);
      return false;
    }
  }

  public static async findByColumn<T>(column: string, value: number | string, columnType: SearchType = 'string'): Promise<IFindResponse<any>> {
    let response: any = {};
    try {
      let sql = `SELECT * FROM ${this.tableName} WHERE ${column} = `;
      sql += columnType == 'string' ? `'${value}'`: value;

      let retornoQuery = await DbHelper.find<T>(sql);
      response = retornoQuery ?? response;

      return {success: Object.keys(response).length > 0, data: response};
    } catch (error) {
      return {success:false, data: response, message: 'Nenhum registro encontrado!'};
    }
  };

  public static async findByColumns<T>(columns: string[], values: any[]): Promise<IFindResponse<any>> {
    let response: any = {};
    try {
      let sql = `SELECT * FROM ${this.tableName} `;

      columns.forEach((column, index) => {
        let prefix = index == 0 ? 'WHERE' : 'AND'
        sql += `${prefix} ${column} =  ${values[index]} `;

        console.log('\x1b[1m\x1b[34m%s\x1b[0m', 'index --> ', index);
        console.log('\x1b[1m\x1b[34m%s\x1b[0m', 'sql --> ', `${prefix} ${column} =  ${values[index]} `);
      });

      let retornoQuery = await DbHelper.find<T>(sql);
      response = retornoQuery ?? response;

      return {success: Object.keys(response).length > 0, data: response};
    } catch (error) {
      return {success:false, data: response, message: 'Nenhum registro encontrado!'};
    }
  };

  public static async findLike<T>(column: string, value: number | string, columnType: SearchType = 'string'): Promise<IFindResponse<any>> {
    let response: any = {};
    try {
      let sql = `SELECT * FROM ${this.tableName} WHERE `;
      sql += columnType == 'string' ? column : `CAST(${column} AS TEXT)`;
      sql += ` LIKE '%${value}%'`;

      let retornoQuery = await DbHelper.find<T>(sql);
      response = retornoQuery ?? response;

      return {success: Object.keys(response).length > 0, data: response};
    } catch (error) {
      return {success:false, data: response, message: 'Nenhum registro encontrado!'};
    }
  };

  public static async getLike<T>(column: string, value: number | string, columnType: SearchType = 'string'):  Promise<any[]> {
    let sql = `SELECT * FROM ${this.tableName} WHERE `;
    sql += columnType == 'string' ? column : `CAST(${column} AS TEXT)`;
    sql += ` LIKE '%${value}%'`;

    return await DbHelper.get<T>(sql);
  }

  private static mountInsertArray(values: any[], integerColumns: string[], orderedColumns: string[]): any[][] {
    try {
      return values.map((item) => {
        return orderedColumns.map((column) => {
          const value = item[column];
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
    const integerColumns: string[] = [];
    Object.entries(this.schema).forEach(([colName, colType]) => {
      if (colType.includes('INTEGER')) {
        integerColumns.push(colName);
      }
    });

    return integerColumns;
  }
}
