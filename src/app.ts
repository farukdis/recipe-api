import express, { Express, Request, Response, Router } from 'express';
import cors from 'cors';
import { Knex } from 'knex';

import apiRouter from './api';
import knex from './config/db';

const app: Express = express();
const port = process.env.PORT || 5000;

// İzin verilen kökenleri tanımla
// Geliştirme ortamı için localhost:3000 (React/Vue/Angular uygulamanızın varsayılan portu)
// Üretim ortamı için web uygulamanızın gerçek alan adını eklemelisiniz.
const allowedOrigins = [
  'http://localhost:3000', // Web uygulamanızın geliştirme ortamı
  // 'https://www.yourwebapp.com', // Web uygulamanızın üretim ortamı (gerçek alan adınız)
  // 'https://yourwebapp.com', // Web uygulamanızın üretim ortamı (gerçek alan adınız - www olmadan)
];

// Güvenlik ve veri işleme ara yazılımları
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS kısıtlamalarını daha güvenli bir şekilde yapılandır
app.use(cors({
  origin: function (origin, callback) {
    // Mobil uygulamalar veya Postman gibi tarayıcı dışı istekler için 'origin' undefined olabilir.
    // Bu tür istekler için izin ver.
    if (!origin) return callback(null, true);
    
    // Eğer istek kökeni izin verilenler listesindeyse izin ver.
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Kimlik doğrulama başlıklarının (örn. JWT) çapraz köken isteklerinde gönderilmesine izin ver
}));

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