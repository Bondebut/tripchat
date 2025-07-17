import { exec } from './exec';

/**
 * Retry wrapper with configurable attempts and delay
 */
export const retryExec = async <T>(
  label: string,
  cb: () => Promise<T>,
  maxRetries = 3,
  delayMs = 500
): Promise<T> => {
  let lastErr: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await cb();
    } catch (err) {
      lastErr = err;
      console.warn(`[retryExec] ${label} attempt ${i + 1} failed. Retrying...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  console.error(`[retryExec] ${label} failed after ${maxRetries} attempts.`);
  throw lastErr;
};