import {
  createTable,
  tableName,
  deleteAll,
  all,
  exists,
  dropTable,
  insert,
} from '../../repository/pessoas';

export interface PessoaSyncProps {
  success: boolean;
  data: PessoaContentProps[] | null;
  message: string;
}

export interface PessoaContentProps {
  nome: string;
  data_nascimento: string;
  cpf: string;
  sexo_id: number;
  cidade_id: number;
  situacao_contribuite_id: number;
}

export interface PessoaProps {
  message: string;
  data: PessoaContentProps[];
}

export class Pessoa {
  private _success: boolean;
  public get success(): boolean {
    return this._success;
  }
  public set success(v: boolean) {
    this._success = v;
  }

  private _data: PessoaContentProps[] | null;
  public get data(): PessoaContentProps[] | null {
    return this._data;
  }
  public set data(v: PessoaContentProps[] | null) {
    this._data = v;
  }

  private _error: string | null;
  public get error(): string | null {
    return this._error;
  }
  public set error(v: string | null) {
    this._error = v;
  }

  public static getTable() {
    return tableName;
  }

  public static async insert(values: PessoaContentProps[]) {
    await insert(values);
  }

  public static async createTable() {
    console.log('pessoa.createTable INIT');
    await createTable();
    console.log('pessoa.createTable FINAL');
  }

  public static async dropTable() {
    await dropTable();
  }

  public static async all(limit?: number) {
    return await all(limit);
  }

  public static async exists() {
    return await exists();
  }

  public static async deleteAll() {
    await deleteAll();
  }

  constructor(response: PessoaProps) {
    this._success = !!response.data;
    this._data = response.data ?? null;
    this._error = response.message || null;
  }
}
