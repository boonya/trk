import {Component, OnDestroy, OnInit} from '@angular/core';
import {Visibilities, Devices, States} from 'api/collections';
import {config} from 'api/config';

import {Observable, Observer, Subject} from 'rxjs/Rx';

import {
  LoggerService,
  LocationService,
  PreloaderService
} from '../../services';

import {CurrentPosition, MarkerData} from './models';
import {Visibility, Device, State} from 'api/models';

const GOOGLE_MAPS_JS_FILE = 'https://maps.googleapis.com/maps/api/js?key={API_KEY}';
const GOOGLE_MAPS_API_KEY = config.google.api.key;

const DEFAULT_ZOOM = config.map.zoom;
const DEFAULT_LAT = config.map.center.latitude;
const DEFAULT_LNG = config.map.center.longitude;

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
    const _this = this;

    this.getStream(userId)
      .subscribe(
        function (x) {
          for (const i in x) {
            if (!x.hasOwnProperty(i)) {
              continue;
            }
            _this.controlMarker(x[i].deviceId, x[i]);
          }
        },
        function (err) {
          console.log('Error: ', err);
        },
        function () {
          console.log('Completed');
        });
  }

  private getStream(userId: number): Observable<any> {
    return this.watchVisibilities(userId)
      .combineLatest(
        this.watchDevices(userId),
        this.watchStates(userId),
        (visibilities, devices, states) => this.getMergedData(visibilities, devices, states)
      );
  }

  private watchVisibilities(userId: number): any {
    return Visibilities.find({ownerId: userId});
  }

  private watchDevices(userId: number): any {
    return Visibilities.find({ownerId: userId})
      .flatMap(visibilities => {
        const deviceIds = [];
        for (let i = 0; visibilities.length > i; i++) {
          deviceIds.push(visibilities[i].deviceId);
        }
        return Devices.find({id: {$in: deviceIds}});
      });
  }

  private watchStates(userId: number): any {
    return Visibilities.find({ownerId: userId})
      .flatMap(visibilities => {
        const deviceIds = [];
        for (let i = 0; visibilities.length > i; i++) {
          deviceIds.push(visibilities[i].deviceId);
        }
        return States.find({deviceId: {$in: deviceIds}});
      });
  }

  private getMergedData(visibilities: Visibility[], devices: Device[], states: State[]): MarkerData[] {
    const data = {};
    const markers: MarkerData[] = [];

    for (let i = 0; devices.length > i; i++) {
      data[devices[i].id] = data[devices[i].id] || {};
      data[devices[i].id] = {
        ...data[devices[i].id], ...{
          deviceId: devices[i].id,
          title: devices[i].title
        }
      };
    }

    for (let i = 0; visibilities.length > i; i++) {
      data[visibilities[i].deviceId] = data[visibilities[i].deviceId] || {};
      data[visibilities[i].deviceId] = {
        ...data[visibilities[i].deviceId], ...{
          isVisible: visibilities[i].isVisible
        }
      };
    }

    for (let i = 0; states.length > i; i++) {
      data[states[i].deviceId] = data[states[i].deviceId] || {};
      const position = {
        lat: parseFloat(states[i].position.split(',')[0]),
        lng: parseFloat(states[i].position.split(',')[1])
      };
      data[states[i].deviceId] = {
        ...data[states[i].deviceId], ...{
          validity: states[i].validity,
          ignition: states[i].ignition,
          datetime: states[i].datetime,
          position: position
        }
      };
    }

    for (const key in data) {
      if (!data[key].hasOwnProperty('deviceId')
        || !data[key].hasOwnProperty('title')
        || !data[key].hasOwnProperty('isVisible')
        || !data[key].hasOwnProperty('validity')
        || !data[key].hasOwnProperty('ignition')
        || !data[key].hasOwnProperty('datetime')
        || !data[key].hasOwnProperty('position')
      ) {
        continue;
      }
      markers.push(data[key]);
    }

    return markers;
  }

  private controlMarker(deviceId: number, data: MarkerData): void {
    if (deviceId in this.markers) {
      this.updateMarker(deviceId, data);
    } else {
      this.createMarker(deviceId, data);
    }
  }

  private updateMarker(deviceId: number, data: MarkerData): void {
    this.markers[deviceId].setOptions({
      position: data.position,
      visible: data.isVisible
    });
  }

  private createMarker(deviceId: number, data: MarkerData): void {
    this.markers[deviceId] = new google.maps.Marker({
      map: this.map,
      position: data.position,
      draggable: false,
      visible: data.isVisible,
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
