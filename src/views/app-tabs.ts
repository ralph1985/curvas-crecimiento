import m from 'mithril';

import type {AppSection} from '../models/state';

interface AppTabsAttrs {
  section: AppSection;
  onSelect(section: AppSection): void;
}

const tabs = [
  {id: 'children', label: 'Mis peques'},
  {id: 'chart', label: 'Curvas'},
] as const;

const AppTabsComponent: m.Component<AppTabsAttrs> = {
  view({attrs: {section, onSelect}}) {
    return m(
      'nav.app-tabs',
      {role: 'tablist', 'aria-label': 'Secciones de la aplicación'},
      tabs.map((tab, index) =>
        m(
          'button',
          {
            id: `tab-${tab.id}`,
            type: 'button',
            role: 'tab',
            'aria-selected': section === tab.id,
            'aria-controls': `panel-${tab.id}`,
            class: section === tab.id ? 'is-active' : undefined,
            onclick: () => onSelect(tab.id),
            onkeydown: (event: KeyboardEvent) => {
              const nextIndex =
                event.key === 'ArrowRight'
                  ? (index + 1) % tabs.length
                  : event.key === 'ArrowLeft'
                    ? (index - 1 + tabs.length) % tabs.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? tabs.length - 1
                        : null;

              if (nextIndex === null) {
                return;
              }

              event.preventDefault();
              const nextTab = tabs[nextIndex];
              onSelect(nextTab.id);
              document.getElementById(`tab-${nextTab.id}`)?.focus();
            },
          },
          tab.label,
        ),
      ),
    );
  },
};

export default AppTabsComponent;
