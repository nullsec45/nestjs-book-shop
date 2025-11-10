import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import 'winston-daily-rotate-file';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LogService implements LoggerService {
  private logger: Logger;
  private moduleLogger:Map<string, Logger>=new Map();

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

    // bikin folder logs kalau belum ada
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // transport utama: semua level (info ke atas)
    const dailyAll = new (winston.transports as any).DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      auditFile: path.join(logDir, 'audit.json'),
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
    });

    // transport khusus error per hari
    const dailyError = new (winston.transports as any).DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error', // cuma error
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
    });

    const consoleTransport = new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}] ${message}${metaStr}`;
        }),
      ),
    });

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      ),
      transports: [dailyAll, dailyError, consoleTransport],
      exceptionHandlers: [dailyError, consoleTransport],
      exitOnError: false,
    });
  }

  // bisa dipanggil: this.loggerService.warn('book.create.conflict', {...})
  log(message: string, meta: Record<string, any> = {}) {
    this.logger.info(message, meta);
  }

  error(message: string, meta: Record<string, any> = {}) {
    this.logger.error(message, meta);
  }

  warn(message: string, meta: Record<string, any> = {}) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta: Record<string, any> = {}) {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta: Record<string, any> = {}) {
    this.logger.verbose(message, meta);
  }

  module(name:string):Logger{
    if(this.moduleLogger.has(name)){
        return this.moduleLogger.get(name);
    }
    
    const logDir=path.join(process.cwd(),'logs');

    const moduleDaily = new (winston.transports as any).DailyRotateFile({
      filename: path.join(logDir, `${name}-%DATE%.log`), // <-- auth-2025-11-10.log
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: format.combine(format.timestamp(), format.json()),
    });

    const consoleTransport = new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}] [${name}] ${message}${metaStr}`;
        }),
      ),
    });

    const logger = createLogger({
    //   level: 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      ),
      transports: [moduleDaily, consoleTransport],
    });

    this.moduleLogger.set(name, logger);
    return logger;
  }
}
