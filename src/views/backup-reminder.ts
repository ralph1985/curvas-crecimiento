import m from 'mithril';

import {
  type BackupReminderState,
  getBackupReminderStatus,
  getDaysSinceBackup,
} from '../models/backup-reminder';

interface BackupReminderAttrs {
  state: BackupReminderState;
  onGoToBackup(): void;
}

const BackupReminderComponent: m.Component<BackupReminderAttrs> = {
  view({attrs: {state, onGoToBackup}}) {
    const status = getBackupReminderStatus(
      state.lastExportedAt,
      state.firstUsedAt,
    );
    if (status === 'current') return null;

    const days = getDaysSinceBackup(state.lastExportedAt);
    return m(
      'aside.backup-reminder',
      {
        role: 'complementary',
        'aria-label': 'Recordatorio de copia de seguridad',
      },
      m(
        '.backup-reminder-content',
        m(
          'strong',
          status === 'never'
            ? 'Aún no hay una copia de seguridad'
            : 'Copia pendiente',
        ),
        m(
          'p',
          status === 'never'
            ? 'Protege los datos de este dispositivo exportando una copia desde Mis peques.'
            : `Han pasado ${days ?? 0} días desde la última copia preparada.`,
        ),
      ),
      m(
        'button.backup-reminder-action',
        {type: 'button', onclick: onGoToBackup},
        'Hacer copia',
      ),
    );
  },
};

export default BackupReminderComponent;
