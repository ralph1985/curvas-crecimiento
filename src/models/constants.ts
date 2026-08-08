export const LOCAL_STORAGE_KEY = 'growth-data';
export const PRIVACY_NOTICE_KEY = 'privacy-notice-seen';

// see chart.scss
export const COLOURS = [
  '#0544d3',
  '#d17905',
  '#59922b',
  '#d70206',
  '#6b0392',
  '#f4c63d',
  '#453d3f',
  '#e6805e',
  '#dda458',
  '#eacf7d',
  '#86797d',
  '#b2c326',
  '#6188e2',
  '#a748ca',
];

// Picks the first colour from the palette that isn't already assigned to a
// sibling, so new children get a distinct default colour. Once the palette
// is exhausted, colours are cycled based on the total count so the function
// still returns a deterministic value rather than failing.
export function nextColour(assigned: (string | undefined)[]): string {
  const used = new Set(assigned.filter((c): c is string => !!c));
  const available = COLOURS.find(c => !used.has(c));
  return available ?? COLOURS[assigned.length % COLOURS.length];
}
