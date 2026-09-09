import mq from 'mithril-query';
import o from 'ospec';

import {
  getBackupReminderStatus,
  getDaysSinceBackup,
  loadBackupReminderState,
  saveBackupReminderState,
} from '../src/models/backup-reminder';
import {BACKUP_REMINDER_KEY} from '../src/models/constants';
import {AppActions, AppState} from '../src/models/state';
import AppComponent from '../src/views/app';
import DataManagementComponent from '../src/views/data-management';

o.spec('Backup reminder', () => {
  const now = new Date('2026-09-09T12:00:00.000Z');

  o.beforeEach(() => {
    localStorage.clear();
  });

  o('gives seven days of initial grace without an export', () => {
    o(getBackupReminderStatus(null, '2026-09-02T12:00:00.000Z', now)).equals(
      'current',
    );
    o(getBackupReminderStatus(null, '2026-09-01T11:59:59.999Z', now)).equals(
      'never',
    );
  });

  o('marks a backup as overdue after fourteen days', () => {
    o(
      getBackupReminderStatus(
        '2026-08-26T12:00:00.000Z',
        '2026-08-01T12:00:00.000Z',
        now,
      ),
    ).equals('current');
    o(
      getBackupReminderStatus(
        '2026-08-25T11:59:59.999Z',
        '2026-08-01T12:00:00.000Z',
        now,
      ),
    ).equals('overdue');
  });

  o('calculates complete days since the last export', () => {
    o(getDaysSinceBackup('2026-08-22T12:00:00.000Z', now)).equals(18);
    o(getDaysSinceBackup(null, now)).equals(null);
    o(getDaysSinceBackup('2026-09-10T12:00:00.000Z', now)).equals(0);
  });

  o('initialises and reloads reminder metadata locally', () => {
    const initial = loadBackupReminderState(localStorage, now);
    o(initial.firstUsedAt).equals(now.toISOString());
    o(initial.lastExportedAt).equals(null);
    o(localStorage.getItem(BACKUP_REMINDER_KEY)).equals(
      JSON.stringify(initial),
    );

    const reloaded = loadBackupReminderState(
      localStorage,
      new Date('2026-09-10'),
    );
    o(reloaded).deepEquals(initial);
  });

  o('renders the overdue reminder and records an export action', () => {
    const backupState = {
      firstUsedAt: '2026-08-01T12:00:00.000Z',
      lastExportedAt: '2026-08-20T12:00:00.000Z',
    };
    saveBackupReminderState(backupState);
    const state = AppState();
    const actions = AppActions(state);
    const out = mq(AppComponent, {state, actions});

    out.should.have(1, '[aria-label="Recordatorio de copia de seguridad"]');
    out.should.contain('Han pasado 20 días desde la última copia preparada.');

    actions.recordBackupExport('2026-09-09T12:00:00.000Z');
    o(state.backupReminder.lastExportedAt).equals('2026-09-09T12:00:00.000Z');
    o(
      JSON.parse(localStorage.getItem(BACKUP_REMINDER_KEY)!).lastExportedAt,
    ).equals('2026-09-09T12:00:00.000Z');
  });

  o('records the export when the data link is activated', () => {
    const state = AppState();
    const actions = AppActions(state);
    const out = mq(DataManagementComponent, {state, actions});

    out.click('#export');

    o(state.backupReminder.lastExportedAt).notEquals(null);
    o(
      JSON.parse(localStorage.getItem(BACKUP_REMINDER_KEY)!).lastExportedAt,
    ).notEquals(null);
  });
});
