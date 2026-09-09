import mq from 'mithril-query';
import o from 'ospec';

import {ChronoUnit} from '@js-joda/core';

import {
  type Chart,
  ChartActions,
  ChartState,
  type Child,
  type IChartActions,
  type MitosisAttr,
} from '../src/models/state';
import {ChartSelectorComponent} from '../src/views/chart';
import children from './mock';

o.spec('ChartSelectorComponent', () => {
  o.beforeEach(() => {
    localStorage.clear();
  });

  o('renders with minimal state', () => {
    const state = ChartState();
    const actions = ChartActions(state);
    const chartChildren = [
      {...children[0]},
      {...children[0], id: 'child-lucia', idx: 1, name: 'Lucía'},
    ];
    const attrs: MitosisAttr<Chart, IChartActions> & {children: Child[]} = {
      state,
      actions,
      children: chartChildren,
    };

    const out = mq(ChartSelectorComponent, attrs);
    o(out.rootEl).notEquals(null);

    out.should.have(3, 'input[name="chart-measurement"]');
    out.should.have(2, 'input[name="chart-sex"]');
    out.should.have(3, 'input[name="chart-view-mode"]');
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
    out.should.have(2, 'input[name="chart-patient"]');
    out.should.have(
      1,
      'input[name="chart-patient"][value="child-ava"]:checked',
    );
    out.should.have(
      1,
      'input[name="chart-view-mode"][value="monthly"]:checked',
    );
    const secondPatientSelector =
      'input[name="chart-patient"][value="child-lucia"]';
    (
      (out.rootEl as HTMLElement).querySelector(
        secondPatientSelector,
      ) as HTMLInputElement
    ).checked = true;
    out.setValue(secondPatientSelector, 'child-lucia');
    o(state.selectedChildIds).deepEquals(['child-ava', 'child-lucia']);
    o(localStorage.getItem('growth-chart-selection')).equals(
      '["child-ava","child-lucia"]',
    );

    (
      (out.rootEl as HTMLElement).querySelector(
        secondPatientSelector,
      ) as HTMLInputElement
    ).checked = false;
    out.setValue(secondPatientSelector, 'child-lucia');
    o(state.selectedChildIds).deepEquals(['child-ava']);

    out.setValue('input[name="chart-view-mode"][value="neonatal"]', 'neonatal');
    o(state.name).equals('who-wfa-girls-13-weeks');
    o(state.config?.timeUnit).equals(ChronoUnit.WEEKS);

    out.setValue('input[name="chart-view-mode"][value="monthly"]', 'monthly');
    o(state.name).equals('who-wfa-girls-monthly');
    o(state.config?.data.labels?.length).equals(25);
  });
});
