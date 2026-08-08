import m from 'mithril';

import {exportStateBase64Url, importState} from '../models/export';
import {
  type App,
  type Child,
  type IAppActions,
  type MitosisAttr,
  mergeChildren,
} from '../models/state';

const DataManagementComponent: m.Component<MitosisAttr<App, IAppActions>> = {
  view({attrs: {state, actions}}) {
    const stateUrl = exportStateBase64Url(state.children);

    return m(
      'section.data-management',
      {'aria-labelledby': 'backup-title'},
      m('h3#backup-title', 'Copia de seguridad'),
      m(
        'p',
        'Guarda una copia de tus datos o añade a los que ya tienes una copia exportada antes.',
      ),
      m(
        '.backup-actions',
        m(
          'a',
          {
            class: 'button-secondary',
            id: 'export',
            href: stateUrl,
            download: 'datos-crecimiento.json',
          },
          'Exportar datos',
        ),
        m(
          'label.button-secondary',
          {for: 'import'},
          'Importar datos',
          m('input', {
            type: 'file',
            id: 'import',
            accept: 'application/json',
            onchange: (event: Event) => {
              const input = event.currentTarget as HTMLInputElement;
              const file = input.files?.[0];
              const reader = new FileReader();
              reader.onload = () => {
                const imported = importState(
                  reader.result as string,
                ) as Child[];
                actions.import(mergeChildren(state.children, imported));
                m.redraw();
              };
              if (file) {
                reader.readAsText(file);
                input.value = '';
              }
            },
          }),
        ),
      ),
    );
  },
};

export default DataManagementComponent;
