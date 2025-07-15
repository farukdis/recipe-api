import knex from 'knex';
import knexfile from '../../knexfile';
import { Knex } from 'knex';

const db = knex(knexfile.development) as Knex;

export default db;