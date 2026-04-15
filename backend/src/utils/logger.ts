import { v4 as uuidv4 } from 'uuid';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

function getTimestamp(): string {
  return new Date().toISOString();
}

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  return JSON.stringify({
    level,
    timestamp: getTimestamp(),
    message,
    ...meta,
  });
}

export const logger = {
  error: (message: string, meta?: Record<string, unknown>) => {
    if (LOG_LEVELS.error <= LOG_LEVELS.info) {
      console.error(formatLog('error', message, meta));
    }
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (LOG_LEVELS.warn <= LOG_LEVELS.info) {
      console.warn(formatLog('warn', message, meta));
    }
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    if (LOG_LEVELS.info <= LOG_LEVELS.info) {
      console.info(formatLog('info', message, meta));
    }
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (LOG_LEVELS.debug <= LOG_LEVELS.info) {
      console.debug(formatLog('debug', message, meta));
    }
  },
};

export function generateRequestId(): string {
  return uuidv4();
}
