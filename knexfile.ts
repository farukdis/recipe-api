import { config } from 'dotenv';
import { Knex } from 'knex';

config();

interface KnexConfig {
  [key: string]: Knex.Config;
}

const knexConfig: KnexConfig = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST as string,
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_NAME as string,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    },
  },
};

export default knexConfig;