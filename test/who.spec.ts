import o from 'ospec';

import {ChronoUnit} from '@js-joda/core';

import charts from '../src/data/who';
import {ChartActions, ChartState} from '../src/models/state';

o.spec('WHO chart references', () => {
  o('exposes the supported monthly coverage per indicator', () => {
    o(charts['who-wfa-girls-monthly'].maxAgeMonths).equals(120);
    o(charts['who-hfa-girls-monthly'].maxAgeMonths).equals(216);
    o(charts['who-hcfa-girls-monthly'].maxAgeMonths).equals(60);

    for (const id of [
      'who-wfa-girls-monthly',
      'who-hfa-girls-monthly',
      'who-hcfa-girls-monthly',
    ]) {
      const config = charts[id];
      const pointCount = config.data.labels?.length ?? 0;
      o(
        config.data.series.every(series => {
          return (series as unknown[]).length === pointCount;
        }),
      ).equals(true);
    }
  });

  o('uses monthly labels until 24 months and annual labels afterwards', () => {
    const labels = charts['who-hfa-girls-monthly'].data.labels ?? [];

    o(labels.slice(0, 25)).deepEquals(
      Array.from({length: 25}, (_value, age) => age),
    );
    o(labels[25]).equals('');
    o(labels[36]).equals(3);
    o(labels[48]).equals(4);
    o(labels[60]).equals(5);
    o(labels[61]).equals('');
    o(labels[216]).equals(18);
  });

  o('keeps the neonatal reference at 14 weekly points', () => {
    const config = charts['who-wfa-girls-13-weeks'];

    o(config.timeUnit).equals(ChronoUnit.WEEKS);
    o(config.data.labels?.length).equals(14);
    o((config.data.series[0] as unknown[]).length).equals(14);
  });

  o('slices the monthly reference at the requested age', () => {
    const state = ChartState();
    const actions = ChartActions(state);

    actions.loadChart('who-hfa-girls-monthly', 24);
    o(state.config?.data.labels?.length).equals(25);
    o(state.config?.data.labels?.at(-1)).equals(24);

    actions.loadChart('who-hfa-girls-monthly', 36);
    o(state.config?.data.labels?.length).equals(37);
    o(state.config?.data.labels?.at(-1)).equals(3);
  });
});
