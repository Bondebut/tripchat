import { exec } from './exec';
import fs from 'fs';
import path from 'path';

/**
 * Auto-generate label from caller stack if not provided
 */
function getCallerLabel(): string {
  const stack = new Error().stack;
  if (!stack) return 'unknown';

  const lines = stack.split('\n').slice(3); // Skip current, safeExec, and callback
  const callerLine = lines[0] || '';
  const match = callerLine.match(/at (\S+)/);
  return match ? match[1] : 'anonymous';
}

/**
 * Append error to log file with timestamp
 */
function logError(label: string, error: any) {
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logPath = path.join(logDir, 'error.log');
  const message = `[${new Date().toISOString()}] [${label}] ${error?.stack || error}\n`;
  fs.appendFileSync(logPath, message);
}

/**
 * Safe exec wrapper with auto label + log to file
 */
export const safeExec = async <T>(
  labelOrCb: string | (() => Promise<T>),
  cb?: () => Promise<T>
): Promise<T | null> => {
  const label = typeof labelOrCb === 'string' ? labelOrCb : getCallerLabel();
  const fn = typeof labelOrCb === 'function' ? labelOrCb : cb!;
  try {
    return await fn();
  } catch (err) {
    console.error(`[safeExec] ${label} failed:`, err);
    logError(label, err);
    return null;
  }
};