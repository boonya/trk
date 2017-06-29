import { TrkPage } from './app.po';

describe('trk App', () => {
  let page: TrkPage;

  beforeEach(() => {
    page = new TrkPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('trk works!');
  });
});
