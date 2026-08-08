import m from 'mithril';

import ModalComponent from './modal';

interface PrivacyInfoAttrs {
  onClose(): void;
}

const PrivacyInfoComponent: m.Component<PrivacyInfoAttrs> = {
  view({attrs: {onClose}}) {
    return m(
      ModalComponent,
      {title: '¿Dónde se guardan?', kicker: 'Tus datos', onClose},
      m(
        'p',
        'Curvas de crecimiento guarda los datos de tus hijos solo en este navegador. La aplicación no los envía a un servidor.',
      ),
      m(
        'p',
        'Si borras los datos de navegación o el almacenamiento local, también se borrarán tus registros. Antes de hacerlo, usa «Exportar datos» para descargar una copia.',
      ),
      m(
        'p',
        'Cuando la necesites, podrás recuperar esa copia desde «Importar datos».',
      ),
      m(
        'p.modal-note',
        'Las curvas usan referencias de crecimiento de la OMS. La aplicación no sustituye la valoración de un profesional sanitario.',
      ),
      m(
        '.modal-actions',
        m(
          'button.primary-action',
          {type: 'button', onclick: onClose},
          'Entendido',
        ),
      ),
    );
  },
};

export default PrivacyInfoComponent;
