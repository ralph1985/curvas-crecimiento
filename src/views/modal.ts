import m from 'mithril';

interface ModalAttrs {
  className?: string;
  title: string;
  kicker?: string;
  onClose(): void;
}

type ModalState = {titleId: string};

let modalInstance = 0;

const ModalComponent: m.Component<ModalAttrs, ModalState> = {
  oninit({state}) {
    state.titleId = `modal-title-${++modalInstance}`;
  },
  oncreate({dom}) {
    const modal = dom as HTMLElement;
    modal.querySelector<HTMLButtonElement>('button')?.focus();
    const content = modal.querySelector<HTMLElement>('.modal-content');
    if (content) {
      content.scrollTop = 0;
      content.scrollLeft = 0;
    }
  },
  view(vnode) {
    const {className, title, kicker, onClose} = vnode.attrs;
    const {titleId} = vnode.state;

    return m(
      '.modal-backdrop',
      {
        role: 'presentation',
        onclick: (event: MouseEvent) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        },
      },
      m(
        'section.modal',
        {
          class: className ? `modal ${className}` : undefined,
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': titleId,
          onkeydown: (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              onClose();
            }
          },
        },
        m(
          'button.modal-close',
          {
            type: 'button',
            'aria-label': `Cerrar ${title.toLowerCase()}`,
            onclick: onClose,
          },
          '×',
        ),
        m(
          '.modal-content',
          kicker ? m('p.modal-kicker', kicker) : null,
          m(`h2#${titleId}`, title),
          vnode.children,
        ),
      ),
    );
  },
};

export default ModalComponent;
