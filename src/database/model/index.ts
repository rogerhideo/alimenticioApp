import { ResultSet } from 'react-native-sqlite-storage';
import { DbHelper } from '../helper';

export type ColumnType =
  'INTEGER' |
  'TEXT' |
  'REAL' |
  'CHAR' |
  'DATE' |
  'DATETIME' |
  'TEXT PRIMARY KEY' |
  'INTEGER PRIMARY KEY' |
  'INTEGER PRIMARY KEY AUTOINCREMENT' |
  'INTEGER NOT NULL PRIMARY KEY' |
  'TEXT NOT NULL' |
  'INTEGER NOT NULL' |
  'REAL NOT NULL' |
  'DATE DEFAULT CURRENT_TIMESTAMP' |
  'DATETIME DEFAULT CURRENT_TIMESTAMP' |
  "CHAR DEFAULT 'S'" |
  "CHAR DEFAULT 'N'" |
  "CHAR NOT NULL DEFAULT 'N'" |
  "CHAR NOT NULL DEFAULT 'S'"
  ;

export abstract class Model {
  protected static table: string;
  protected static primaryKey: keyof typeof this.schema;
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

  public static async get<T>(sql: string, params?: any[]): Promise<T[]> {
    return await DbHelper.get<T>(sql, params);
  }

  public static async first<T>(sql: string, params?: any[]): Promise<T | null> {
    try {
      sql += sql.toLowerCase().includes('limit') ? '': ' LIMIT 1';
      let retornoQuery = await DbHelper.find<T>(sql, params);
      return retornoQuery ?? null;
    } catch (error) {
      console.error('Model.first() -->', error);
      return null;
    }
  };

  // public static async first<T>(sql: string, params?: any[]): Promise<IFindResponse<any>> {
  //   let response: any = {};
  //   try {
  //     sql += sql.toLowerCase().includes('limit') ? '': ' LIMIT 1';
  //     let retornoQuery = await DbHelper.find<T>(sql, params);
  //     response = retornoQuery ?? response;
  //
  //     return {success: Object.keys(response).length > 0, data: response};
  //   } catch (error) {
  //     console.error('Model.first() -->', error);
  //     return {success:false, data: response, message: 'Nenhum registro encontrado!'};
  //   }
  // };

  public static async all<T>(limit?: number): Promise<T[]> {
    try {
      let sql = `SELECT * FROM ${this.table}`;
      sql += limit ? ` LIMIT ${limit}` : '';

      return await DbHelper.get<T>(sql);
    } catch (error) {
      console.error('Model.all() -->', error);
      return [];
    }
  };

  public static async find<T>(id: number | string): Promise<T | null> {
    try {
      let sql = `SELECT * FROM ${this.table} WHERE ${this.primaryKey} = ?`;
      sql += ' LIMIT 1';

      return await DbHelper.find<T>(sql, [id]);
    } catch (error) {
      console.error('Model.find() -->', error);
      return null;
    }
  };

  // public static async find<T>(id: number | string): Promise<IFindResponse<any>> {
  //   let response: any = {};
  //   try {
  //     let sql = `SELECT * FROM ${this.table} WHERE ${this.primaryKey} = ? `;
  //     sql += ' LIMIT 1';
  //
  //     let retornoQuery = await DbHelper.find<T>(sql, [id]);
  //     response = retornoQuery ?? response;
  //
  //     return {success: Object.keys(response).length > 0, data: response};
  //   } catch (error) {
  //     console.error('Model.find() -->', error);
  //     return {success:false, data: response, message: 'Nenhum registro encontrado!'};
  //   }
  // };

  public static async delete(ids: number | number[] | string | string[]): Promise<boolean> {
    try {
      let idsToDelete: (string | number)[] = Array.isArray(ids) ? ids : [ids];

      if (idsToDelete.length > 0) {
        const bindingTemplate = Array(idsToDelete.length).fill('?').join(', ');
        const sql = `DELETE FROM ${this.table} WHERE ${this.primaryKey} IN (${bindingTemplate})`;
        const result = await DbHelper.execute(sql, idsToDelete);

        return result[0].rowsAffected > 0;
      }

      return false;
    } catch (error) {
      console.error('Model.delete() -->', error);
      return false;
    }
  }

  public static async count(query?: string, params?: any[]): Promise<number> {
    try {
      let sql = query ?? `SELECT COUNT(*) FROM ${this.table}`;
      let results: ResultSet[] = await DbHelper.execute(sql, params);

      return results[0].rows.item(0)['COUNT(*)'];
    } catch (error) {
      console.error('Model.count() -->', error);
      return 0;
    }
  }

  public static async whereColumn<T>(column: keyof typeof this.schema, values: number | number[] | string | string[]): Promise<T[]> {
    try {
      return await this.getWhereColumn(column, values);
    } catch (error) {
      console.error('Model.whereColumn() -->', error);
      return [];
    }
  };

  public static async getWhereColumn<T>(column: keyof typeof this.schema, values: number | number[] | string | string[]): Promise<T[]> {
    try {
      let valuesToSeach: (string | number)[] = Array.isArray(values) ? values : [values];
      if (valuesToSeach.length > 0) {
        const bindingTemplate = Array(valuesToSeach.length).fill('?').join(', ');
        let sql = `SELECT * FROM ${this.table} WHERE ${column} IN (${bindingTemplate})`;

        return await DbHelper.get<T>(sql, valuesToSeach);
      }

      return [];
    } catch (error) {
      console.error('Model.whereColumn() -->', error);
      return [];
    }
  };

  public static async where<T>(params: Record<keyof typeof this.schema, number | number[] | string | string[]>): Promise<T[]> {
    try {
      return await this.getWhere(params);
    } catch (error) {
      console.error('Model.where() -->', error);
      return [];
    }
  };

  public static async getWhere<T>(params: Record<keyof typeof this.schema, number | number[] | string | string[]>): Promise<T[]> {
    try {
      let { whereClause, bindingParams } = this.mountWhereClause(params);
      if (!whereClause) {
        return[]
      }

      let sql = `SELECT * FROM ${this.table} WHERE ${whereClause} `;
      return await DbHelper.get<T>(sql, bindingParams);
    } catch (error) {
      console.error('Model.getWhere() -->', error);
      return [];
    }
  };

  public static async firstWhere<T>(params: Record<keyof typeof this.schema, number | number[] | string | string[]>): Promise<T | null> {
    try {
      let { whereClause, bindingParams } = this.mountWhereClause(params);
      if (!whereClause) {
        return null;
      }

      let sql = `SELECT * FROM ${this.table} WHERE ${whereClause} LIMIT 1`;
      return await DbHelper.find<T>(sql, bindingParams);
    } catch (error) {
      console.error('Model.firstWhere() -->', error);
      return null;
    }
  };

  public static async whereNot<T>(params: Record<keyof typeof this.schema, number | number[] | string | string[]>): Promise<T[]> {
    try {
      return await this.getWhereNot(params);
    } catch (error) {
      console.error('Model.whereNot() -->', error);
      return [];
    }
  };

  public static async getWhereNot<T>(params: Record<keyof typeof this.schema, number | number[] | string | string[]>): Promise<T[]> {
    try {
      let { whereClause, bindingParams } = this.mountWhereClause(params, 'NOT IN');
      if (!whereClause) {
        return [];
      }

      let sql = `SELECT * FROM ${this.table} WHERE ${whereClause}`;
      return await DbHelper.get<T>(sql, bindingParams);
    } catch (error) {
      console.error('Model.getWhereNot() -->', error);
      return [];
    }
  };

  public static async firstWhereNot<T>(params: Record<keyof typeof this.schema, number | number[] | string | string[]>): Promise<T | null> {
    try {
      let { whereClause, bindingParams } = this.mountWhereClause(params, 'NOT IN');
      if (!whereClause) {
        return null;
      }

      let sql = `SELECT * FROM ${this.table} WHERE ${whereClause} LIMIT 1`;
      return await DbHelper.find<T>(sql, bindingParams);
    } catch (error) {
      console.error('Model.firstWhereNot() -->', error);
      return null;
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

  /**
   * @param values any | any[] - valores a serem inseridos
   * @param insertWithPrmaryKey boolean - false para casos onde a primary key é auto increment e o valor não é preenchido
   * @returns boolean
   */
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

  public static async update<T>(values: any, params?: any[]): Promise<boolean> {
    try {
      let {sql, params} = this.mountUpdateScript(values);
      let results = await DbHelper.execute(sql, params);

      return results[0].rowsAffected > 0;
    } catch (error) {
      console.error('Model.update() -->', error);
      return false;
    }
  }

  public static async tableExists(): Promise<boolean> {
    try {
      let sql = `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${this.table}'`;
      let results = await DbHelper.execute(sql);

      return results[0].rows.length > 0;
    } catch (error) {
      console.error('Model.exists() -->', error);
      throw error;
    }
  };

  public static async getWhereRaw<T>(condition: string):  Promise<T[]> {
    if (condition) {
      let sql =  `SELECT * FROM ${this.table}`;
      sql += condition.toLowerCase().includes('where') ? '' : ' WHERE';
      sql += ' ' + condition;

      return await DbHelper.get<T>(sql);
    }
    return [];
  }

  public static async getLike<T>(column: keyof typeof this.schema, value: number | string):  Promise<T[]> {
    let sql = `SELECT * FROM ${this.table} WHERE `;
    sql += this.isIntegerColumn(column) ? `CAST(${column} AS TEXT)` : column;
    sql += ` LIKE ?`;
    let params = [`%${value}%`];

    return await DbHelper.get<T>(sql, [params]);
  }

  public static async getByColumn<T>(column: keyof typeof this.schema, value: number | string):  Promise<T[]> {
    let sql = `SELECT * FROM ${this.table} WHERE ${column} = ?`;
    return await DbHelper.get<T>(sql, [value]);
  }

  // public static async getByColumns<T>(columns: (keyof typeof this.schema)[], values: any[]): Promise<T[]> {
  //   let sql = `SELECT * FROM ${this.table} `;
  //
  //   columns.forEach((column, index) => {
  //     let prefix = index == 0 ? 'WHERE' : 'AND'
  //     sql += `${prefix} ${column} = ? `;
  //   });
  //
  //   return await DbHelper.get<T>(sql, values);
  // };

  public static async firstWhereRaw<T>(condition: string): Promise<T | null> {
    try {
      if (condition) {
        let sql =  `SELECT * FROM ${this.table}`;
        sql += condition.toLowerCase().includes('where') ? '' : ' WHERE';
        sql += ' ' + condition;
        sql += condition.toLowerCase().includes('limit') ? '' : '  LIMIT 1';

        let retornoQuery = await DbHelper.find<T>(sql);
        return retornoQuery ?? null;
      }

      return null;
    } catch (error) {
      console.error('Model.firstWhereRaw() -->', error);
      return null;
    }
  };

  // public static async firstWhereRaw<T>(condition: string): Promise<IFindResponse<any>> {
  //   let response: any = {};
  //   try {
  //     if (condition) {
  //       let sql =  `SELECT * FROM ${this.table}`;
  //       sql += condition.toLowerCase().includes('where') ? '' : ' WHERE';
  //       sql += ' ' + condition;
  //       sql += condition.toLowerCase().includes('limit') ? '' : '  LIMIT 1';
  //
  //       let retornoQuery = await DbHelper.find<T>(sql);
  //       response = retornoQuery ?? response;
  //     }
  //
  //     return {success: Object.keys(response).length > 0, data: response};
  //   } catch (error) {
  //     console.error('Model.firstWhereRaw() -->', error);
  //     return {success:false, data: response, message: 'Nenhum registro encontrado!'};
  //   }
  // };

  public static async firstLike<T>(column: keyof typeof this.schema, value: number | string): Promise<T | null> {
    try {
      let sql = `SELECT * FROM ${this.table} WHERE `;
      sql += this.isIntegerColumn(column) ? `CAST(${column} AS TEXT)` : column;
      sql += " LIKE ? LIMIT 1";
      let params = [`%${value}%`];

      let retornoQuery = await DbHelper.find<T>(sql, params);
      return  retornoQuery ?? null;
    } catch (error) {
      console.error('Model.firstLike() -->', error);
      return null;
    }
  };

  // public static async firstLike<T>(column: keyof typeof this.schema, value: number | string): Promise<IFindResponse<any>> {
  //   let response: any = {};
  //   try {
  //     let sql = `SELECT * FROM ${this.table} WHERE `;
  //     sql += this.isIntegerColumn(column) ? `CAST(${column} AS TEXT)` : column;
  //     sql += " LIKE ? LIMIT 1";
  //     let params = [`%${value}%`];
  //
  //     let retornoQuery = await DbHelper.find<T>(sql, params);
  //     response = retornoQuery ?? response;
  //
  //     return {success: Object.keys(response).length > 0, data: response};
  //   } catch (error) {
  //     console.error('Model.firstLike() -->', error);
  //     return {success:false, data: response, message: 'Nenhum registro encontrado!'};
  //   }
  // };

  public static async firstWhereolumn<T>(column: keyof typeof this.schema, value: number | string): Promise<T | null> {
    try {
      let sql = `SELECT * FROM ${this.table} WHERE ${column} = ? LIMIT 1`;

      let retornoQuery = await DbHelper.find<T>(sql,  [value]);
      return retornoQuery ?? null;
    } catch (error) {
      console.error('Model.firstByColumn() -->', error);
      return null;
    }
  };

  // public static async firstByColumn<T>(column: keyof typeof this.schema, value: number | string): Promise<IFindResponse<any>> {
  //   let response: any = {};
  //   try {
  //     let sql = `SELECT * FROM ${this.table} WHERE ${column} = ? LIMIT 1`;
  //
  //     let retornoQuery = await DbHelper.find<T>(sql,  [value]);
  //     response = retornoQuery ?? response;
  //
  //     return {success: Object.keys(response).length > 0, data: response};
  //   } catch (error) {
  //     console.error('Model.firstByColumn() -->', error);
  //     return {success:false, data: response, message: 'Nenhum registro encontrado!'};
  //   }
  // };

  // public static async firstByColumns<T>(columns: (keyof typeof this.schema)[], values: any[]): Promise<T | null> {
  //   try {
  //     let sql = `SELECT * FROM ${this.table} `;
  //
  //     columns.forEach((column, index) => {
  //       let prefix = index == 0 ? 'WHERE' : 'AND'
  //       sql += `${prefix} ${column} =  ? `;
  //     });
  //     sql += ' LIMIT 1';
  //
  //     let retornoQuery = await DbHelper.find<T>(sql, values);
  //     return  retornoQuery ?? null;
  //   } catch (error) {
  //     console.error('Model.firstByColumns() -->', error);
  //     return null;
  //   }
  // };

  // public static async firstByColumns<T>(columns: (keyof typeof this.schema)[], values: any[]): Promise<IFindResponse<any>> {
  //   let response: any = {};
  //   try {
  //     let sql = `SELECT * FROM ${this.table} `;
  //
  //     columns.forEach((column, index) => {
  //       let prefix = index == 0 ? 'WHERE' : 'AND'
  //       sql += `${prefix} ${column} =  ? `;
  //     });
  //     sql += ' LIMIT 1';
  //
  //     let retornoQuery = await DbHelper.find<T>(sql, values);
  //     response = retornoQuery ?? response;
  //
  //     return {success: Object.keys(response).length > 0, data: response};
  //   } catch (error) {
  //     console.error('Model.firstByColumns() -->', error);
  //     return {success:false, data: response, message: 'Nenhum registro encontrado!'};
  //   }
  // };

  public static mountInsertScript(values: any | any[], insertWithPrmaryKey: boolean = true): { sql: string; params: any[] } {
    values = Array.isArray(values) ? values : [values];
    let integerColumns = this.getIntegerColumns();

    // console.log('mountInsertScript() integerColumns --> ', JSON.stringify(integerColumns));
    // console.log('mountInsertScript() values --> ', JSON.stringify(values));

    let columns = this.getColumns(insertWithPrmaryKey);
    let bindingTemplate = this.mountInsertBindingTemplate(columns.length, values.length);

    let sql =  `INSERT OR REPLACE INTO ${this.table} (${columns.join(', ')}) VALUES ${bindingTemplate}`;
    let params: any[] = this.mountInsertArray(values, integerColumns, columns);
    // console.log('mountInsertScript() params --> ', JSON.stringify(params));
    return {sql, params};
  }

  private static mountInsertArray(values: any[], integerColumns: string[], orderedColumns: string[]): any[][] {
    try {
      return values.map((item) => {
        return orderedColumns.map((column) => {
          // console.log('mountInsertArray() column --> ', column);
          // console.log('mountInsertArray() item --> ', JSON.stringify(item));
          let value = item[column];
          // console.log('mountInsertArray() value --> ', value);
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

  public static mountUpdateScript(values: object): { sql: string; params: any[] } {
    let integerColumns = this.getIntegerColumns();
    let params: any[] = [];
    let bindingTemplate: string = '';
    Object.keys(values).forEach((key) => {
      if (key != this.primaryKey) {
        bindingTemplate += `${key} = ?, `;
        let newValue = values[key]
        if (integerColumns.includes(key)) {
          newValue = newValue ? Number(values[key]) : null;
        }

        params.push(newValue)
      }
    })

    // Remover vírgula e espaço do final da string
    bindingTemplate = bindingTemplate.slice(0, -2);
    let sql = `UPDATE ${this.table} SET ${bindingTemplate} WHERE ${this.primaryKey} = ?`;
    let primaryKeyValue = this.isIntegerColumn(this.primaryKey) ? Number(values[this.primaryKey]) : values[this.primaryKey];
    params.push(primaryKeyValue);

    return { sql, params };
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

  private static isIntegerColumn(column: keyof typeof this.schema): boolean  {
    let columnType = this.schema[column];
    return columnType.includes('INTEGER');
  }

  private static mountInsertBindingTemplate(columnsLength: number, insertsLength: number): string  {
    let oneItemTemplate = Array(columnsLength).fill('?').join(', ');
    return Array(insertsLength).fill(`(${oneItemTemplate})`).join(', '); // bindig template pra insert de todos itens
  }

  private static mountWhereClause<T>(
    params: Record<keyof typeof this.schema, number | number[] | string | string[]>,
    operator: 'IN' | 'NOT IN' = 'IN'
  ): { whereClause: string; bindingParams: any[] } {
    let whereClause = '';
    let bindingParams: any[] = [];

    try {
      let objEntries = Object.entries(params);
      if (objEntries.length == 0) {
        return { whereClause, bindingParams };
      }

      let entriesCount = 0;
      objEntries.forEach(([key, values]) => {
        let valuesTofind: (string | number)[] = Array.isArray(values) ? values : [values];
        if (valuesTofind.length > 0) {
          const bindingTemplate = Array(valuesTofind.length).fill('?').join(', ');

          whereClause += entriesCount > 0 ? ' AND ' : ''
          whereClause += `${key} ${operator} (${bindingTemplate})`;
          bindingParams.push(valuesTofind)
          entriesCount++;
        }
      })
    } catch (error) {
      console.error('Model.firstWhere() -->', error);
    }
    return { whereClause, bindingParams };
  };
}

