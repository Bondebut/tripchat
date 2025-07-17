import { pool, poolConnect } from '../config/db_connect';
import sql from 'mssql';


export const exec = async (
  callback: (req: sql.Request) => Promise<any>
): Promise<any> => {
  await poolConnect;
  const req = pool.request();
  return await callback(req);
};