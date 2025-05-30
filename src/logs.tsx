import { LogEntry } from './types';

// Memory-safe logging system with configurable limits
const MAX_LOGS = 50; // Keep only the most recent 50 logs
const logs: LogEntry[] = [];

function addLogEntry(type: LogEntry['type'], message: unknown[]) {
  logs.push({
    type,
    message,
    timestamp: new Date().toISOString(),
  });

  // Keep only the most recent logs to prevent memory leaks
  if (logs.length > MAX_LOGS) {
    logs.splice(0, logs.length - MAX_LOGS);
  }
}

['log', 'error'].forEach((type) => {
  const original = console[type as 'log'];
  console[type as 'log'] = (...args) => {
    addLogEntry(type as LogEntry['type'], args);
    original(...args); // keep original behavior
  };
});

export function getLogs(): LogEntry[] {
  return [...logs]; // Return a copy to prevent external modification
}
