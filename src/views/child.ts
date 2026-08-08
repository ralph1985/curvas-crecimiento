import m from 'mithril';

import {LocalDate, Period} from '@js-joda/core';

import {formatAge} from '../models/format';
import type {Child, IChildActions, MitosisAttr} from '../models/state';
import ChildDetailsComponent from './child-details';
import ConfirmModalComponent from './confirm-modal';
import {MeasurementTableComponent} from './measurements';
import ModalComponent from './modal';

const editingChildren = new WeakSet<Child>();
const editingMeasurements = new WeakSet<Child>();
const deletingChildren = new WeakSet<Child>();

const ChildComponent: m.Component<MitosisAttr<Child, IChildActions>> = {
  view({attrs: {state, actions}}) {
    const name = state.name ?? 'Sin nombre';
    const age = state.dateOfBirth
      ? Period.between(state.dateOfBirth, LocalDate.now())
      : null;
    const summary = `${name}${age ? `, ${formatAge(age)}` : ''}`;

    const closeEditor = () => editingChildren.delete(state);
    const closeMeasurements = () => editingMeasurements.delete(state);
    const cancelDelete = () => deletingChildren.delete(state);
    const removeChild = () => {
      deletingChildren.delete(state);
      actions.remove();
    };

    return m(
      '.child-card',
      m(
        '.child-card-header',
        m(
          'button.child-summary',
          {
            type: 'button',
            onclick: () => editingChildren.add(state),
          },
          m('span', summary),
          m('span.child-edit-hint', 'Editar datos'),
        ),
        m(
          '.child-card-actions',
          m(
            'button.button-secondary.child-action',
            {
              type: 'button',
              onclick: () => editingMeasurements.add(state),
            },
            'Mediciones',
          ),
        ),
        m(
          'button',
          {
            type: 'button',
            class: 'icon-button',
            'aria-label': `Eliminar a ${name}`,
            onclick: (event: Event) => {
              event.preventDefault();
              event.stopPropagation();
              const needConfirm =
                state.dateOfBirth ||
                state.measurements.length ||
                state.name ||
                state.sex;
              if (!needConfirm) {
                actions.remove();
              } else {
                deletingChildren.add(state);
              }
            },
          },
          '×',
        ),
      ),
      editingChildren.has(state)
        ? m(
            ModalComponent,
            {
              title: `Editar datos de ${name}`,
              kicker: 'Datos del peque',
              onClose: closeEditor,
            },
            m(ChildDetailsComponent, {state, actions}),
            m(
              '.modal-actions',
              m(
                'button.primary-action',
                {type: 'button', onclick: closeEditor},
                'Guardar y cerrar',
              ),
            ),
          )
        : null,
      editingMeasurements.has(state)
        ? m(
            ModalComponent,
            {
              className: 'modal-wide',
              title: `Editar mediciones de ${name}`,
              kicker: 'Mediciones',
              onClose: closeMeasurements,
            },
            m(
              'form',
              {
                onsubmit: (event: SubmitEvent) => {
                  event.preventDefault();
                  actions.addMeasurement();
                },
              },
              m(MeasurementTableComponent, {state, actions}),
              m(
                '.modal-actions',
                m(
                  'button.button-secondary',
                  {type: 'button', onclick: closeMeasurements},
                  'Cerrar',
                ),
              ),
            ),
          )
        : null,
      deletingChildren.has(state)
        ? m(ConfirmModalComponent, {
            title: `¿Eliminar a ${name}?`,
            message: 'Se borrarán todos sus datos y sus mediciones.',
            onCancel: cancelDelete,
            onConfirm: removeChild,
          })
        : null,
    );
  },
};

export default ChildComponent;
