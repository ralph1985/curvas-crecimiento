import m from 'mithril';

import {
  LineChart,
  type LineChartData,
  type SeriesObject,
  type SeriesValue,
} from 'chartist';

import charts from '../data/who';
import type {Chart, IChartActions, MitosisAttr, Sex} from '../models/state';

type MeasurementKind = 'weight' | 'length' | 'head';
type ChartView = 'neonatal' | 'monthly';

type ChartOption = {
  id: string;
  measurement: MeasurementKind;
  sex: Sex;
  view: ChartView;
};

const measurementLabels: Record<MeasurementKind, string> = {
  weight: 'Peso',
  length: 'Longitud',
  head: 'Perímetro craneal',
};

const chartOptions: ChartOption[] = Object.entries(charts).map(
  ([id, config]) => ({
    id,
    measurement: config.measurement,
    sex: config.sex,
    view: config.view,
  }),
);

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

type ChartViewMode = 'monthly' | 'neonatal' | 'custom';
type DurationUnit = 'months' | 'years';

const MAX_MONTHLY_DURATION = 24;
let chartViewMode: ChartViewMode = 'monthly';
let duration = 2;
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
        option.view === desired.view,
    ) ??
    chartOptions.find(
      option =>
        option.measurement === desired.measurement &&
        option.sex === desired.sex &&
        option.view === 'monthly',
    ) ??
    current
  );
}

function monthlyOptionFor(option: ChartOption): ChartOption {
  return (
    chartOptions.find(
      candidate =>
        candidate.measurement === option.measurement &&
        candidate.sex === option.sex &&
        candidate.view === 'monthly',
    ) ?? option
  );
}

const ChartSelectorComponent: m.Component<ChartSelectorAttrs> = {
  oninit({attrs: {state, actions}}) {
    chartViewMode = 'monthly';
    duration = 2;
    durationUnit = 'years';
    actions.loadChart(state.name, MAX_MONTHLY_DURATION);
  },
  view({attrs: {state, actions}}) {
    const current = chartOptions.find(option => option.id === state.name);
    if (!current) {
      return null;
    }

    const monthlyOption = monthlyOptionFor(current);
    const monthlyMaxAgeMonths = charts[monthlyOption.id].maxAgeMonths;
    const maxDuration =
      durationUnit === 'years'
        ? Math.floor(monthlyMaxAgeMonths / 12)
        : MAX_MONTHLY_DURATION;
    const loadView = (option: ChartOption) => {
      const view = chartViewMode === 'neonatal' ? 'neonatal' : 'monthly';
      const selected = chartFor(option, {view});
      const selectedMonthlyOption = monthlyOptionFor(selected);
      const selectedMonthlyMaxAge =
        charts[selectedMonthlyOption.id].maxAgeMonths;
      const selectedMaxDuration =
        durationUnit === 'years'
          ? Math.floor(selectedMonthlyMaxAge / 12)
          : MAX_MONTHLY_DURATION;
      if (chartViewMode === 'custom') {
        duration = Math.min(
          Math.max(durationUnit === 'years' ? 2 : 1, duration),
          selectedMaxDuration,
        );
      }
      const selectedMonths =
        durationUnit === 'years' ? duration * 12 : duration;
      const maxAgeMonths =
        view === 'monthly'
          ? chartViewMode === 'custom'
            ? selectedMonths
            : MAX_MONTHLY_DURATION
          : undefined;
      actions.loadChart(selected.id, maxAgeMonths);
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
        Math.max(unit === 'years' ? 2 : 1, value),
        unit === 'years' ? maxDuration : MAX_MONTHLY_DURATION,
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
            'monthly',
            '0–24 meses',
            chartViewMode === 'monthly',
            selectView,
          ),
          radioOption(
            'chart-view-mode',
            'neonatal',
            '13 semanas',
            chartViewMode === 'neonatal',
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
                  min: durationUnit === 'years' ? 2 : 1,
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
                current.measurement === 'weight'
                  ? 'La referencia de peso está disponible hasta los 10 años.'
                  : current.measurement === 'head'
                    ? 'La referencia de perímetro craneal está disponible hasta los 5 años.'
                    : 'La referencia de longitud/talla está disponible hasta los 18 años y cambia de tramo a partir de los 2 años.',
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
      const monthlyAge =
        attrs.config?.view === 'monthly'
          ? (attrs.config.data.labels?.length ?? 0) - 1
          : 0;
      const axisCaption =
        attrs.config?.view === 'neonatal'
          ? 'Edad (semanas)'
          : monthlyAge > 24
            ? 'Edad (meses hasta 2 años; después, años)'
            : 'Edad (meses)';

      return m(
        'fieldset',
        m('legend', attrs.config?.label),
        m(
          '.chart-plot',
          m(
            '.chart-axis-caption-y',
            {'aria-hidden': 'true'},
            attrs.config?.axisYUnit,
          ),
          m('div', {id: 'chart'}),
        ),
        m('.chart-axis-caption', axisCaption),
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
