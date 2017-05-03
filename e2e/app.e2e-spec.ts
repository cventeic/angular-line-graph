import { GraphLibPage } from './app.po';

describe('graph-lib App', () => {
  let page: GraphLibPage;

  beforeEach(() => {
    page = new GraphLibPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
