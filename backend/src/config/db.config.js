import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    timezone: 'America/Argentina/Buenos_Aires'
});

export default pool;