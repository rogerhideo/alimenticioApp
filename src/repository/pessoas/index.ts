import {PessoaContentProps} from '../../models/pessoa';
import {connectToDatabase} from '../../database/connection';
import {Snack} from '../../components/snack';
import {
  createTableScript,
  deleteAllScript,
  insertScript,
  mountInsertArray,
  selectScript,
} from './ScriptsSql';
import {DbHelper} from '../../database/helper';

export const tableName = 'pessoas';

export const createTable = async () => {
  try {
    let sql = createTableScript(tableName);
    let result = await DbHelper.execute(sql);
    return result.length > 0;
  } catch (error) {
    console.error('PessoaRepository.createTable()' + error);
    Snack('error', 'Falha ao criar tabela Pessoa.');
  }
};

export const dropTable = async () => {
  try {
    let sql = `DROP TABLE ${tableName}`;
    let result = await DbHelper.execute(sql);
    return result.length > 0;
  } catch (error) {
    console.error('PessoaRepository.dropTable()' + error);
    Snack('error', 'Falha ao dropar tabela Pessoa.');
  }
};

export const all = async (limit?: number): Promise<PessoaContentProps[]> => {
  let clients: PessoaContentProps[] = [];
  try {
    let sql = selectScript(tableName, limit);
    return await DbHelper.get<PessoaContentProps>(sql);
  } catch (error) {
    console.error(error);
    Snack('error', 'Falha ao buscar na tabela Pessoa.');
    return clients;
  }
};

export const insert = async (
  values: PessoaContentProps[],
): Promise<boolean> => {
  try {
    let params: any[] = mountInsertArray(values);
    let sql = insertScript(tableName, values.length);

    let result = await DbHelper.execute(sql, params);
    return result.length > 0;
  } catch (error) {
    console.error(error);
    Snack('error', 'Falha ao inserir na tabela LabParametro.');
    return false;
  }
};

export const deleteAll = async () => {
  try {
    let sql = deleteAllScript(tableName);
    let result = await DbHelper.execute(sql);
    return result.length > 0;
  } catch (error) {
    console.error(error);
    Snack('error', 'Falha ao atualizar na tabela Devolucaoarmazenagem.');
  }
};

export const exists = async () => {
  try {
    let sql = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`;
    let results = await DbHelper.execute(sql);
    return results[0].rows.length > 0;
  } catch (error) {
    console.error(error);
    Snack('error', 'Falha ao atualizar na tabela Devolucaoarmazenagem.');
  }
};
