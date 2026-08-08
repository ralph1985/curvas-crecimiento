import {LocalDate} from '@js-joda/core';
import type {SeriesObject} from 'chartist';

import charts, {type ChartConfig} from '../data/who';
import {nextColour} from './constants';

// State and actions definitions
type MitosisAttr<S, A> = {
  state: S;
  actions: A;
};

// Root
interface App {
  section: AppSection;
  children: Child[];
  chart: Chart;
}

type AppSection = 'children' | 'chart';

const AppState = (): App => ({
  section: 'children',
  children: [ChildState()],
  chart: ChartState(),
});

interface IAppActions {
  addChild(child?: Child): void;
  removeChild(idx: number): void;
  setSection(section: AppSection): void;

  import(state: Child[]): void;
}

const AppActions = (app: App): IAppActions => ({
  addChild: (child: Child = ChildState(app.children.map(c => c.colourHex))) => {
    if (child.open) {
      app.children.forEach(c => {
        c.open = false;
      });
    }
    app.children.push(child);
  },
  removeChild: (idx: number) => {
    app.children.splice(idx, 1);
  },
  setSection: section => {
    app.section = section;
  },
  import: children => {
    app.children = children;
  },
});

function childIdentity(child: Child): string | undefined {
  const name = child.name?.trim().toLocaleLowerCase();
  if (!name) {
    return undefined;
  }

  return [name, child.dateOfBirth?.toString() ?? '', child.sex ?? ''].join('|');
}

function measurementIdentity(measurement: Measurement): string {
  return [
    measurement.date.toString(),
    measurement.weight ?? '',
    measurement.length ?? '',
    measurement.head ?? '',
  ].join('|');
}

function mergeChildren(existing: Child[], imported: Child[]): Child[] {
  const merged = existing.map(child => ({
    ...child,
    measurements: [...child.measurements],
  }));

  for (const importedChild of imported) {
    const identity = childIdentity(importedChild);
    const existingChildIndex = identity
      ? merged.findIndex(child => childIdentity(child) === identity)
      : -1;

    if (existingChildIndex === -1) {
      merged.push({
        ...importedChild,
        open: false,
        measurements: [...importedChild.measurements],
      });
      continue;
    }

    const existingChild = merged[existingChildIndex];
    const knownMeasurements = new Set(
      existingChild.measurements.map(measurementIdentity),
    );
    existingChild.measurements.push(
      ...importedChild.measurements.filter(measurement => {
        const measurementId = measurementIdentity(measurement);
        if (knownMeasurements.has(measurementId)) {
          return false;
        }
        knownMeasurements.add(measurementId);
        return true;
      }),
    );
    existingChild.measurements.sort((a, b) => a.date.compareTo(b.date));
  }

  return merged;
}

type Sex = 'female' | 'male';

// Child
interface Child {
  idx: number;
  name: string | null;
  dateOfBirth?: LocalDate;
  sex: Sex | null;
  open: boolean;
  colourHex?: string;
  measurements: Measurement[];
}

interface IChildActions {
  update(
    name: string | null,
    dateOfBirth: LocalDate | undefined,
    sex: Sex | null,
  ): void;
  pickColour(hex: string): void;
  addMeasurement(measurement?: Measurement): void;
  removeMeasurement(idx: number): void;
  remove(): void;
}

const ChildState = (siblingColours: (string | undefined)[] = []): Child => ({
  idx: 0,
  open: true,
  name: null,
  dateOfBirth: undefined,
  sex: null,
  colourHex: nextColour(siblingColours),
  measurements: [],
});

const ChildActions = (app: IAppActions, child: Child): IChildActions => ({
  update: (name: string, dateOfBirth: LocalDate, sex: Sex) => {
    child.name = name;
    child.dateOfBirth = dateOfBirth;
    child.sex = sex;
    child.measurements.forEach(m => {
      m.dateOfBirth = dateOfBirth;
    });
  },
  pickColour: (hex: string) => {
    child.colourHex = hex;
  },
  addMeasurement: (measurement: Measurement = MeasurementState(child)) => {
    child.measurements.push(measurement);
    child.measurements.sort((a, b) => a.date.compareTo(b.date));
  },
  removeMeasurement: (idx: number) => {
    child.measurements.splice(idx, 1);
  },
  remove: () => {
    app.removeChild(child.idx);
  },
});

// Measurement
interface Measurement {
  idx: number;
  date: LocalDate;
  weight?: number;
  length?: number;
  head?: number;

  dateOfBirth?: LocalDate;
}

interface IMeasurementActions {
  update(
    date: LocalDate,
    weight?: number,
    length?: number,
    head?: number,
  ): void;
  remove(): void;
}

const MeasurementState = (child: Child): Measurement => ({
  idx: -1,
  date:
    child.measurements.at(-1)?.date.plusDays(1) ??
    child.dateOfBirth ??
    LocalDate.now(),
  weight: undefined,
  length: undefined,
  head: undefined,
  dateOfBirth: child.dateOfBirth,
});

const MeasurementActions = (
  childActions: IChildActions,
  measurement: Measurement,
): IMeasurementActions => ({
  update: (
    date: LocalDate,
    weight?: number,
    length?: number,
    head?: number,
  ) => {
    measurement.date = date;
    measurement.weight = weight;
    measurement.length = length;
    measurement.head = head;
  },
  remove: () => {
    childActions.removeMeasurement(measurement.idx);
  },
});

// Chart
interface Chart {
  name: string;
  config?: ChartConfig;
  data: SeriesObject[];
}

interface IChartActions {
  loadChart(name: string, maxAgeMonths?: number): void;
}

const ChartState = (): Chart => ({
  name: 'who-wfa-girls-13-weeks',
  config: undefined,
  data: [],
});

const ChartActions = (chart: Chart): IChartActions => ({
  loadChart: (name: string, maxAgeMonths?: number) => {
    const config = charts[name];
    if (config) {
      chart.name = name;
      chart.config = maxAgeMonths
        ? {
            ...config,
            data: sliceChartData(
              config.data,
              config.offset.toTotalMonths(),
              maxAgeMonths,
            ),
          }
        : config;
    }
    console.log('Gráfico cargado: ', name);
  },
});

function sliceChartData(
  data: ChartConfig['data'],
  startAgeMonths: number,
  maxAgeMonths: number,
): ChartConfig['data'] {
  const pointCount = Math.max(1, maxAgeMonths - startAgeMonths + 1);
  return {
    labels: data.labels?.slice(0, pointCount),
    series: data.series.map(series =>
      (series as unknown as Array<number | null>).slice(0, pointCount),
    ),
  };
}

export {
  type App,
  AppActions,
  type AppSection,
  AppState,
  type Chart,
  ChartActions,
  ChartState,
  type Child,
  ChildActions,
  ChildState,
  type IAppActions,
  type IChartActions,
  type IChildActions,
  type IMeasurementActions,
  type Measurement,
  MeasurementActions,
  MeasurementState,
  type MitosisAttr,
  mergeChildren,
  type Sex,
};
