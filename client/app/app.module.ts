import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {NavbarModule, MapModule} from '../modules';
import {PreloaderComponent} from '../components';
import {LoggerService, PreloaderService} from '../services';

@NgModule({
  declarations: [
    AppComponent,
    PreloaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NavbarModule,
    MapModule
  ],
  providers: [
    LoggerService,
    PreloaderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
