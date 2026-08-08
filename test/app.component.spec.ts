import mq from 'mithril-query';
import o from 'ospec';

import {AppActions, AppState} from '../src/models/state';
import AppComponent from '../src/views/app';

o.spec('App component', () => {
  o('organises the main workflow into accessible tabs', () => {
    const state = AppState();
    const actions = AppActions(state);
    const out = mq(AppComponent, {state, actions});

    out.should.have(2, 'button[role="tab"]');
    out.should.have(1, '#panel-children[role="tabpanel"]');
    out.should.have(1, 'footer a[href="https://conquense.dev"]');
    out.should.have(
      1,
      'footer a[href="https://github.com/fkleon/child-growth-charts"]',
    );
    o(state.section).equals('children');
  });
});
