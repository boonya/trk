import {Injectable} from '@angular/core';
import {LoggerService} from './logger';

@Injectable()
export class LocationService {
  constructor(private log: LoggerService) {
    this.log.debug('LocationService instance has been initialized.');
  }

  getPosition(): Promise<Position> {
    return new Promise((resolve, reject) => {
      // Try HTML5 geolocation.
      if (!navigator.geolocation) {
        // Browser doesn't support Geolocation
        reject('Your browser doesn\'t support geolocation.');
        return this;
      }

      navigator.geolocation.getCurrentPosition((position) => {
        resolve(position);
      }, () => {
        reject('The Geolocation service failed.');
      });
    });
  }
}
