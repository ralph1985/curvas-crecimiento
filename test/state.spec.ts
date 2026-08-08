import o from 'ospec';

import {LocalDate} from '@js-joda/core';

import {type Child, mergeChildren} from '../src/models/state';

const child = (name: string, measurements: Child['measurements']): Child => ({
  idx: 0,
  name,
  dateOfBirth: LocalDate.of(2024, 1, 1),
  sex: 'female',
  open: true,
  colourHex: '#0544d3',
  measurements,
});

const measurement = (date: string, weight: number) => ({
  idx: -1,
  date: LocalDate.parse(date),
  weight,
});

o.spec('Merging imported children', () => {
  o('keeps local children and appends imported children', () => {
    const local = [child('Ava', [])];
    const imported = [child('Leo', [])];

    const merged = mergeChildren(local, imported);

    o(merged.length).equals(2);
    o(merged[0].name).equals('Ava');
    o(merged[1].name).equals('Leo');
  });

  o('combines matching children without duplicating measurements', () => {
    const local = [child('Ava', [measurement('2024-01-01', 3.2)])];
    const imported = [
      child(' ava ', [
        measurement('2024-01-01', 3.2),
        measurement('2024-01-08', 3.5),
      ]),
    ];

    const merged = mergeChildren(local, imported);

    o(merged.length).equals(1);
    o(merged[0].measurements.length).equals(2);
    o(merged[0].measurements[1].weight).equals(3.5);
  });
});
