import {Meteor} from 'meteor/meteor';
import {Devices} from './collections';

Meteor.startup(() => {
  if (Devices.find({}).cursor.count() === 0) {
    let deviceId;
    deviceId = Devices.collection.insert({
      name: 'Device #1',
      ownerId: 1
    });
  }
});
