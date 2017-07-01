import {Meteor} from 'meteor/meteor';
import {Devices, Visibilities, States} from './collections';

Meteor.startup(() => {
  if (Devices.find({}).cursor.count() === 0) {
    const deviceId = Devices.collection.insert({
      name: 'Device #1',
      ownerId: 1
    });

    Visibilities.collection.insert({
      deviceId: deviceId,
      isVisible: true,
      ownerId: 1
    });

    States.collection.insert({
      deviceId: deviceId,
      validity: true,
      ignition: true,
      datetime: '2017-06-30T2:17:35+0300',
      position: '48.499266,35.089325'
    });
  }
});
