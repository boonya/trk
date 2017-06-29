import {MongoObservable} from 'meteor-rxjs';
import {Device} from '../models';

export const Devices = new MongoObservable.Collection<Device>('devices');
