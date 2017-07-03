export interface Device {
  _id?: string;
  id?: number;
  title?: string;
  ownerId?: number;
}

export interface State {
  _id?: string;
  deviceId?: number;
  validity?: boolean;
  ignition?: boolean;
  datetime?: string;
  position?: string;
}

export interface Visibility {
  _id?: string;
  deviceId?: number;
  isVisible?: boolean;
  ownerId?: number;
}
