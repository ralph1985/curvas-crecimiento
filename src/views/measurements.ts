import m from 'mithril';

import {convert, LocalDate, Period} from '@js-joda/core';

import {formatAge} from '../models/format';
import {
  type Child,
  type IChildActions,
  type IMeasurementActions,
  type Measurement,
  MeasurementActions,
  type MitosisAttr,
} from '../models/state';
import ConfirmModalComponent from './confirm-modal';

const deletingMeasurements = new WeakSet<Measurement>();

type MeasurementRowAttrs = MitosisAttr<Measurement, IMeasurementActions> & {
  dateOfBirth?: LocalDate;
};

const MeasurementTableComponent: m.Component<
  MitosisAttr<Child, IChildActions>
> = {
  oncreate({dom}) {
    (dom as HTMLElement).querySelector('input')?.focus();
  },
  view({attrs: {state, actions}}) {
    const rows = state.measurements.map((measurement, idx) => {
      measurement.idx = idx;
      return m(MeasurementRowComponent, {
        state: measurement,
        actions: MeasurementActions(actions, measurement),
        dateOfBirth: state.dateOfBirth ?? measurement.dateOfBirth,
      });
    });

    return m(
      'fieldset',
      m('legend', 'Mediciones'),
      m(
        'table',
        m('caption', 'Mediciones de crecimiento'),
        m(
          'thead',
          m(
            'tr',
            m('th', 'Fecha'),
            m('th', 'Edad'),
            m('th', 'Peso (kg)'),
            m('th', 'Longitud (cm)'),
            m('th', 'Perímetro craneal (cm)'),
            m('th', 'Acciones'),
          ),
        ),
        m('tbody', rows),
      ),
      m(
        '.measurement-actions',
        m('button', {type: 'submit'}, 'Añadir medición'),
      ),
    );
  },
};

const MeasurementRowComponent: m.Component<MeasurementRowAttrs> = {
  view({attrs: {state, actions, dateOfBirth}}) {
    const dateLabel = convert(state.date).toDate().toLocaleDateString('es-ES');
    const cancelDelete = () => deletingMeasurements.delete(state);
    const removeMeasurement = () => {
      deletingMeasurements.delete(state);
      actions.remove();
    };
    return m(
      'tr',
      m(
        'td',
        {'data-label': 'Fecha de la medición'},
        m('input', {
          type: 'date',
          name: `date-${state.idx}`,
          value: state.date,
          required: true,
          onchange: (event: Event) => {
            const value = (event.currentTarget as HTMLInputElement).value;
            try {
              actions.update(
                value ? LocalDate.parse(value) : state.date,
                state.weight,
                state.length,
                state.head,
              );
            } catch (error) {
              console.error('No se ha podido interpretar la fecha', error);
            }
          },
        }),
      ),
      m(
        'td',
        {'data-label': 'Edad en la medición'},
        dateOfBirth
          ? formatAge(Period.between(dateOfBirth, state.date))
          : 'desconocida',
      ),
      numericInput(
        'Peso (kg)',
        `weight-${state.idx}`,
        state.weight,
        0.001,
        value => actions.update(state.date, value, state.length, state.head),
      ),
      numericInput(
        'Longitud (cm)',
        `length-${state.idx}`,
        state.length,
        0.1,
        value => actions.update(state.date, state.weight, value, state.head),
      ),
      numericInput(
        'Perímetro craneal (cm)',
        `head-${state.idx}`,
        state.head,
        0.1,
        value => actions.update(state.date, state.weight, state.length, value),
      ),
      m(
        'td',
        {'data-label': 'Eliminar'},
        m(
          'button',
          {
            type: 'button',
            class: 'icon-button',
            'aria-label': `Eliminar la medición del ${dateLabel}`,
            onclick: (event: Event) => {
              event.preventDefault();
              const needConfirm = state.head || state.length || state.weight;
              if (!needConfirm) {
                actions.remove();
              } else {
                deletingMeasurements.add(state);
              }
            },
          },
          '×',
        ),
      ),
      deletingMeasurements.has(state)
        ? m(ConfirmModalComponent, {
            title: '¿Eliminar esta medición?',
            message: `Se eliminará la medición del ${dateLabel}.`,
            onCancel: cancelDelete,
            onConfirm: removeMeasurement,
          })
        : null,
    );
  },
};

function numericInput(
  label: string,
  name: string,
  value: number | undefined,
  step: number,
  onChange: (value: number) => void,
) {
  return m(
    'td',
    {'data-label': label},
    m('input', {
      type: 'number',
      name,
      value,
      min: 0,
      step,
      onchange: (event: Event) =>
        onChange(Number((event.currentTarget as HTMLInputElement).value)),
    }),
  );
}

export {MeasurementRowComponent, MeasurementTableComponent};
