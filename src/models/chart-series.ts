import {ChronoUnit, type LocalDate, Period} from '@js-joda/core';
import type {Series} from 'chartist';

import type {Measurement} from './state';
import {dateHistogram, dateHistogramAggregation} from './timeseries';

/** Builds a chart-ready, regularly spaced series from a child's measurements. */
function bucketMeasurements(
  origin: LocalDate,
  measurements: Measurement[],
  timeUnit: ChronoUnit,
  maxBuckets: number,
  fieldAccessor: (measurement: Measurement) => number | undefined,
): Series {
  let interval: Period;

  switch (timeUnit) {
    case ChronoUnit.DAYS:
      interval = Period.ofDays(1);
      break;
    case ChronoUnit.WEEKS:
      interval = Period.ofWeeks(1);
      break;
    case ChronoUnit.MONTHS:
      interval = Period.ofMonths(1);
      break;
    default:
      throw new Error(`Unidad de tiempo no admitida: ${timeUnit}`);
  }

  const originMeasurement: Measurement = {idx: -1, date: origin};
  const filteredMeasurements = measurements.filter(
    measurement => !measurement.date.isBefore(origin),
  );
  const series: Series = Array(maxBuckets).fill(null);
  const histogram = dateHistogram(
    [originMeasurement, ...filteredMeasurements],
    measurement => measurement.date,
    interval,
  );

  for (const [index, bucket] of dateHistogramAggregation(
    histogram,
    fieldAccessor,
  ).buckets.entries()) {
    if (index >= maxBuckets) {
      break;
    }

    series.splice(
      index,
      1,
      Number.isFinite(bucket.value) ? bucket.value : null,
    );
  }

  return series;
}

export {bucketMeasurements};
