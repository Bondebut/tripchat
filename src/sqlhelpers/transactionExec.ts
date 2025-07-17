import { pool, poolConnect } from './../config/db_connect';
import sql from 'mssql';

/**
 * Transaction wrapper for multiple queries
 */
export const transactionExec = async (
  callback: (tx: sql.Transaction) => Promise<any>
): Promise<any> => {
  await poolConnect;
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const result = await callback(tx);
    await tx.commit();
    return result;
  } catch (err) {
    await tx.rollback();
    console.error('[transactionExec] Transaction failed:', err);
    throw err;
  }
};