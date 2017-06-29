import {MongoObservable} from 'meteor-rxjs';
import {State} from '../models';

export const States = new MongoObservable.Collection<State>('states');
