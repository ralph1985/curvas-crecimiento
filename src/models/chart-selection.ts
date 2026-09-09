import type {ChartConfig} from '../data/who';
import {CHART_SELECTION_KEY} from './constants';
import type {Child} from './state';

type StoredChartSelection = {
  ids: string[];
  hasStoredSelection: boolean;
};

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.filter(id => id.length > 0))];
}

function loadChartSelection(
  storage: Pick<Storage, 'getItem'> = localStorage,
): StoredChartSelection {
  const serialised = storage.getItem(CHART_SELECTION_KEY);
  if (serialised === null) {
    return {ids: [], hasStoredSelection: false};
  }

  try {
    const parsed: unknown = JSON.parse(serialised);
    if (
      !Array.isArray(parsed) ||
      !parsed.every((id): id is string => typeof id === 'string')
    ) {
      return {ids: [], hasStoredSelection: false};
    }

    return {ids: uniqueIds(parsed), hasStoredSelection: true};
  } catch {
    return {ids: [], hasStoredSelection: false};
  }
}

function saveChartSelection(
  ids: string[],
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  storage.setItem(CHART_SELECTION_KEY, JSON.stringify(uniqueIds(ids)));
}

function compatibleChartChildren(
  children: Child[],
  config: ChartConfig | undefined,
): Child[] {
  if (!config) {
    return [];
  }

  return children.filter(
    child =>
      child.dateOfBirth !== undefined &&
      child.sex === config.sex &&
      child.measurements.some(measurement =>
        Number.isFinite(config.accessorFn(measurement)),
      ),
  );
}

function selectedChartChildren(
  children: Child[],
  config: ChartConfig | undefined,
  selectedIds: string[],
): Child[] {
  const selected = new Set(selectedIds);
  return compatibleChartChildren(children, config).filter(child =>
    selected.has(child.id),
  );
}

function hiddenSelectedChildCount(
  children: Child[],
  config: ChartConfig | undefined,
  selectedIds: string[],
): number {
  const childIds = new Set(children.map(child => child.id));
  const compatibleIds = new Set(
    compatibleChartChildren(children, config).map(child => child.id),
  );
  return selectedIds.filter(id => childIds.has(id) && !compatibleIds.has(id))
    .length;
}

export {
  compatibleChartChildren,
  hiddenSelectedChildCount,
  loadChartSelection,
  type StoredChartSelection,
  saveChartSelection,
  selectedChartChildren,
};
