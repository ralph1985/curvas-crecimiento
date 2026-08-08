import o from 'ospec';

import {Period} from '@js-joda/core';

import {formatAge} from '../src/models/format';

o.spec('Format age', () => {
  const testCases: [Period, string][] = [
    [Period.ofYears(-1), '🥚'],
    [Period.ofMonths(-1), '🥚'],
    [Period.ofDays(-1), '🥚'],
    [Period.ZERO, '🐣'],
    [Period.ofDays(1), '1 día'],
    [Period.ofDays(2), '2 días'],
    [Period.ofDays(31), '31 días'],
    [Period.ofWeeks(1), '7 días'],
    [Period.ofWeeks(1).plusDays(1), '8 días'],
    [Period.ofMonths(1), '1 mes'],
    [Period.ofMonths(1).plusDays(1), '1 mes y 1 día'],
    [Period.ofMonths(2), '2 meses'],
    [Period.ofMonths(2).plusDays(2), '2 meses y 2 días'],
    [Period.ofMonths(3), '3 meses'],
    // only display days up to 3 months
    [Period.ofMonths(3).plusDays(1), '3 meses'],
    [Period.ofYears(1), '1 año 🎈'],
    [Period.ofYears(1).plusMonths(1), '1 año y 1 mes'],
    [Period.ofYears(1).plusMonths(1).plusDays(1), '1 año y 1 mes'],
    [Period.ofYears(2), '2 años 🎈'],
    [Period.ofYears(19).plusMonths(11), '19 años y 11 meses'],
    // only display months up to 20 years
    [Period.ofYears(20), '20 años 🎈'],
    [Period.ofYears(20).plusMonths(1), '20 años'],
    // really old
    [Period.ofYears(66_000_000), '🦖'],
    [Period.ofYears(4_500_000_000), '🌌'],
  ];

  testCases.forEach(([age, expectedFormat]) => {
    o(age.toString(), () => {
      o(formatAge(age)).equals(expectedFormat);
    });
  });
});
