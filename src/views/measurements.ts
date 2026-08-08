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

type MeasurementDraft = {
  date: string;
  weight: string;
  length: string;
  head: string;
  error?: string;
};

const measurementDrafts = new WeakMap<Child, MeasurementDraft>();

type MeasurementRowAttrs = MitosisAttr<Measurement, IMeasurementActions> & {
  dateOfBirth?: LocalDate;
};

const MeasurementTableComponent: m.Component<
  MitosisAttr<Child, IChildActions>
> = {
  oncreate({dom}) {
    (dom as HTMLElement).querySelector<HTMLInputElement>('input')?.focus();
  },
  view({attrs: {state, actions}}) {
    const draft = getMeasurementDraft(state);
    const rows = state.measurements.map((measurement, idx) => {
      measurement.idx = idx;
      return m(MeasurementRowComponent, {
        state: measurement,
        actions: MeasurementActions(actions, measurement),
        dateOfBirth: state.dateOfBirth ?? measurement.dateOfBirth,
      });
    });

    return m(
      '.measurements-editor',
      m(
        'form.measurement-form',
        {
          onsubmit: (event: SubmitEvent) => {
            event.preventDefault();

            if (![draft.weight, draft.length, draft.head].some(hasValue)) {
              draft.error = 'Añade al menos un valor para guardar la medición.';
              return;
            }

            try {
              actions.addMeasurement({
                idx: -1,
                date: LocalDate.parse(draft.date),
                weight: parseDraftValue(draft.weight),
                length: parseDraftValue(draft.length),
                head: parseDraftValue(draft.head),
                dateOfBirth: state.dateOfBirth,
              });
              measurementDrafts.set(state, createMeasurementDraft(state));
            } catch (error) {
              draft.error = 'Revisa la fecha e inténtalo de nuevo.';
              console.error('No se ha podido crear la medición', error);
            }
          },
        },
        m(
          'fieldset.measurement-entry',
          m('legend', 'Añadir medición'),
          m(
            'p.measurement-help',
            'Registra las medidas disponibles de esta visita. Puedes completar solo una, dos o las tres.',
          ),
          m(
            '.measurement-form-grid',
            measurementDateInput(state, draft),
            draftNumericInput('Peso', 'kg', 'weight', draft, 0.001),
            draftNumericInput('Longitud', 'cm', 'length', draft, 0.1),
            draftNumericInput('Perímetro craneal', 'cm', 'head', draft, 0.1),
          ),
          draft.error ? m('p.measurement-error', draft.error) : null,
          m(
            '.measurement-actions',
            m('button.primary-action', {type: 'submit'}, 'Añadir medición'),
          ),
        ),
      ),
      m(
        'fieldset.measurement-history',
        m('legend', 'Historial de mediciones'),
        state.measurements.length
          ? m(
              '.measurement-table-wrap',
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
            )
          : m(
              'p.measurement-empty',
              'Todavía no hay mediciones. Añade la primera arriba para empezar a ver su evolución.',
            ),
      ),
    );
  },
};

function getMeasurementDraft(child: Child): MeasurementDraft {
  const existing = measurementDrafts.get(child);
  if (existing) {
    return existing;
  }

  const draft = createMeasurementDraft(child);
  measurementDrafts.set(child, draft);
  return draft;
}

function createMeasurementDraft(child: Child): MeasurementDraft {
  return {
    date: (
      child.measurements.at(-1)?.date.plusDays(1) ??
      child.dateOfBirth ??
      LocalDate.now()
    ).toString(),
    weight: '',
    length: '',
    head: '',
  };
}

function hasValue(value: string): boolean {
  return value.trim() !== '';
}

function parseDraftValue(value: string): number | undefined {
  return hasValue(value) ? Number(value) : undefined;
}

function measurementDateInput(child: Child, draft: MeasurementDraft): m.Vnode {
  return m(
    '.measurement-field',
    m('label', {for: `new-measurement-date-${child.idx}`}, 'Fecha'),
    m('input', {
      id: `new-measurement-date-${child.idx}`,
      type: 'date',
      value: draft.date,
      required: true,
      onchange: (event: Event) => {
        draft.date = (event.currentTarget as HTMLInputElement).value;
        draft.error = undefined;
      },
    }),
  );
}

function draftNumericInput(
  label: string,
  unit: string,
  key: 'weight' | 'length' | 'head',
  draft: MeasurementDraft,
  step: number,
): m.Vnode {
  return m(
    '.measurement-field',
    m('label', {for: `new-measurement-${key}`}, `${label} (${unit})`),
    m('input', {
      id: `new-measurement-${key}`,
      type: 'number',
      min: 0,
      step,
      inputmode: 'decimal',
      value: draft[key],
      onchange: (event: Event) => {
        draft[key] = (event.currentTarget as HTMLInputElement).value;
        draft.error = undefined;
      },
    }),
  );
}

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
              const needConfirm =
                state.head !== undefined ||
                state.length !== undefined ||
                state.weight !== undefined;
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
  onChange: (value: number | undefined) => void,
) {
  return m(
    'td',
    {'data-label': label},
    m('input', {
      type: 'number',
      name,
      value: value ?? '',
      min: 0,
      step,
      onchange: (event: Event) => {
        const rawValue = (event.currentTarget as HTMLInputElement).value;
        onChange(rawValue === '' ? undefined : Number(rawValue));
      },
    }),
  );
}

export {MeasurementRowComponent, MeasurementTableComponent};
