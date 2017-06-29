import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {LoggerService} from './logger';

@Injectable()
export class PreloaderService {
  private visibility = new Subject<boolean>();
  visibility$ = this.visibility.asObservable();

  constructor(private log: LoggerService) {
    this.log.debug('PreloaderService instance has been initialized...');
  }

  show(): void {
    this.visibility.next(true);
  }

  hide(): void {
    this.visibility.next(false);
  }
}
