import m from 'mithril';

import {ChronoUnit} from '@js-joda/core';
import {
  LineChart,
  type LineChartData,
  type SeriesObject,
  type SeriesValue,
} from 'chartist';

import charts from '../data/who';
import type {Chart, IChartActions, MitosisAttr, Sex} from '../models/state';

type MeasurementKind = 'weight' | 'length' | 'head';
type AgeRange = '13-weeks' | '2-years' | '5-years';

type ChartOption = {
  id: string;
  measurement: MeasurementKind;
  sex: Sex;
  ageRange: AgeRange;
};

const measurementLabels: Record<MeasurementKind, string> = {
  weight: 'Peso',
  length: 'Longitud',
  head: 'Perímetro craneal',
};

const chartOptions: ChartOption[] = Object.keys(charts).map(id => {
  const [, code, sex, ...range] = id.split('-');
  const measurementByCode: Record<string, MeasurementKind> = {
    wfa: 'weight',
    hfa: 'length',
    hcfa: 'head',
  };

  return {
    id,
    measurement: measurementByCode[code],
    sex: sex === 'boys' ? 'male' : 'female',
    ageRange: range.join('-') as AgeRange,
  };
});

function radioOption<T extends string>(
  name: string,
  value: T,
  label: string,
  checked: boolean,
  onChange: (value: T) => void,
) {
  const id = `${name}-${value}`;
  return m(
    'label.chart-option',
    {for: id},
    m('input', {
      type: 'radio',
      name,
      id,
      value,
      checked,
      onchange: () => onChange(value),
    }),
    m('span', label),
  );
}

type ChartViewMode = 'initial' | 'custom';
type DurationUnit = 'months' | 'years';

const MAX_AGE_MONTHS = 60;
let chartViewMode: ChartViewMode = 'initial';
let duration = 3;
let durationUnit: DurationUnit = 'years';

type ChartSelectorAttrs = MitosisAttr<Chart, IChartActions>;

function chartFor(
  current: ChartOption,
  changes: Partial<Omit<ChartOption, 'id'>>,
): ChartOption {
  const desired = {...current, ...changes};
  return (
    chartOptions.find(
      option =>
        option.measurement === desired.measurement &&
        option.sex === desired.sex &&
        option.ageRange === desired.ageRange,
    ) ??
    chartOptions.find(
      option =>
        option.measurement === desired.measurement &&
        option.sex === desired.sex,
    ) ??
    current
  );
}

const ChartSelectorComponent: m.Component<ChartSelectorAttrs> = {
  oninit({attrs: {state, actions}}) {
    chartViewMode = 'initial';
    duration = 3;
    durationUnit = 'years';
    actions.loadChart(state.name);
  },
  view({attrs: {state, actions}}) {
    const current = chartOptions.find(option => option.id === state.name);
    if (!current) {
      return null;
    }

    const selectedMonths = durationUnit === 'years' ? duration * 12 : duration;
    const maxDuration = durationUnit === 'years' ? 5 : MAX_AGE_MONTHS;
    const customRange = (measurement: MeasurementKind, months: number) =>
      measurement === 'length' && months <= 24 ? '2-years' : '5-years';
    const loadView = (option: ChartOption) => {
      const range =
        chartViewMode === 'initial'
          ? '13-weeks'
          : customRange(option.measurement, selectedMonths);
      const selected = chartFor(option, {ageRange: range as AgeRange});
      actions.loadChart(
        selected.id,
        chartViewMode === 'custom' ? selectedMonths : undefined,
      );
    };
    const select = (changes: Partial<Omit<ChartOption, 'id'>>) =>
      loadView(chartFor(current, changes));
    const selectView = (mode: ChartViewMode) => {
      chartViewMode = mode;
      loadView(current);
    };
    const updateDuration = (value: number, unit: DurationUnit) => {
      durationUnit = unit;
      duration = Math.min(
        Math.max(1, value),
        unit === 'years' ? 5 : MAX_AGE_MONTHS,
      );
      chartViewMode = 'custom';
      loadView(current);
    };

    return m(
      'section.chart-selector',
      {'aria-labelledby': 'chart-selector-title'},
      m('h3#chart-selector-title', 'Estándar de crecimiento infantil'),
      m(
        'p.chart-selector-intro',
        'Elige una medida y una referencia. Después decide qué tramo quieres ver. Usamos los ',
        m(
          'a',
          {
            href: 'https://www.who.int/tools/child-growth-standards/standards',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          'estándares de crecimiento infantil de la OMS',
        ),
        '.',
      ),
      m(
        'fieldset.chart-option-group',
        m('legend', 'Medida'),
        m(
          '.chart-options',
          (Object.keys(measurementLabels) as MeasurementKind[]).map(
            measurement =>
              radioOption(
                'chart-measurement',
                measurement,
                measurementLabels[measurement],
                current.measurement === measurement,
                measurement => select({measurement}),
              ),
          ),
        ),
      ),
      m(
        'fieldset.chart-option-group',
        m('legend', 'Referencia'),
        m(
          '.chart-options',
          radioOption(
            'chart-sex',
            'female',
            'Niña',
            current.sex === 'female',
            sex => select({sex}),
          ),
          radioOption(
            'chart-sex',
            'male',
            'Niño',
            current.sex === 'male',
            sex => select({sex}),
          ),
        ),
      ),
      m(
        'fieldset.chart-option-group',
        m('legend', 'Vista'),
        m(
          '.chart-options',
          radioOption(
            'chart-view-mode',
            'initial',
            'Detalle inicial',
            chartViewMode === 'initial',
            selectView,
          ),
          radioOption(
            'chart-view-mode',
            'custom',
            'Vista personalizada',
            chartViewMode === 'custom',
            selectView,
          ),
        ),
        chartViewMode === 'custom'
          ? m(
              '.custom-range',
              m('label', {for: 'chart-duration'}, 'Mostrar hasta'),
              m(
                '.custom-range-controls',
                m('input', {
                  id: 'chart-duration',
                  type: 'number',
                  min: 1,
                  max: maxDuration,
                  step: 1,
                  value: duration,
                  onchange: (event: Event) =>
                    updateDuration(
                      Number((event.currentTarget as HTMLInputElement).value),
                      durationUnit,
                    ),
                }),
                m(
                  'select',
                  {
                    'aria-label': 'Unidad de tiempo',
                    value: durationUnit,
                    onchange: (event: Event) =>
                      updateDuration(
                        duration,
                        (event.currentTarget as HTMLSelectElement)
                          .value as DurationUnit,
                      ),
                  },
                  m('option', {value: 'months'}, 'meses'),
                  m('option', {value: 'years'}, 'años'),
                ),
              ),
              m(
                'p.chart-range-help',
                current.measurement === 'length' && selectedMonths > 24
                  ? 'Para longitud, la referencia de la OMS cambia a partir de los 2 años y muestra ese tramo disponible.'
                  : 'Puedes elegir hasta 5 años, que es el máximo disponible en estas referencias.',
              ),
            )
          : null,
      ),
    );
  },
};

type ChartComponentAttrs = Chart & {
  /** Colour and display label per child series name (e.g. `child-0`), used
      to style the corresponding line/points and legend entry to match the
      colour picked for that child. */
  childColours?: Record<string, {label: string; colour: string}>;
};

function ChartComponent(): m.Component<ChartComponentAttrs> {
  let chart: LineChart;
  let data: LineChartData;
  let childColours: Record<string, {label: string; colour: string}> = {};

  function updateData(attrs: ChartComponentAttrs) {
    const baseData = attrs.config?.data ?? {
      labels: [],
      series: [],
    };

    // base data contains the percentile lines
    // map percentiles to ct-series-{a,b,c}
    const percentileNameSequence = [0, 1, 2, 1];
    const base: SeriesObject<number>[] = baseData.series.map((s, i) => ({
      name: `percentile-${i}`,
      className: `ct-series-${String.fromCharCode(
        97 + percentileNameSequence[i % 4],
      )}`,
      data: s as SeriesValue<number>[],
    }));

    // series data contains the measurement lines
    data = {
      labels: baseData.labels,
      series: [...base, ...attrs.data],
    };

    childColours = attrs.childColours ?? {};
  }

  // Applies the colour picked for a child to that child's line/points,
  // overriding the CSS-class based colouring used for the fixed set of
  // percentile series.
  function applySeriesColour(context: {
    type: string;
    series?: {name?: string};
    element: {attr(attributes: Record<string, string>): unknown};
  }) {
    const name = context.series?.name;
    const colour = name ? childColours[name]?.colour : undefined;

    if (colour && (context.type === 'line' || context.type === 'point')) {
      context.element.attr({style: `stroke: ${colour}`});
    }
  }

  return {
    oninit({attrs}) {
      // TODO use named series
      updateData(attrs);
    },
    oncreate({dom, attrs}) {
      const chartElement = dom.querySelector('#chart');
      chart = new LineChart(chartElement, data, attrs.config?.options);
      chart.on('draw', applySeriesColour);
      m.redraw();
    },
    onupdate({attrs}) {
      updateData(attrs);
      chart?.update(data, attrs.config?.options);
    },
    view({attrs}) {
      const childLegend = Object.values(childColours).map(({label, colour}) =>
        m(
          'li',
          {class: 'ct-legend-child', style: `--legend-colour: ${colour}`},
          label,
        ),
      );

      return m(
        'fieldset',
        m('legend', attrs.config?.label),
        m('div', {id: 'chart'}),
        m(
          '.chart-axis-caption',
          `Edad (${attrs.config?.timeUnit === ChronoUnit.DAYS ? 'semanas' : 'meses'})`,
        ),
        m(
          'ul',
          {class: 'ct-legend'},
          m('li', {class: 'ct-series-a'}, 'Percentiles 3 y 97'),
          m('li', {class: 'ct-series-b'}, 'Percentiles 15 y 85'),
          m('li', {class: 'ct-series-c'}, 'Percentil 50'),
          childLegend,
        ),
      );
    },
  };
}

export {ChartComponent, ChartSelectorComponent};
