import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new sql.ConnectionPool({
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});

export const poolConnect = pool.connect(); // เชื่อม pool ทันที
