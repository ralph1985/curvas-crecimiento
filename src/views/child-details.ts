import m from 'mithril';

import {LocalDate} from '@js-joda/core';

import type {Child, IChildActions, MitosisAttr, Sex} from '../models/state';

const ChildDetailsComponent: m.Component<MitosisAttr<Child, IChildActions>> = {
  view({attrs: {state, actions}}) {
    return m(
      'fieldset',
      m('legend', 'Datos personales'),
      m(
        'ul',
        m(
          'li',
          m(
            'label',
            {class: 'main', for: `child-${state.idx}-dob`},
            'Fecha de nacimiento',
          ),
          m('input', {
            className: !state.dateOfBirth ? 'invalid' : undefined,
            type: 'date',
            id: `child-${state.idx}-dob`,
            value: state.dateOfBirth,
            required: true,
            onchange: (event: Event) => {
              const value = (event.currentTarget as HTMLInputElement).value;
              try {
                const dateOfBirth = value ? LocalDate.parse(value) : null;
                actions.update(
                  state.name,
                  dateOfBirth ?? state.dateOfBirth,
                  state.sex,
                );
              } catch (error) {
                console.error(
                  'No se ha podido interpretar la fecha de nacimiento',
                  error,
                );
              }
            },
          }),
          m('div', {class: 'error'}, '(obligatorio)'),
        ),
        m(
          'li',
          m('label', {class: 'main', for: `child-${state.idx}-name`}, 'Nombre'),
          m('input', {
            type: 'text',
            id: `child-${state.idx}-name`,
            value: state.name,
            onchange: (event: Event) => {
              actions.update(
                (event.currentTarget as HTMLInputElement).value,
                state.dateOfBirth,
                state.sex,
              );
            },
          }),
        ),
        m(
          'li',
          m('label', {class: 'main', for: `child-${state.idx}-sex`}, 'Sexo'),
          m(
            '.sex-options',
            m(
              'label.sex-option',
              {for: `child-${state.idx}-sex-female`},
              m('input', {
                type: 'radio',
                name: `child-${state.idx}-sex`,
                id: `child-${state.idx}-sex-female`,
                value: 'female',
                checked: state.sex === 'female',
                onchange: (event: Event) =>
                  actions.update(
                    state.name,
                    state.dateOfBirth,
                    (event.currentTarget as HTMLInputElement).value as Sex,
                  ),
              }),
              'Niña',
            ),
            m(
              'label.sex-option',
              {for: `child-${state.idx}-sex-male`},
              m('input', {
                type: 'radio',
                name: `child-${state.idx}-sex`,
                id: `child-${state.idx}-sex-male`,
                value: 'male',
                checked: state.sex === 'male',
                onchange: (event: Event) =>
                  actions.update(
                    state.name,
                    state.dateOfBirth,
                    (event.currentTarget as HTMLInputElement).value as Sex,
                  ),
              }),
              'Niño',
            ),
          ),
        ),
        m(
          'li',
          m(
            'label',
            {class: 'main', for: `child-${state.idx}-color`},
            'Color de la línea',
          ),
          m('input', {
            type: 'color',
            id: `child-${state.idx}-color`,
            value: state.colourHex,
            onchange: (event: Event) =>
              actions.pickColour(
                (event.currentTarget as HTMLInputElement).value,
              ),
          }),
        ),
      ),
    );
  },
};

export default ChildDetailsComponent;
