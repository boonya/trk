import { browser, by, element } from 'protractor';

export class TrkPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('trk-root h1')).getText();
  }
}
