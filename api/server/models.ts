export interface Device {
  _id?: string;
  name?: string;
  ownerId?: number;
}

export interface State {
  _id?: string;
  deviceId?: string;
  validity?: boolean;
  ignition?: boolean;
  datetime?: string;
  position?: string;
}

export interface Visibility {
  _id?: string;
  deviceId?: string;
  isVisible?: boolean;
  ownerId?: number;
}

export interface Location {
  lat: number;
  lng: number;
  zoom: number;
}
