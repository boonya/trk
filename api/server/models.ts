export interface Device {
  _id?: number;
  name: string;
  ownerId: number;
}

export interface State {
  _id?: number;
  deviceId: number;
  validity: boolean;
  ignition: boolean;
  datetime: string;
  position: string;
}

export interface Visibility {
  _id?: number;
  deviceId: number;
  isVisible: boolean;
  ownerId: number;
}

export interface Location {
  lat: number;
  lng: number;
  zoom: number;
}
