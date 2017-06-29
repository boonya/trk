import {NgModule} from '@angular/core';
import {PreloaderComponent} from './preloader.component';
export {PreloaderComponent} from './preloader.component';

@NgModule({
  declarations: [
    PreloaderComponent
  ],
  exports: [
    PreloaderComponent
  ]
})

export class PreloaderModule {
}
