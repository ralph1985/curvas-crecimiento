import m from 'mithril';

import type {SeriesObject} from 'chartist';

import {bucketMeasurements} from '../models/chart-series';
import {LOCAL_STORAGE_KEY, PRIVACY_NOTICE_KEY} from '../models/constants';
import {exportState, importState} from '../models/export';
import {
  type App,
  ChartActions,
  type Child,
  ChildActions,
  type IAppActions,
  type MitosisAttr,
} from '../models/state';
import AppTabsComponent from './app-tabs';
import {ChartComponent, ChartSelectorComponent} from './chart';
import ChildComponent from './child';
import DataManagementComponent from './data-management';
import PrivacyInfoComponent from './privacy-info';

let showPrivacyInfo = false;

const AppComponent: m.Component<MitosisAttr<App, IAppActions>> = {
  oninit({attrs: {actions}}) {
    // load state from local storage
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data !== null) {
      const state: Child[] = importState(data);
      actions.import(state);
    }

    showPrivacyInfo = localStorage.getItem(PRIVACY_NOTICE_KEY) !== 'seen';
  },

  onupdate({attrs: {state}}) {
    // save state into local storage
    localStorage.setItem(LOCAL_STORAGE_KEY, exportState(state.children));
  },

  view({attrs: {state, actions}}) {
    const children = state.children.map((child, idx) => {
      child.idx = idx;
      return m(ChildComponent, {
        state: child,
        actions: ChildActions(actions, child),
      });
    });

    // Colours per child series, used to style the growth chart lines
    // and legend to match the colour the user picked for that child.
    const childColours: Record<string, {label: string; colour: string}> = {};
    for (const child of state.children) {
      if (child.colourHex) {
        childColours[`child-${child.idx}`] = {
          label: child.name ?? 'Sin nombre',
          colour: child.colourHex,
        };
      }
    }

    // Populate chart data
    if (state.chart.config) {
      const {data, offset, timeUnit, sex, accessorFn} = state.chart.config!;
      const bucketCount = data.labels?.length ?? 0;

      const childData: SeriesObject[] = state.children
        .filter(c => c.dateOfBirth)
        .filter(c => c.sex === null || c.sex === sex)
        .map(c => ({
          name: `child-${c.idx}`,
          className: `ct-series-${String.fromCharCode(97 + c.idx + 3)}`,
          data: bucketMeasurements(
            c.dateOfBirth!.plus(offset),
            c.measurements,
            timeUnit,
            bucketCount,
            accessorFn,
          ),
        }));

      state.chart.data = childData;
    }

    const hasCompatibleMeasurements = state.chart.config
      ? state.children.some(
          child =>
            child.dateOfBirth &&
            child.sex === state.chart.config?.sex &&
            child.measurements.some(measurement =>
              Number.isFinite(state.chart.config?.accessorFn(measurement)),
            ),
        )
      : false;

    return m(
      '.app-shell',
      m(
        'header.app-header',
        m('.brand-mark', {
          role: 'img',
          'aria-label': 'Chupete de Curvas de crecimiento',
        }),
        m(
          '.title-container',
          m('h1', 'Curvas de crecimiento infantiles'),
          m(
            'p',
            'Guarda medidas y consulta su evolución desde este navegador.',
          ),
        ),
      ),
      m(AppTabsComponent, {
        section: state.section,
        onSelect: actions.setSection,
      }),
      state.section === 'children'
        ? m(
            'section.app-panel',
            {
              id: 'panel-children',
              role: 'tabpanel',
              'aria-labelledby': 'tab-children',
            },
            m('h2', 'Mis peques'),
            m(
              'p.panel-intro',
              'Guarda aquí sus datos y sus mediciones. Solo se quedan en este navegador.',
            ),
            children,
            m(
              'button',
              {
                class: 'primary-action',
                type: 'button',
                onclick: () => actions.addChild(),
              },
              'Añadir peque',
            ),
            m(DataManagementComponent, {state, actions}),
          )
        : m(
            'section.app-panel',
            {
              id: 'panel-chart',
              role: 'tabpanel',
              'aria-labelledby': 'tab-chart',
            },
            m('h2', 'Curvas'),
            m(
              'p.panel-intro',
              'Compara sus medidas con las referencias de crecimiento.',
            ),
            m(ChartSelectorComponent, {
              state: state.chart,
              actions: ChartActions(state.chart),
            }),
            hasCompatibleMeasurements
              ? null
              : m(
                  '.chart-guidance',
                  'Añade fecha de nacimiento, sexo y una medida para ver la línea de tu peque.',
                ),
            m(ChartComponent, {...state.chart, childColours}),
          ),
      m(
        'footer.app-footer',
        m(
          'button.footer-info-link',
          {
            type: 'button',
            onclick: () => {
              showPrivacyInfo = true;
            },
          },
          'Cómo se guardan tus datos',
        ),
        m(
          'p',
          'Mantenida por ',
          m(
            'a',
            {
              href: 'https://conquense.dev',
              target: '_blank',
              rel: 'noreferrer',
            },
            'conquense.dev',
          ),
          '. Basada en ',
          m(
            'a',
            {
              href: 'https://github.com/fkleon/child-growth-charts',
              target: '_blank',
              rel: 'noreferrer',
            },
            'child-growth-charts de Frederik Leonhardt',
          ),
          '.',
        ),
      ),
      showPrivacyInfo
        ? m(PrivacyInfoComponent, {
            onClose: () => {
              localStorage.setItem(PRIVACY_NOTICE_KEY, 'seen');
              showPrivacyInfo = false;
            },
          })
        : null,
    );
  },
};

export default AppComponent;
