import {Component, OnDestroy, OnInit} from '@angular/core';
import {Visibilities, Devices, States} from 'api/collections';

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

@Component({
  selector: 'trk-map',
  templateUrl: './map.html',
  styleUrls: ['./map.less'],
  providers: [LocationService]
})
export class MapComponent implements OnInit, OnDestroy {
  private config: {
    center: {
      lat: number,
      lng: number
    },
    zoom: number
  };
  private platform: any;
  private map: google.maps.Map;
  private markers: { [deviceId: number]: google.maps.Marker } = {};

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
        this.setCurrentPositionMarker({lat: position.lat, lng: position.lng});
      })
      .then(this.hideProgress.bind(this))
      .then(this.watchMarkers.bind(this))
      .catch((error) => {
        this.hideProgress();
        this.log.error(error);
      });
  }

  ngOnDestroy(): void {
    // @TODO: Destroy observer and other
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

  private setCurrentPositionMarker(position: { lat: number, lng: number }): google.maps.Marker {
    return new google.maps.Marker({
      map: this.map,
      position: position,
      draggable: false,
      icon: 'assets/img/beauty.png'
    });
  }

  private zoomTo(value: number): void {
    this.map.setZoom(value);
  }

  /**
   * Source: http://stackoverflow.com/a/25143326
   *
   * @param {number} accuracy
   * @returns {number}
   */
  private calculateZoomByAccureacy(accuracy: number): number {
    const equatorLength = 40075004; // in meters
    const deviceHeight = this.platform.height();
    const deviceWidth = this.platform.width();
    const screenSize = Math.min(deviceWidth, deviceHeight);
    const requiredMpp = accuracy / screenSize;
    return ((Math.log(equatorLength / (256 * requiredMpp))) / Math.log(2)) + 1;
  }

  private watchMarkers(): void {
    const userId = 1; // @TODO: Use Meteor.userId() instead

    this.getStreams(userId)
      .subscribe(stream => {
        stream.forEach(item => {
          const data = this.processStream(item);
          const deviceId = 12121;
          this.upsertMarker(deviceId, data.position);
        });
      });
  }

  private getStreams(userId): any {
    return States.find();
    // return Devices.find();
    // return Visibilities.find();

    // Visibilities.find({ownerId: userId})

    // return Visibilities.find({ownerId: userId, isVisible: true})
    //   .flatMap(visibilities => {
    //     const deviceIds = [];
    //     visibilities.forEach(visibility => deviceIds.push(visibility.deviceId));
    //
    //     const devices = Devices.find({_id: {$in: deviceIds}}).fetch();
    //     const states = States.find({deviceId: {$in: deviceIds}}).fetch();
    //
    //     const result = [];
    //     devices.forEach(device => {
    //       let data = null;
    //       states.forEach(state => {
    //         if (state.deviceId === device._id) {
    //           data = state;
    //           data['title'] = device.name;
    //         }
    //       });
    //       result.push(data);
    //     });
    //     return result;
    //   });
  }

  private processStream(data) {
    const sm = data.position.split(',');
    return {
      position: {
        lat: parseFloat(sm[0]),
        lng: parseFloat(sm[1])
      }
    };
  }

  private upsertMarker(deviceId: number, position: { lat: number, lng: number }): void {
    if (deviceId in this.markers) {
      this.updateMarker(deviceId, position);
    } else {
      this.createMarker(deviceId, position);
    }
  }

  private updateMarker(deviceId: number, position: { lat: number, lng: number }): void {
    this.markers[deviceId].setPosition(position);
  }

  private createMarker(deviceId: number, position: { lat: number, lng: number }): void {
    this.markers[deviceId] = new google.maps.Marker({
      map: this.map,
      position: position,
      draggable: false,
      icon: 'assets/img/car.png'
    });
  }

  private showProgress(): void {
    this.preloader.show();
  }

  private hideProgress(): void {
    this.preloader.hide();
  }

}
