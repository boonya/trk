import {Component} from '@angular/core';
import {Devices} from '../../api/server/collections';

@Component({
  selector: 'trk-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'trk works!';

  constructor() {
    Devices.find()
      .subscribe(devices => console.log('Devices: ', devices));
  }
}
