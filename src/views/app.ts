import m from 'mithril';

import {
  compatibleChartChildren,
  hiddenSelectedChildCount,
  loadChartSelection,
  selectedChartChildren,
} from '../models/chart-selection';
import {buildChartSeries} from '../models/chart-series';
import {
  LOCAL_STORAGE_KEY,
  PRIVACY_NOTICE_KEY,
  THEME_PREFERENCE_KEY,
} from '../models/constants';
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
import LegalPageComponent, {type LegalPageKey} from './legal';
import PrivacyInfoComponent from './privacy-info';

let showPrivacyInfo = false;
let legalPage: LegalPageKey | null = null;
type ThemePreference = 'auto' | 'light' | 'dark';

function applyTheme(theme: ThemePreference) {
  document.documentElement.dataset.theme = theme;
}

function storedTheme(): ThemePreference {
  const value = localStorage.getItem(THEME_PREFERENCE_KEY);
  return value === 'light' || value === 'dark' ? value : 'auto';
}

function themeLabel(theme: ThemePreference): string {
  return theme === 'light'
    ? 'Claro'
    : theme === 'dark'
      ? 'Oscuro'
      : 'Automático';
}

function themeIcon(theme: ThemePreference): string {
  return theme === 'light' ? '☀' : theme === 'dark' ? '☾' : 'A';
}

function nextTheme(theme: ThemePreference): ThemePreference {
  return theme === 'auto' ? 'light' : theme === 'light' ? 'dark' : 'auto';
}

function legalPageFromHash(): LegalPageKey | null {
  const hash = window.location.hash.slice(1);
  return hash === 'aviso-legal' ||
    hash === 'politica-privacidad' ||
    hash === 'politica-cookies'
    ? hash
    : null;
}

const AppComponent: m.Component<MitosisAttr<App, IAppActions>> = {
  oninit({attrs: {state, actions}}) {
    const updateLegalPage = () => {
      legalPage = legalPageFromHash();
      m.redraw();
    };
    window.addEventListener('hashchange', updateLegalPage);
    legalPage = legalPageFromHash();
    applyTheme(storedTheme());

    // load state from local storage
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data !== null) {
      const state: Child[] = importState(data);
      actions.import(state);
    }

    const chartSelection = loadChartSelection();
    state.chart.selectedChildIds = chartSelection.ids;
    state.chart.selectionInitialized = chartSelection.hasStoredSelection;
    ChartActions(state.chart).loadChart(state.chart.name, 24);

    showPrivacyInfo = localStorage.getItem(PRIVACY_NOTICE_KEY) !== 'seen';
  },

  onremove() {
    legalPage = null;
  },

  onupdate({attrs: {state}}) {
    // save state into local storage
    localStorage.setItem(LOCAL_STORAGE_KEY, exportState(state.children));
  },

  view({attrs: {state, actions}}) {
    if (legalPage) {
      return m(LegalPageComponent, {
        page: legalPage,
        onClose: () => {
          window.location.hash = '';
        },
      });
    }

    const children = state.children.map((child, idx) => {
      child.idx = idx;
      return m(ChildComponent, {
        state: child,
        actions: ChildActions(actions, child),
      });
    });
    const theme = storedTheme();

    const compatibleChildren = compatibleChartChildren(
      state.children,
      state.chart.config,
    );
    const effectiveSelectedChildIds = state.chart.selectionInitialized
      ? state.chart.selectedChildIds
      : compatibleChildren.slice(0, 1).map(child => child.id);
    const selectedChildren = selectedChartChildren(
      state.children,
      state.chart.config,
      effectiveSelectedChildIds,
    );

    // Populate chart data with only the selected compatible children.
    if (state.chart.config) {
      state.chart.data = buildChartSeries(selectedChildren, state.chart.config);
    }

    // Colours per selected child series, used to style the growth chart lines
    // and legend to match the colour the user picked for that child.
    const childColours: Record<string, {label: string; colour: string}> = {};
    for (const child of selectedChildren) {
      childColours[`child-${child.id}`] = {
        label: child.name ?? 'Sin nombre',
        colour: child.colourHex ?? 'var(--chart-patient-fallback)',
      };
    }

    const hiddenSelectionCount = hiddenSelectedChildCount(
      state.children,
      state.chart.config,
      state.chart.selectionInitialized ? state.chart.selectedChildIds : [],
    );
    const chartGuidance =
      hiddenSelectionCount > 0
        ? null
        : selectedChildren.length > 0
          ? null
          : compatibleChildren.length > 0
            ? 'Marca al menos un paciente para ver su línea.'
            : 'Añade fecha de nacimiento, sexo y una medida para ver la línea de tu peque.';

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
        m(
          'button.theme-toggle',
          {
            type: 'button',
            'aria-label': `Tema ${themeLabel(theme)}. Cambiar tema`,
            title: `Tema: ${themeLabel(theme)}`,
            onclick: () => {
              const next = nextTheme(theme);
              localStorage.setItem(THEME_PREFERENCE_KEY, next);
              applyTheme(next);
            },
          },
          themeIcon(theme),
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
              children: state.children,
            }),
            chartGuidance ? m('.chart-guidance', chartGuidance) : null,
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
          'nav.footer-legal-links',
          {'aria-label': 'Información legal'},
          m(
            'a',
            {
              href: '#aviso-legal',
            },
            'Aviso legal',
          ),
          m(
            'a',
            {
              href: '#politica-privacidad',
            },
            'Privacidad',
          ),
          m(
            'a',
            {
              href: '#politica-cookies',
            },
            'Cookies',
          ),
          m(
            'a.footer-source-link',
            {
              href: 'https://github.com/ralph1985/curvas-crecimiento',
              target: '_blank',
              rel: 'noreferrer',
              'aria-label': 'Código fuente en GitHub',
            },
            m('span.github-icon', {'aria-hidden': 'true'}),
            'Código fuente',
          ),
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
