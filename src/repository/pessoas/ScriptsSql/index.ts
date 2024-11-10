import {insertsPlaceholder} from '../../../utils';

export const createTableScript = (table: string) => {
  return `CREATE TABLE IF NOT EXISTS ${table} 
    (
        id                    INTEGER PRIMARY KEY AUTOINCREMENT,
        nome                  TEXT,
        data_nascimento       TEXT,
        cpf                   TEXT,
        sexo_id               TEXT,
        cidade_id             INTEGER,
        situacao_contribuite_id INTEGER
    )`;
};

export const getColumns = (): string[] => {
  return [
    // 'id',
    'nome',
    'data_nascimento',
    'cpf',
    'sexo_id',
    'cidade_id',
    'situacao_contribuite_id',
  ];
};

export const mountInsertArray = (values: any[]): any[] => {
  return values.map(v => [
    v.nome,
    v.data_nascimento,
    v.cpf,
    v.sexo_id,
    v.cidade_id,
    v.situacao_contribuite_id,
  ]);
};

export const selectScript = (table: string, limit?: number) => {
  let sql = `SELECT * FROM ${table} ORDER BY nome`;
  return limit ? `${sql} LIMIT ${limit}` : sql;
};

export const deleteAllScript = (table: string) => {
  return `DELETE FROM ${table}`;
};

export const insertScript = (table: string, insertsCount: number) => {
  let columns: string[] = getColumns();
  let template = insertsPlaceholder(columns.length, insertsCount);

  return `INSERT OR REPLACE INTO ${table} (${columns.join(', ',)}) VALUES ${template}`;
};

export const deleteScript = (table: string, id: string) => {
  return `DELETE FROM ${table} WHERE id = ${id}`;
};
