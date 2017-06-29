import {Component} from '@angular/core';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {PreloaderService} from '../../services';

@Component({
  selector: 'trk-preloader',
  templateUrl: './preloader.html',
  styleUrls: ['./preloader.less'],
  animations: [
    trigger('visibility', [
      state('void', style({
        'opacity': 0
      })),
      transition('* => *', animate(1000))
    ])
  ]
})
export class PreloaderComponent {
  isVisible = false;

  constructor(private preloaderService: PreloaderService) {
    preloaderService.visibility$.subscribe(value => {
      this.isVisible = value;
    });
  }
}
