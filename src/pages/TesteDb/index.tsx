import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {connectToDatabase} from '../../database/connection';
import {Pessoa, PessoaContentProps} from '../../models/pessoa';
import {DbHelper} from '../../database/helper';

function TesteDb(): React.JSX.Element {
  const testeDropTables = async () => {
    console.log('testeDropTables INIT');

    try {
      let sqls: string[] = [];

      sqls.push('DROP TABLE pessoas');

      let db = await connectToDatabase();

      for (const sql of sqls) {
        let results = await db.executeSql(sql);
        console.log('sql -->', sql);
        console.log('TABLES ==>', '[ ' + results[0].rowsAffected + ' ]');
      }
    } catch (error) {
      console.error('TesteDb.testeDropTables() -->', error);
    }
  };

  const testeCreateTables = async () => {
    try {
      await Pessoa.createTable();
    } catch (error) {
      console.error('TesteDb.testeCreateTables() -->', error);
    }
  };

  const testeSelectAll = async () => {
    try {
      let sql: string = ';';
      let tables = ['pessoas'];

      let types = [
        'pragma',
        'select',
        // 'count'
        // 'deleteAll'
      ];

      let count = 0;
      for (const table of tables) {
        count++;
        console.log('############################################');
        console.log(`########## [ ${count} ] - ${table} ##########`);
        console.log('############################################');
        console.log('\n');

        if (types.includes('pragma')) {
          sql = `PRAGMA table_info(${table})`;

          let results = await DbHelper.execute(sql);

          console.log('###################### PRAGMA ######################');
          console.log('sql -->', sql);
          console.log('COUNT ==>', '[ ' + results[0].rows.length + ' ]');
          console.log(
            'ROWSAFFECTED ==>',
            '[ ' + results[0].rowsAffected + ' ]',
          );
          results.forEach((result): void => {
            for (let index: number = 0; index < result.rows.length; index++) {
              console.log(result.rows.item(index));
            }
          });

          console.log('-------------------------------');
          console.log('\n');
        }

        if (types.includes('select')) {
          sql = `SELECT * FROM ${table}`;
          let results = await DbHelper.execute(sql);

          console.log('###################### SELECT ######################');
          console.log('sql -->', sql);
          console.log('COUNT ==>', '[ ' + results[0].rows.length + ' ]');
          results.forEach((result): void => {
            for (let index: number = 0; index < result.rows.length; index++) {
              let item = result.rows.item(index);
              console.log(JSON.stringify(item, null, 2));
            }
          });

          console.log('-------------------------------');
          console.log('\n');
        }

        if (types.includes('count')) {
          sql = `SELECT COUNT(*) FROM ${table}`;
          let results = await DbHelper.execute(sql);

          console.log('###################### COUNT ######################');
          console.log('sql -->', sql);
          console.log('COUNT ->', results[0].rows.item(0)['COUNT(*)']);
          console.log('-------------------------------');
          console.log('\n');
        }

        if (types.includes('deleteAll')) {
          sql = `DELETE FROM ${table}`;
          let results = await DbHelper.execute(sql);

          console.log(
            '###################### DELETE ALL ######################',
          );
          console.log('sql -->', sql);
          console.log(
            'ROWSAFFECTED ==>',
            '[ ' + results[0].rowsAffected + ' ]',
          );
          console.log('-------------------------------');
          console.log('\n');

          console.log('-------------------------------');
          console.log('\n');
        }
      }

      console.log('=====================');
      console.log('testeSelectAll FINAAL');
    } catch (error) {
      console.error('TesteDb.testeSelectAll() -->', error);
    }
  };

  const testeInsert = async () => {
    try {
      let pessoas: PessoaContentProps[] = [
        {
          nome: 'João Silva',
          data_nascimento: '1990-05-15',
          cpf: '123.456.789-00',
          sexo_id: 1,
          cidade_id: 101,
          situacao_contribuite_id: 2,
        },
        {
          nome: 'Maria Oliveira',
          data_nascimento: '1985-08-22',
          cpf: '987.654.321-11',
          sexo_id: 2,
          cidade_id: 102,
          situacao_contribuite_id: 1,
        },
        {
          nome: 'Carlos Souza',
          data_nascimento: '1995-12-01',
          cpf: '321.654.987-22',
          sexo_id: 1,
          cidade_id: 103,
          situacao_contribuite_id: 3,
        },
        {
          nome: 'Ana Pereira',
          data_nascimento: '2000-03-18',
          cpf: '456.789.123-33',
          sexo_id: 2,
          cidade_id: 104,
          situacao_contribuite_id: 2,
        },
        {
          nome: 'Paulo Lima',
          data_nascimento: '1992-07-11',
          cpf: '789.123.456-44',
          sexo_id: 1,
          cidade_id: 105,
          situacao_contribuite_id: 1,
        },
      ];
      await Pessoa.insert(pessoas);
    } catch (error) {
      console.error('TesteDb.testeInsert() -->', error);
    }
  };

  const testeSelecModel = async () => {
    try {
      let retorno = await Pessoa.all();
      retorno.forEach(pessoa => console.log('nome', pessoa.nome));
    } catch (error) {
      console.error('TesteDb.testeSelecModel() -->', error);
    }
  };

  return (
    <View style={styles.buttonsView}>
      <TouchableOpacity
        style={[styles.button, {backgroundColor: '#3c8dbc'}]}
        onPress={testeSelectAll}>
        <Text>SELECT MANUAL</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, {backgroundColor: '#3c8dbc'}]}
        onPress={testeSelecModel}>
        <Text>SELECT MODEL</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, {backgroundColor: '#00a65a'}]}
        onPress={testeInsert}>
        <Text>INSERT</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, {backgroundColor: '#f39c12'}]}
        onPress={testeCreateTables}>
        <Text>CREATE</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, {backgroundColor: '#dd4b39'}]}
        onPress={testeDropTables}>
        <Text>DROP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonsView: {
    flex: 1,
    flexDirection: 'column',
    borderColor: '#00a65a',
    borderWidth: 1,
    margin: 15,
    paddingHorizontal: 30,
    paddingVertical: 80,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default TesteDb;
