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
import ModalComponent from './modal';

const deletingMeasurements = new WeakSet<Measurement>();
const editingMeasurements = new WeakSet<Measurement>();

type MeasurementDraft = {
  date: string;
  weight: string;
  length: string;
  head: string;
  error?: string;
};

type MeasurementKey = 'weight' | 'length' | 'head';

const measurementRules: Record<
  MeasurementKey,
  {label: string; max: number; decimals: number}
> = {
  weight: {label: 'El peso', max: 40, decimals: 3},
  length: {label: 'La longitud', max: 150, decimals: 1},
  head: {label: 'El perímetro craneal', max: 70, decimals: 1},
};

const measurementDrafts = new WeakMap<Child, MeasurementDraft>();
type MeasurementSortOrder = 'desc' | 'asc';
const measurementSortOrders = new WeakMap<Child, MeasurementSortOrder>();

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
    const sortOrder = getMeasurementSortOrder(state);
    const rows = state.measurements
      .map((measurement, idx) => ({measurement, idx}))
      .sort((a, b) => {
        const comparison = a.measurement.date.compareTo(b.measurement.date);
        return sortOrder === 'desc' ? -comparison : comparison;
      })
      .map(({measurement, idx}) => {
        // Keep the original index so edit/delete actions target the right item
        // even though the history is displayed in a different order.
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
                weight: parseDraftValue(draft.weight, 'weight'),
                length: parseDraftValue(draft.length, 'length'),
                head: parseDraftValue(draft.head, 'head'),
                dateOfBirth: state.dateOfBirth,
              });
              measurementDrafts.set(state, createMeasurementDraft(state));
            } catch (error) {
              draft.error = measurementError(error);
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
          ? measurementSortControl(state, sortOrder)
          : null,
        state.measurements.length
          ? m('ul.measurement-history-list', rows)
          : m(
              'p.measurement-empty',
              'Todavía no hay mediciones. Añade la primera arriba para empezar a ver su evolución.',
            ),
      ),
    );
  },
};

function getMeasurementSortOrder(child: Child): MeasurementSortOrder {
  return measurementSortOrders.get(child) ?? 'desc';
}

function measurementSortControl(
  child: Child,
  sortOrder: MeasurementSortOrder,
): m.Vnode {
  const id = `measurement-sort-${child.idx}`;
  return m(
    '.measurement-history-toolbar',
    m('label', {for: id}, 'Ordenar por fecha'),
    m(
      'select',
      {
        id,
        value: sortOrder,
        onchange: (event: Event) => {
          measurementSortOrders.set(
            child,
            (event.currentTarget as HTMLSelectElement)
              .value as MeasurementSortOrder,
          );
        },
      },
      m('option', {value: 'desc'}, 'Más recientes primero'),
      m('option', {value: 'asc'}, 'Más antiguas primero'),
    ),
  );
}

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

function parseDraftValue(
  value: string,
  key: MeasurementKey,
): number | undefined {
  if (!hasValue(value)) {
    return undefined;
  }

  const rule = measurementRules[key];
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    throw new Error(
      `${rule.label} debe ser un número positivo, por ejemplo 3,250.`,
    );
  }

  const decimalPlaces = normalized.split('.')[1]?.length ?? 0;
  if (decimalPlaces > rule.decimals) {
    throw new Error(
      `${rule.label} admite como máximo ${rule.decimals} decimales.`,
    );
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${rule.label} debe ser mayor que cero.`);
  }
  if (parsed > rule.max) {
    throw new Error(`${rule.label} no puede superar ${rule.max}.`);
  }
  return parsed;
}

function measurementError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Revisa los valores e inténtalo de nuevo.';
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
  key: MeasurementKey,
  draft: MeasurementDraft,
  step: number,
): m.Vnode {
  return m(
    '.measurement-field',
    m('label', {for: `new-measurement-${key}`}, `${label} (${unit})`),
    m('input', {
      id: `new-measurement-${key}`,
      // `text` keeps the comma entered by Spanish decimal keyboards. The
      // value is normalised in parseDraftValue before it reaches the model.
      type: 'text',
      inputmode: 'decimal',
      min: 0,
      step,
      value: draft[key],
      oninput: (event: Event) => {
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
    const closeEditor = () => {
      editingMeasurements.delete(state);
      measurementEditDrafts.delete(state);
    };
    const removeMeasurement = () => {
      deletingMeasurements.delete(state);
      actions.remove();
    };
    return m(
      'li.measurement-history-item',
      m(
        'button.measurement-summary',
        {
          type: 'button',
          onclick: () => editingMeasurements.add(state),
        },
        m(
          '.measurement-summary-main',
          m('strong', dateLabel),
          m(
            'span',
            dateOfBirth
              ? formatAge(Period.between(dateOfBirth, state.date))
              : 'Edad desconocida',
          ),
        ),
        m('.measurement-summary-values', measurementValues(state)),
        m(
          'span.measurement-edit-hint',
          m('span.measurement-edit-icon', {'aria-hidden': 'true'}, '✎'),
          m('span', 'Editar'),
        ),
      ),
      m(
        '.measurement-item-actions',
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
      editingMeasurements.has(state)
        ? m(MeasurementEditModalComponent, {
            state,
            actions,
            onClose: closeEditor,
          })
        : null,
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

function measurementValues(measurement: Measurement): m.Vnode[] {
  const values: m.Vnode[] = [];
  if (measurement.weight !== undefined) {
    values.push(m('span', `Peso ${measurement.weight} kg`));
  }
  if (measurement.length !== undefined) {
    values.push(m('span', `Longitud ${measurement.length} cm`));
  }
  if (measurement.head !== undefined) {
    values.push(m('span', `Perímetro ${measurement.head} cm`));
  }
  return values.length ? values : [m('span', 'Sin valores')];
}

type MeasurementEditModalAttrs = MeasurementRowAttrs & {onClose(): void};

const MeasurementEditModalComponent: m.Component<MeasurementEditModalAttrs> = {
  view({attrs: {state, actions, onClose}}) {
    const draft = getMeasurementEditDraft(state);
    const dateLabel = convert(state.date).toDate().toLocaleDateString('es-ES');

    return m(
      ModalComponent,
      {
        className: 'modal-measurement-edit',
        title: `Editar medición del ${dateLabel}`,
        kicker: 'Historial',
        onClose,
      },
      m(
        'form.measurement-edit-form',
        {
          onsubmit: (event: SubmitEvent) => {
            event.preventDefault();
            if (![draft.weight, draft.length, draft.head].some(hasValue)) {
              draft.error =
                'Mantén al menos un valor para guardar la medición.';
              return;
            }
            try {
              actions.update(
                LocalDate.parse(draft.date),
                parseDraftValue(draft.weight, 'weight'),
                parseDraftValue(draft.length, 'length'),
                parseDraftValue(draft.head, 'head'),
              );
              onClose();
            } catch (error) {
              draft.error = measurementError(error);
            }
          },
        },
        m(
          '.measurement-form-grid measurement-edit-grid',
          editDateInput(state, draft),
          editNumericInput('Peso', 'kg', 'weight', draft, 0.001),
          editNumericInput('Longitud', 'cm', 'length', draft, 0.1),
          editNumericInput('Perímetro craneal', 'cm', 'head', draft, 0.1),
        ),
        draft.error ? m('p.measurement-error', draft.error) : null,
        m(
          '.modal-actions',
          m(
            'button.button-secondary',
            {type: 'button', onclick: onClose},
            'Cancelar',
          ),
          m('button.primary-action', {type: 'submit'}, 'Guardar cambios'),
        ),
      ),
    );
  },
};

const measurementEditDrafts = new WeakMap<Measurement, MeasurementDraft>();

function getMeasurementEditDraft(measurement: Measurement): MeasurementDraft {
  const existing = measurementEditDrafts.get(measurement);
  if (existing) {
    return existing;
  }
  const draft = {
    date: measurement.date.toString(),
    weight: measurement.weight?.toString() ?? '',
    length: measurement.length?.toString() ?? '',
    head: measurement.head?.toString() ?? '',
  };
  measurementEditDrafts.set(measurement, draft);
  return draft;
}

function editDateInput(
  measurement: Measurement,
  draft: MeasurementDraft,
): m.Vnode {
  return m(
    '.measurement-field',
    m('label', {for: `edit-measurement-date-${measurement.idx}`}, 'Fecha'),
    m('input', {
      id: `edit-measurement-date-${measurement.idx}`,
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

function editNumericInput(
  label: string,
  unit: string,
  key: MeasurementKey,
  draft: MeasurementDraft,
  step: number,
): m.Vnode {
  return m(
    '.measurement-field',
    m('label', {for: `edit-measurement-${key}`}, `${label} (${unit})`),
    m('input', {
      id: `edit-measurement-${key}`,
      // `text` keeps the comma entered by Spanish decimal keyboards. The
      // value is normalised in parseDraftValue before it reaches the model.
      type: 'text',
      inputmode: 'decimal',
      min: 0,
      step,
      value: draft[key],
      oninput: (event: Event) => {
        draft[key] = (event.currentTarget as HTMLInputElement).value;
        draft.error = undefined;
      },
    }),
  );
}

export {MeasurementRowComponent, MeasurementTableComponent};
