import {localConfig} from './config.local';

const baseConfig = {
  map: {
    center: {
      latitude: 34.0126238,
      longitude: -118.239342
    },
    zoom: 10
  }
};

export const config = {...baseConfig, ...localConfig};
