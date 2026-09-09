import o from 'ospec';

import {ChronoUnit, LocalDate} from '@js-joda/core';

import charts from '../src/data/who';
import {bucketMeasurements, buildChartSeries} from '../src/models/chart-series';
import {ChartActions, ChartState, type Child} from '../src/models/state';

o.spec('Chart series', () => {
  o('buckets neonatal measurements by week', () => {
    const origin = LocalDate.of(2024, 1, 1);
    const series = bucketMeasurements(
      origin,
      [
        {idx: 0, date: origin, weight: 3.2},
        {idx: 1, date: origin.plusDays(7), weight: 3.8},
        {idx: 2, date: origin.plusDays(13), weight: 4.1},
      ],
      ChronoUnit.WEEKS,
      4,
      measurement => measurement.weight,
    );

    o(series).deepEquals([3.2, 3.8, null, null]);
  });

  o('buckets monthly measurements from birth', () => {
    const origin = LocalDate.of(2024, 1, 1);
    const series = bucketMeasurements(
      origin,
      [
        {idx: 0, date: origin.minusDays(1), weight: 2.9},
        {idx: 1, date: origin, weight: 3.2},
        {idx: 2, date: origin.plusMonths(1), weight: 4.1},
        {idx: 3, date: origin.plusMonths(24), weight: 12.1},
        {idx: 4, date: origin.plusMonths(25), weight: 12.5},
      ],
      ChronoUnit.MONTHS,
      26,
      measurement => measurement.weight,
    );

    o(series[0]).equals(3.2);
    o(series[1]).equals(4.1);
    o(series[24]).equals(12.1);
    o(series[25]).equals(12.5);
    o(series[2]).equals(null);
  });

  o('keeps length and head circumference independent', () => {
    const dateOfBirth = LocalDate.of(2024, 1, 1);
    const child: Child = {
      id: 'child-girl',
      idx: 0,
      open: true,
      name: 'Nina',
      dateOfBirth,
      sex: 'female',
      measurements: [
        {idx: 0, date: dateOfBirth, length: 50, head: 34},
        {idx: 1, date: dateOfBirth.plusMonths(1), head: 35},
        {idx: 2, date: dateOfBirth.plusMonths(2), length: 54},
        {idx: 3, date: dateOfBirth.plusMonths(25), length: 80, head: 60},
      ],
    };
    const chart = ChartState();
    const actions = ChartActions(chart);

    actions.loadChart('who-hfa-girls-monthly', 24);
    const lengthSeries = buildChartSeries([child], chart.config!);
    actions.loadChart('who-hcfa-girls-monthly', 24);
    const headSeries = buildChartSeries([child], chart.config!);

    o(lengthSeries.length).equals(1);
    o(lengthSeries[0].data).deepEquals([
      50,
      null,
      54,
      ...Array.from({length: 22}, () => null),
    ]);
    o(headSeries[0].data).deepEquals([
      34,
      35,
      null,
      ...Array.from({length: 22}, () => null),
    ]);
  });

  o('supports the male neonatal length and head charts', () => {
    const dateOfBirth = LocalDate.of(2024, 1, 1);
    const child: Child = {
      id: 'child-boy',
      idx: 0,
      open: true,
      name: 'Nino',
      dateOfBirth,
      sex: 'male',
      measurements: [
        {idx: 0, date: dateOfBirth, length: 51, head: 35},
        {idx: 1, date: dateOfBirth.plusWeeks(1), length: 52},
      ],
    };
    const lengthConfig = charts['who-hfa-boys-13-weeks'];
    const headConfig = charts['who-hcfa-boys-13-weeks'];

    o(buildChartSeries([child], lengthConfig)[0].data[0]).equals(51);
    o(buildChartSeries([child], lengthConfig)[0].data[1]).equals(52);
    o(buildChartSeries([child], headConfig)[0].data[0]).equals(35);
    o(buildChartSeries([child], headConfig)[0].data[1]).equals(null);
  });

  o('ignores measurements before birth and after the selected range', () => {
    const dateOfBirth = LocalDate.of(2024, 1, 1);
    const child: Child = {
      id: 'child-range',
      idx: 0,
      open: true,
      name: 'Rango',
      dateOfBirth,
      sex: 'female',
      measurements: [
        {idx: 0, date: dateOfBirth.minusDays(1), length: 49},
        {idx: 1, date: dateOfBirth.plusMonths(24), length: 75},
        {idx: 2, date: dateOfBirth.plusMonths(25), length: 80},
      ],
    };
    const chart = ChartState();
    ChartActions(chart).loadChart('who-hfa-girls-monthly', 24);
    const data = buildChartSeries([child], chart.config!)[0].data;

    o(data.length).equals(25);
    o(data[0]).equals(null);
    o(data[24]).equals(75);
  });
});
