import {MongoObservable} from 'meteor-rxjs';
import {Visibility} from '../models';

export const Visibilities = new MongoObservable.Collection<Visibility>('visibilities');
