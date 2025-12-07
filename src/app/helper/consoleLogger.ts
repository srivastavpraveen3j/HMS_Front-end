class ConsoleLogger {
  private debug: boolean;

  constructor(config: { debug: boolean }) {
    this.debug = config.debug;
  }

  // ✅ Turn logging ON
  enable() {
    this.debug = true;
  }

  // ✅ Turn logging OFF
  disable() {
    this.debug = false;
  }

  // ✅ OR generic method
  setDebug(value: boolean) {
    this.debug = value;
  }

  log(...args: any[]) {
    if (this.debug) {
      console.log('[LOG]:', ...args);
    }
  }

  warn(...args: any[]) {
    if (this.debug) {
      console.warn('[WARN]:', ...args);
    }
  }

  error(...args: any[]) {
    if (this.debug) {
      console.error('[ERROR]:', ...args);
    }
  }

  info(...args: any[]) {
    if (this.debug) {
      console.info('[INFO]:', ...args);
    }
  }
}


export const consoleLogger = new ConsoleLogger({ debug: false });
