export interface CurrentPosition {
  accuracy: number;
  lat: number;
  lng: number;
}

export interface MarkerData {
  deviceId: number;
  title: string;
  isVisible: boolean;
  position: { lat: number; lng: number };
  datetime: string;
  ignition: boolean;
  validity: boolean;
}
