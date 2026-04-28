import { adminDb } from '@/lib/firebase-admin';

export type LogLevel = 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  level: LogLevel;
  service: string;
  message: string;
  metadata?: any;
  timestamp: string;
  environment: string;
}

/**
 * aipyram Centralized Logging System
 * Ensures observability for the autonomous ecosystem.
 * Errors are persisted to Firestore `system_logs` collection.
 */
export const logger = {
  async log(level: LogLevel, service: string, message: string, metadata?: any) {
    const entry: LogEntry = {
      level,
      service,
      message,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null, // Prevent circular structures
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    if (level === 'error' || level === 'critical') {
      console.error(`[${level.toUpperCase()}] [${service}] ${message}`, metadata || '');
    } else if (level === 'warn') {
      console.warn(`[${level.toUpperCase()}] [${service}] ${message}`, metadata || '');
    } else {
      console.log(`[${level.toUpperCase()}] [${service}] ${message}`, metadata || '');
    }

    if (level === 'error' || level === 'critical') {
      try {
        if (adminDb) {
           await adminDb.collection('system_logs').add(entry);
        }
      } catch (err) {
        console.error('[LOGGER_FALLBACK] Failed to write log to Firestore:', err);
      }
    }
  },

  info(service: string, message: string, metadata?: any) {
    return this.log('info', service, message, metadata);
  },
  warn(service: string, message: string, metadata?: any) {
    return this.log('warn', service, message, metadata);
  },
  error(service: string, message: string, metadata?: any) {
    return this.log('error', service, message, metadata);
  },
  critical(service: string, message: string, metadata?: any) {
    return this.log('critical', service, message, metadata);
  }
};
