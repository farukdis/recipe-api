const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./config/db');
const api = require('./api');

const app = express();

// Güvenlik ve veri işleme ara yazılımları
app.use(express.json()); // Gelen JSON verilerini okumak için
app.use(express.urlencoded({ extended: true })); // URL kodlanmış verileri okumak için
app.use(cors()); // CORS politikalarını etkinleştirir
app.use(helmet()); // Temel güvenlik başlıklarını ayarlar

// Ana API rotalarını bağla
app.use('/api', api);

// Basit bir ana sayfa rotası
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Veritabanı bağlantısını test etme
db.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
  } else {
    console.log('Database connection successful at:', result.rows[0].now);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});