declare module 'mithril-query' {
  interface Assertions {
    have(expected: number | string | string[], selector?: string): boolean;
    contain(value: string): boolean;
  }

  interface QueryResult {
    rootEl: unknown;
    should: Assertions & {not: Assertions};
    click(selector: string, eventData?: object): void;
    setValue(selector: string, value: string, eventData?: object): void;
  }

  function mq(component: unknown, attrs?: unknown): QueryResult;

  export default mq;
}
