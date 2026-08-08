import mq from 'mithril-query';
import o from 'ospec';

import {
  type Chart,
  ChartActions,
  ChartState,
  type IChartActions,
  type MitosisAttr,
} from '../src/models/state';
import {ChartSelectorComponent} from '../src/views/chart';

o.spec('ChartSelectorComponent', () => {
  o('renders with minimal state', () => {
    const state = ChartState();
    const actions = ChartActions(state);
    const attrs: MitosisAttr<Chart, IChartActions> & {children: []} = {
      state,
      actions,
      children: [],
    };

    const out = mq(ChartSelectorComponent, attrs);
    o(out.rootEl).notEquals(null);

    out.should.have(3, 'input[name="chart-measurement"]');
    out.should.have(2, 'input[name="chart-sex"]');
    out.should.have(2, 'input[name="chart-view-mode"]');
    out.should.have(
      1,
      'a[href="https://www.who.int/tools/child-growth-standards/standards"][target="_blank"][rel="noopener noreferrer"]',
    );
    out.should.not.have('button.button-secondary');
    out.should.have(
      1,
      'input[name="chart-measurement"][value="weight"]:checked',
    );
    out.should.have(1, 'input[name="chart-sex"][value="female"]:checked');
  });
});
