import {BACKUP_REMINDER_KEY} from './constants';

const DAY_MS = 24 * 60 * 60 * 1000;
const INITIAL_GRACE_MS = 7 * DAY_MS;
const TWO_WEEKS_MS = 14 * DAY_MS;

type BackupStorage = Pick<Storage, 'getItem' | 'setItem'>;

export type BackupReminderState = {
  firstUsedAt: string;
  lastExportedAt: string | null;
};

export type BackupReminderStatus = 'never' | 'overdue' | 'current';

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

export function createBackupReminderState(
  firstUsedAt = new Date().toISOString(),
): BackupReminderState {
  return {firstUsedAt, lastExportedAt: null};
}

export function saveBackupReminderState(
  state: BackupReminderState,
  storage: BackupStorage = localStorage,
): void {
  storage.setItem(BACKUP_REMINDER_KEY, JSON.stringify(state));
}

export function loadBackupReminderState(
  storage: BackupStorage = localStorage,
  now = new Date(),
): BackupReminderState {
  const stored = storage.getItem(BACKUP_REMINDER_KEY);
  if (stored === null) {
    const initial = createBackupReminderState(now.toISOString());
    saveBackupReminderState(initial, storage);
    return initial;
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Estado del recordatorio no válido.');
    }

    const value = parsed as {
      firstUsedAt?: unknown;
      lastExportedAt?: unknown;
    };
    if (!isTimestamp(value.firstUsedAt)) {
      throw new Error('Fecha de primer uso no válida.');
    }
    if (value.lastExportedAt !== null && !isTimestamp(value.lastExportedAt)) {
      throw new Error('Fecha de exportación no válida.');
    }

    return {
      firstUsedAt: value.firstUsedAt,
      lastExportedAt: value.lastExportedAt ?? null,
    };
  } catch {
    const initial = createBackupReminderState(now.toISOString());
    saveBackupReminderState(initial, storage);
    return initial;
  }
}

export function recordBackupExport(
  state: BackupReminderState,
  timestamp = new Date().toISOString(),
  storage: BackupStorage = localStorage,
): BackupReminderState {
  if (!isTimestamp(timestamp)) {
    throw new Error('Fecha de exportación no válida.');
  }

  const next = {...state, lastExportedAt: timestamp};
  saveBackupReminderState(next, storage);
  return next;
}

export function getBackupReminderStatus(
  lastExportedAt: string | null,
  firstUsedAt: string | null,
  now = new Date(),
): BackupReminderStatus {
  if (lastExportedAt) {
    const exportedAt = Date.parse(lastExportedAt);
    if (
      !Number.isFinite(exportedAt) ||
      now.getTime() - exportedAt <= TWO_WEEKS_MS
    ) {
      return 'current';
    }
    return 'overdue';
  }

  if (!firstUsedAt) return 'never';
  const startedAt = Date.parse(firstUsedAt);
  if (
    !Number.isFinite(startedAt) ||
    now.getTime() - startedAt <= INITIAL_GRACE_MS
  ) {
    return 'current';
  }
  return 'never';
}

export function getDaysSinceBackup(
  lastExportedAt: string | null,
  now = new Date(),
): number | null {
  if (!lastExportedAt) return null;
  const exportedAt = Date.parse(lastExportedAt);
  if (!Number.isFinite(exportedAt)) return null;
  return Math.max(0, Math.floor((now.getTime() - exportedAt) / DAY_MS));
}
