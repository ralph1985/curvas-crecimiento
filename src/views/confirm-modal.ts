import m from 'mithril';

import ModalComponent from './modal';

interface ConfirmModalAttrs {
  message: string;
  onCancel(): void;
  onConfirm(): void;
  title: string;
}

const ConfirmModalComponent: m.Component<ConfirmModalAttrs> = {
  view({attrs: {message, onCancel, onConfirm, title}}) {
    return m(
      ModalComponent,
      {title, kicker: 'Confirma la acción', onClose: onCancel},
      m('p', message),
      m(
        '.modal-actions',
        m(
          'button.button-secondary',
          {type: 'button', onclick: onCancel},
          'Cancelar',
        ),
        m(
          'button.danger-action',
          {type: 'button', onclick: onConfirm},
          'Eliminar',
        ),
      ),
    );
  },
};

export default ConfirmModalComponent;
