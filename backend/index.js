const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hola mundo!' });
});

app.listen(3000, () => {
  console.log('Servidor escuchando en puerto 3000');
});
