import {connectToDatabase} from '../connection';
import {Snack} from '../../components/snack';
import {ResultSet} from 'react-native-sqlite-storage';

export class DbHelper {
  static async get<T>(sql: string): Promise<T[]> {
    let retorno: T[] = [];
    try {
      let db = await connectToDatabase();
      let results = await db.executeSql(sql);
      results.forEach(result => {
        for (let index = 0; index < result.rows.length; index++) {
          retorno.push(result.rows.item(index) as T);
        }
      });
      return retorno;
    } catch (error) {
      console.error(error);
      Snack('error', 'Falha ao buscar na tabela Pessoa.');
      return retorno;
    }
  }

  static async execute(sql: string, params?: any[]): Promise<ResultSet[]> {
    try {
      let db = await connectToDatabase();
      return await db.executeSql(sql, params ? params.flat() : []);
    } catch (error) {
      console.error('Erro ao executar SQL:', error);
      throw error;
    }
  }
}
