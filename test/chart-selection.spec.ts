import o from 'ospec';

import {LocalDate} from '@js-joda/core';

import charts from '../src/data/who';
import {
  compatibleChartChildren,
  hiddenSelectedChildCount,
  loadChartSelection,
  saveChartSelection,
  selectedChartChildren,
} from '../src/models/chart-selection';
import type {Child} from '../src/models/state';

const child = (
  id: string,
  sex: Child['sex'],
  measurement: Pick<Child['measurements'][number], 'weight' | 'length'>,
): Child => ({
  id,
  idx: 0,
  name: id,
  dateOfBirth: LocalDate.of(2024, 1, 1),
  sex,
  open: false,
  colourHex: '#0544d3',
  measurements: [
    {
      idx: 0,
      date: LocalDate.of(2024, 1, 1),
      ...measurement,
    },
  ],
});

const femaleWeight = charts['who-wfa-girls-monthly'];
const femaleLength = charts['who-hfa-girls-monthly'];

o.spec('Chart selection', () => {
  o('filters candidates by sex, birth date and current measurement', () => {
    const children = [
      child('ava', 'female', {weight: 3.2}),
      child('leo', 'male', {weight: 3.4}),
      child('no-weight', 'female', {length: 52}),
      child('unknown-sex', null, {weight: 3.1}),
      {
        ...child('no-birth-date', 'female', {weight: 3.1}),
        dateOfBirth: undefined,
      },
    ];

    o(
      compatibleChartChildren(children, femaleWeight).map(c => c.id),
    ).deepEquals(['ava']);
    o(
      compatibleChartChildren(children, femaleLength).map(c => c.id),
    ).deepEquals(['no-weight']);
  });

  o('keeps incompatible selected children hidden and reports them', () => {
    const children = [
      child('ava', 'female', {weight: 3.2}),
      child('leo', 'male', {weight: 3.4}),
      child('no-weight', 'female', {length: 52}),
    ];

    o(
      selectedChartChildren(children, femaleWeight, [
        'ava',
        'leo',
        'no-weight',
      ]).map(c => c.id),
    ).deepEquals(['ava']);
    o(
      hiddenSelectedChildCount(children, femaleWeight, [
        'ava',
        'leo',
        'no-weight',
      ]),
    ).equals(2);
  });

  o('round-trips and validates the browser selection', () => {
    let value: string | null = null;
    const storage = {
      getItem: () => value,
      setItem: (_key: string, next: string) => {
        value = next;
      },
    };

    o(loadChartSelection(storage)).deepEquals({
      ids: [],
      hasStoredSelection: false,
    });
    saveChartSelection(['ava', 'ava', 'leo'], storage);
    o(loadChartSelection(storage)).deepEquals({
      ids: ['ava', 'leo'],
      hasStoredSelection: true,
    });

    value = '{"invalid":true}';
    o(loadChartSelection(storage)).deepEquals({
      ids: [],
      hasStoredSelection: false,
    });
  });
});
