import pino from 'pino';
import { dev } from '$app/environment';

const contextKey = 'context';
const base: pino.LoggerOptions = {
  nestedKey: contextKey
};

let options: pino.LoggerOptions = {};

if (dev) {
  options = {
    ...base,
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  };
}

export const logger = pino(options);
