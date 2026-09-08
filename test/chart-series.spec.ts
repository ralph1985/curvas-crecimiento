import o from 'ospec';

import {ChronoUnit, LocalDate} from '@js-joda/core';

import {bucketMeasurements} from '../src/models/chart-series';

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
});
