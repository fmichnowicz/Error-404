import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'leo',
  host: 'localhost',
  database: 'cancha_ya',
  password: '1111',
  port: 5432,
});

pool.on('error', (err) => {
  console.error(err);
  process.exit(-1);
});

export const establecerConexion = async () => {
  try {
    const client = await pool.connect();
    console.log('Conexión establecida correctamente');
    client.release();
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

establecerConexion();

export default pool;