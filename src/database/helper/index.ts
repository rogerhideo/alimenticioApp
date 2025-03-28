import {getDbConnection} from '../connection';
import {ResultSet} from 'react-native-sqlite-storage';

export class DbHelper {
  static async get<T>(sql: string, params?: any[]): Promise<T[]> {
    let retorno: T[] = [];
    try {
      let db = await getDbConnection();
      let [result] = await db.executeSql(sql, params ? params.flat() : []);
      retorno = result.rows.length > 0 ? result.rows.raw() : retorno;

      return retorno;
    } catch (error) {
      console.error('DbHelper.get()', error);
      return retorno;
    }
  }

  static async find<T>(sql: string, params?: any[]): Promise<T | undefined> {
    try {
      let db = await getDbConnection();
      let results = await db.executeSql(sql, params ? params.flat() : []);

      let response: any = {};
      results.forEach((result: ResultSet): void => {
        response = result.rows.item(0) ?? response;
      });

      return Object.keys(response).length > 0 ? response as T : undefined;
    } catch (error) {
      console.error('DbHelper.find()', error);
      return undefined;
    }
  }

  static async execute(sql: string, params?: any[]): Promise<ResultSet[]> {
    try {
      let db = await getDbConnection();
      return await db.executeSql(sql, params ? params.flat() : []);
    } catch (error) {
      console.error('DbHelper.execute()', error);
      throw error;
    }
  }
}
