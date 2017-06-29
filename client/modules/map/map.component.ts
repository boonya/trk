import {Component, OnInit} from '@angular/core';

import {
  LoggerService,
  LocationService,
  PreloaderService
} from '../../services';

import {CurrentPosition} from './models';

const GOOGLE_MAPS_JS_FILE = 'https://maps.googleapis.com/maps/api/js?key={API_KEY}';
const GOOGLE_MAPS_API_KEY = 'AIzaSyB6Fy4-4nZdgd80SDJzM3FWORtb7N0Qsaw';

const DEFAULT_ZOOM = 10;
const DEFAULT_LAT = 34.0126238;
const DEFAULT_LNG = -118.239342;
// const EQUATOR = 40075004;
// const LOCATION_REFRESH_INTERVAL = 500;

@Component({
  selector: 'trk-map',
  templateUrl: './map.html',
  styleUrls: ['./map.less'],
  providers: [LocationService]
})
export class MapComponent implements OnInit {
  private config: {
    center: {
      lat: number,
      lng: number
    },
    zoom: number
  };
  private map: google.maps.Map;

  constructor(private log: LoggerService,
              private preloader: PreloaderService,
              private locationService: LocationService) {
    this.config = {
      center: {
        lat: DEFAULT_LAT,
        lng: DEFAULT_LNG
      },
      zoom: DEFAULT_ZOOM
    };
  }

  ngOnInit(): void {
    this.showProgress();

    this.initGoogleMapsAPI()
      .then(() => {
        return Promise.all([
          this.initMap(),
          this.getCurrentPosition()
        ]);
      })
      .then(([map, position]) => {
        this.moveTo({lat: position.lat, lng: position.lng});
        // const zoom = this.calculateZoomByAccureacy(position.accuracy);
        // this.zoomTo(zoom);
      })
      .then(this.hideProgress.bind(this))
      .catch((error) => {
        this.hideProgress();
        this.log.error(error);
      });
  }

  private initGoogleMapsAPI(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        document.body.appendChild(Object.assign(document.createElement('script'), {
          type: 'text/javascript',
          src: GOOGLE_MAPS_JS_FILE.replace(/{API_KEY}/g, GOOGLE_MAPS_API_KEY),
          onload: () => {
            resolve(google.maps);
          },
          onerror: () => {
            reject(`${GOOGLE_MAPS_JS_FILE} file has not been loaded.`);
          }
        }));
      } catch (exception) {
        reject(exception);
      }
    });
  }

  private initMap(): Promise<google.maps.Map> {
    return new Promise((resolve, reject) => {
      try {
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: this.config.zoom,
          center: this.config.center,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        resolve(this.map);
      } catch (exception) {
        reject(exception);
      }
    });
  }

  private getCurrentPosition(): Promise<CurrentPosition> {
    return this.locationService.getPosition()
      .then((position) => {
        return {
          accuracy: position.coords.accuracy,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      }).catch((reason) => {
        this.log.error(reason);
        return {
          accuracy: -1,
          lat: DEFAULT_LAT,
          lng: DEFAULT_LNG
        };
      });
  }

  /**
   * Move center of map to position.
   */
  private moveTo(position: { lat: number, lng: number }): void {
    this.map.setCenter(position);
  }

  private zoomTo(value: number): void {
    this.map.setZoom(value);
  }

  // private calculateZoomByAccureacy(accuracy: number): number {
  //   // return 10;
  //   // Source: http://stackoverflow.com/a/25143326
  //   const element = document.getElementById('map');
  //   const deviceHeight = element.clientHeight;
  //   const deviceWidth = element.clientWidth;
  //   // const deviceHeight = this.platform.height();
  //   // const deviceWidth = this.platform.width();
  //   const screenSize = Math.min(deviceWidth, deviceHeight);
  //   const requiredMpp = accuracy / screenSize;
  //
  //   return ((Math.log(EQUATOR / (256 * requiredMpp))) / Math.log(2)) + 1;
  // }

  private showProgress(): void {
    this.preloader.show();
  }

  private hideProgress(): void {
    this.preloader.hide();
  }

}
