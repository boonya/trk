import {Injectable} from '@angular/core';

@Injectable()
export class LoggerService {
  constructor() {
    this.debug('LoggerService instance has been initialized...');
  }

  info(message?: any, ...optionalParams: any[]): void {
    console.info(message, ...optionalParams);
  }

  warn(message?: any, ...optionalParams: any[]): void {
    console.warn(message, ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]): void {
    console.error(message, ...optionalParams);
  }

  debug(message?: any, ...optionalParams: any[]): void {
    console.debug(message, ...optionalParams);
  }
}
