import express, { Express, Request, Response, Router } from 'express';
import cors from 'cors';
import { Knex } from 'knex';

import apiRouter from './api';
import knex from './config/db';

const app: Express = express();
const port = process.env.PORT || 5000;

// Güvenlik ve veri işleme ara yazılımları
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// app.use(helmet()); // Bu paket projemizde kurulu olmadığı için şimdilik devre dışı bırakıldı.

// Ana API rotalarını bağla
app.use('/api', apiRouter);

// Basit bir ana sayfa rotası
app.get('/', (req: Request, res: Response) => {
  res.send('API is running!');
});

// Veritabanı bağlantısını test etme
(knex as Knex).raw('SELECT NOW()')
  .then(result => {
    console.log('Database connection successful at:', result.rows[0].now);
  })
  .catch(err => {
    console.error('Database connection failed:', err.stack);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});