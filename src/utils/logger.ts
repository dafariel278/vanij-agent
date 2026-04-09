type LogLevel = "debug" | "info" | "warn" | "error";

export class Logger {
  private module: string;
  private static logLevel: LogLevel = "info";

  constructor(module: string) {
    this.module = module;
  }

  static setLogLevel(level: LogLevel): void {
    Logger.logLevel = level;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const levelColor = {
      debug: "\x1b[36m",  // cyan
      info: "\x1b[32m",   // green
      warn: "\x1b[33m",   // yellow
      error: "\x1b[31m",  // red
    };
    const reset = "\x1b[0m";
    
    return `${levelColor[level]}[${timestamp}] [${this.module}] ${level.toUpperCase()}${reset} ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (Logger.logLevel === "debug") {
      console.debug(this.formatMessage("debug", message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage("info", message), ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage("warn", message), ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage("error", message), ...args);
  }
}
