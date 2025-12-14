import express from 'express';
import canchasRoutes from './routes/canchas.js';
import './config/db.config.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend de CanchaYa!' });
});

app.use('/api/canchas', canchasRoutes);

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});