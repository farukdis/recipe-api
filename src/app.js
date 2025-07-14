const express = require('express');
const app = express();
const db = require('./config/db');

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