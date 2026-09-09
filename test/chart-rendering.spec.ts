import o from 'ospec';

import type {LineChartData, SeriesObject} from 'chartist';

import {buildChartData} from '../src/views/chart';

o.spec('Chart rendering', () => {
  o(
    'assigns semantic classes to references and preserves patient series',
    () => {
      const patientSeries: SeriesObject[] = [
        {
          name: 'child-ava',
          className: 'ct-series-d ct-patient',
          data: [3.2, null],
        },
      ];
      const baseData: LineChartData = {
        labels: [0, 1],
        series: [
          [2.4, 2.5],
          [2.8, 2.9],
          [3.2, 3.3],
          [3.7, 3.9],
          [4.2, 4.4],
        ],
      };

      const data = buildChartData(baseData, patientSeries);
      const references = data.series.slice(0, 5) as SeriesObject[];

      o(references.map(series => series.name)).deepEquals([
        'percentile-0',
        'percentile-1',
        'percentile-2',
        'percentile-3',
        'percentile-4',
      ]);
      o(references.map(series => series.className)).deepEquals([
        'ct-percentile ct-percentile-outer',
        'ct-percentile ct-percentile-inner',
        'ct-percentile ct-percentile-median',
        'ct-percentile ct-percentile-inner',
        'ct-percentile ct-percentile-outer',
      ]);
      o(data.series[5]).deepEquals(patientSeries[0]);
    },
  );
});
