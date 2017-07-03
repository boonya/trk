import {Meteor} from 'meteor/meteor';
import {Devices, Visibilities, States} from './collections';
import {Generator} from './mock';

Meteor.startup(() => {
  const deviceId = 1234567890;
  if (Devices.find({}).cursor.count() === 0) {
    Devices.collection.insert({
      id: deviceId,
      title: 'Device #1',
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

  const routeCoords = [
    {lat: 48.4632592, lng: 35.0552621},
    {lat: 48.492482, lng: 35.055173},
    {lat: 48.501331, lng: 35.043496},
    {lat: 48.505380, lng: 35.044912},
    {lat: 48.508094, lng: 35.045675},
    {lat: 48.513465, lng: 35.032737},
    {lat: 48.518355, lng: 35.038471},
    {lat: 48.5174312, lng: 35.0398013}
  ];

  const generator = new Generator(routeCoords, Meteor.bindEnvironment((input) => {
    const position = input.lat + ',' + input.lng;
    const datetime = new Date().toISOString();
    console.log(' - ', {
      position: position,
      datetime: datetime
    }, '\n');
    States.upsert({deviceId: deviceId}, {
      deviceId: deviceId,
      validity: true,
      ignition: true,
      datetime: datetime,
      position: position
    });
  }), 2000);
  generator.start();
});
