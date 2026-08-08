import m from 'mithril';

interface ModalAttrs {
  className?: string;
  title: string;
  kicker?: string;
  onClose(): void;
}

const ModalComponent: m.Component<ModalAttrs> = {
  oncreate({dom}) {
    (dom as HTMLElement).querySelector<HTMLButtonElement>('button')?.focus();
  },
  view(vnode) {
    const {className, title, kicker, onClose} = vnode.attrs;
    const titleId = 'modal-title';

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
        kicker ? m('p.modal-kicker', kicker) : null,
        m(`h2#${titleId}`, title),
        vnode.children,
      ),
    );
  },
};

export default ModalComponent;
