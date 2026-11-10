// @vitest-environment happy-dom
import {
  CHART_DEFAULTS,
  setChartDefaults,
  type HaFormSchemaItem,
  type HassEntity,
  type HomeAssistant,
} from '@fluvy/core';
import { afterEach, describe, expect, it } from 'vitest';
import { chartHeight } from '../chart-family.js';
import { familiesDefined } from '../index.js';
import { visibleFields } from '../shared/form.js';
import { FluvyChartCard, legendColumns, type ChartCardConfig } from './chart-card.js';
import { capsIn, defaultWindows, isPrice, SERIES_LIST, seriesOf, windowAt } from './config.js';
import type { Reading } from './data/attribute.js';
import { sourceOf } from './data/sources.js';
import { evenEdges, gains, slotted, spanOf, stepOf, windowOf } from './data/span.js';

// the chart family lands with the index: the card's tag is defined before a page needs it
await familiesDefined;

/*
 * The Chart card (#68): what it reads from (history, statistics, a list, a forecast) and the window it reads (a rolling
 * span, today, today and tomorrow until tomorrow is published), how readings lie on its slots, its thresholds and its
 * marked windows, its height by variant and series alone (empty and out of reach too), its stub and its editor.
 */

const HOUR = 3_600_000;
const QUARTER = HOUR / 4;
/** The sheets' evening, in UTC (the tests' clock has no zone of its own). */
const NOW = '2026-09-17T21:47:00Z';
const MIDNIGHT = Date.parse('2026-09-17T00:00:00Z');

const state = (entity_id: string, value: string, attributes: Record<string, unknown> = {}) =>
  ({
    entity_id,
    state: value,
    attributes: { friendly_name: entity_id.split('.')[1]!.replace(/_/g, ' '), ...attributes },
    last_changed: NOW,
    last_updated: NOW,
  }) as HassEntity;

/** A day of Nordpool's quarters: a cheap afternoon, a dear evening. */
const quarters = (start: number, value: (q: number) => number) =>
  Array.from({ length: 96 }, (_unused, q) => ({
    start: new Date(start + q * QUARTER).toISOString(),
    end: new Date(start + (q + 1) * QUARTER).toISOString(),
    value: value(q),
  }));
const day = (q: number): number =>
  q >= 52 && q < 60 ? 0.02 : q >= 76 && q < 84 ? 0.34 : 0.12 + (q % 4) / 1000;

const STATES = [
  state('sensor.nordpool', '0.125', {
    unit_of_measurement: 'EUR/kWh',
    raw_today: quarters(MIDNIGHT, day),
    raw_tomorrow: quarters(MIDNIGHT + 24 * HOUR, day),
  }),
  state('sensor.nordpool_morning', '0.125', {
    unit_of_measurement: 'EUR/kWh',
    raw_today: quarters(MIDNIGHT, day),
    raw_tomorrow: [],
  }),
  state('sensor.temperature', '21.4', {
    unit_of_measurement: '°C',
    device_class: 'temperature',
    state_class: 'measurement',
  }),
  state('sensor.cellar', '14.2', { unit_of_measurement: '°C', state_class: 'measurement' }),
  state('weather.home', 'sunny', { temperature: 16.8, temperature_unit: '°C' }),
  state('sensor.gone', 'unavailable', { unit_of_measurement: 'EUR/kWh' }),
];

interface Asked {
  readonly messages: Array<Record<string, unknown>>;
  readonly subscriptions: Array<Record<string, unknown>>;
}

/** A house whose recorder spreads its readings across the window asked, and whose weather forecasts its next hours. */
function house(asked: Asked = { messages: [], subscriptions: [] }): HomeAssistant {
  const history: Record<string, readonly number[]> = {
    // yesterday a degree cooler: today's change on it is up
    'sensor.temperature': [
      ...Array.from({ length: 48 }, () => 20),
      ...Array.from({ length: 48 }, () => 21),
    ],
    'sensor.cellar': [],
  };
  return {
    language: 'en',
    locale: { language: 'en', number_format: 'language', time_format: '24', time_zone: 'server' },
    config: { time_zone: 'UTC', unit_system: { temperature: '°C' } },
    states: Object.fromEntries(STATES.map((s) => [s.entity_id, s])),
    entities: {},
    devices: {},
    areas: {},
    user: { id: 'u', name: 'Marta', is_admin: true },
    localize: (key: string) => key,
    formatEntityState: (s: { state: string }) => s.state,
    callService: () => Promise.resolve(),
    callWS: (message: Record<string, unknown>) => {
      asked.messages.push(message);
      if (message['type'] !== 'history/history_during_period') return Promise.resolve({});
      const start = Date.parse(String(message['start_time']));
      const end = Date.parse(String(message['end_time']));
      const id = (message['entity_ids'] as string[])[0] as string;
      const values = history[id] ?? [];
      return Promise.resolve({
        [id]: values.map((v, i) => ({
          s: String(v),
          lu: (start + (i / Math.max(1, values.length - 1)) * (end - start)) / 1000,
        })),
      });
    },
    connection: {
      subscribeMessage: (answer: (event: unknown) => void, message: Record<string, unknown>) => {
        asked.subscriptions.push(message);
        const first = Date.parse(NOW) + 13 * 60_000;
        setTimeout(() =>
          answer({
            forecast: Array.from({ length: 24 }, (_unused, h) => ({
              datetime: new Date(first + h * HOUR).toISOString(),
              temperature: 15 + h / 4,
            })),
          }),
        );
        return Promise.resolve(() => undefined);
      },
    },
  } as unknown as HomeAssistant;
}

type Inner = HTMLElement & {
  setConfig(config: Record<string, unknown>): void;
  hass: HomeAssistant;
  width: number;
  updateComplete: Promise<boolean>;
  getCardSize(): number;
};

async function draw(
  config: Partial<ChartCardConfig> & Record<string, unknown>,
  hass: HomeAssistant = house(),
  width = 360,
): Promise<Inner> {
  const card = document.createElement('fluvy-chart-card') as Inner;
  card.setConfig({ type: 'custom:fluvy-chart-card', _now: NOW, ...config });
  card.hass = hass;
  card.width = width;
  document.body.append(card);
  for (let i = 0; i < 3; i++) {
    await card.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  await card.updateComplete;
  return card;
}

const root = (card: Inner): ShadowRoot => card.shadowRoot!;
const texts = (card: Inner, selector: string): string[] =>
  [...root(card).querySelectorAll(selector)].map((el) => el.textContent?.trim() ?? '');

afterEach(() => document.body.replaceChildren());

const NORDPOOL = {
  series: [{ entity: 'sensor.nordpool', tone: 'ok' as const }],
  span: 'today+tomorrow',
  chart: 'step' as const,
  thresholds: [
    { tone: 'warning' as const, value: 0.2 },
    { tone: 'danger' as const, value: 0.3 },
  ],
  highlight: 'both' as const,
  highlight_hours: 2,
};

describe('where a series is read from', () => {
  it('is what it names, else a weather’s forecast, a list it names or holds, else its history', () => {
    const attributes = STATES[0]!.attributes;
    expect(sourceOf({ entity: 'weather.home' })).toBe('forecast');
    expect(sourceOf({ entity: 'sensor.solcast', attribute: 'detailedForecast' })).toBe('attribute');
    expect(sourceOf({ entity: 'sensor.nordpool' }, attributes)).toBe('attribute');
    expect(sourceOf({ entity: 'sensor.temperature' }, {})).toBe('history');
    expect(sourceOf({ entity: 'sensor.nordpool', source: 'statistics' }, attributes)).toBe(
      'statistics',
    );
  });

  it('reads a config’s series as items, six at most, an id alone as its entity', () => {
    const series = seriesOf({
      series: ['sensor.a', { entity: 'sensor.b', name: 'B' }, '', { name: 'no entity' }, 7],
    });
    expect(series).toEqual([{ entity: 'sensor.a' }, { entity: 'sensor.b', name: 'B' }]);
    expect(seriesOf({ series: Array.from({ length: 9 }, (_u, i) => `sensor.${i}`) })).toHaveLength(
      6,
    );
  });

  it('knows a price by its unit or its class', () => {
    expect(isPrice('EUR/kWh')).toBe(true);
    expect(isPrice('€/kWh')).toBe(true);
    expect(isPrice('c/kWh')).toBe(true);
    expect(isPrice('kWh')).toBe(false);
    expect(isPrice('°C')).toBe(false);
    expect(isPrice('', 'monetary')).toBe(true);
  });
});

describe('the window', () => {
  const now = new Date(NOW);
  const hass = house();

  it('reads a span as the card says it, else the house’s window (the last 12 hours from the factory)', () => {
    expect(spanOf('today')).toEqual({ kind: 'today', hours: 24 });
    expect(spanOf('today + tomorrow')).toEqual({ kind: 'today+tomorrow', hours: 48 });
    expect(spanOf('7d')).toEqual({ kind: 'rolling', hours: 168 });
    expect(spanOf('4h')).toEqual({ kind: 'rolling', hours: 4 });
    expect(spanOf(undefined)).toEqual({ kind: 'rolling', hours: 12 });
    expect(spanOf('nonsense')).toEqual({ kind: 'rolling', hours: 12 });
    expect(spanOf('5000d').hours).toBe(90 * 24);
    setChartDefaults({ settings: { ...CHART_DEFAULTS, window: 168 }, sets: [] });
    expect(spanOf(undefined)).toEqual({ kind: 'rolling', hours: 168 });
    setChartDefaults({ settings: CHART_DEFAULTS, sets: [] });
  });

  it('rolls up to now, or runs over the house’s day — today and tomorrow once tomorrow is published', () => {
    expect(windowOf(spanOf('24h'), now, hass)).toEqual({
      start: now.getTime() - 24 * HOUR,
      end: now.getTime(),
      now: now.getTime(),
    });
    expect(windowOf(spanOf('today'), now, hass)).toMatchObject({
      start: MIDNIGHT,
      end: MIDNIGHT + 24 * HOUR,
    });
    const both = spanOf('today+tomorrow');
    expect(windowOf(both, now, hass, MIDNIGHT + 30 * HOUR).end).toBe(MIDNIGHT + 48 * HOUR);
    expect(windowOf(both, now, hass, MIDNIGHT + 23 * HOUR).end).toBe(MIDNIGHT + 24 * HOUR);
    expect(windowOf(both, now, hass).end).toBe(MIDNIGHT + 24 * HOUR);
  });
});

describe('the slots', () => {
  const window = { start: MIDNIGHT, end: MIDNIGHT + 4 * HOUR };
  const prices: Reading[] = [0.1, 0.2, 0.3, 0.4].map((v, q) => ({
    t: MIDNIGHT + q * QUARTER,
    v,
    end: MIDNIGHT + (q + 1) * QUARTER,
  }));

  it('read what was in force across each: an hour’s quarters their mean, a gap where nothing was', () => {
    expect(slotted(prices, window, 4, { hold: QUARTER })).toEqual([0.25, null, null, null]);
    expect(slotted(prices, window, 16, { hold: QUARTER }).slice(0, 5)).toEqual([
      0.1,
      0.2,
      0.3,
      0.4,
      null,
    ]);
  });

  it('hold the recorder’s readings until the next, never past now', () => {
    const states: Reading[] = [
      { t: MIDNIGHT, v: 20 },
      { t: MIDNIGHT + 2 * HOUR, v: 22 },
    ];
    expect(slotted(states, window, 4, { hold: Infinity, until: MIDNIGHT + 3 * HOUR })).toEqual([
      20,
      20,
      22,
      null,
    ]);
  });

  it('read a meter’s gain in each, a reset as what it shows since', () => {
    const meter: Reading[] = [10, 11, 13, 1].map((v, h) => ({ t: MIDNIGHT + h * HOUR, v }));
    expect(
      gains(meter, evenEdges(window, 3), { hold: Infinity, until: window.end }, true, window.end),
    ).toEqual([1, 2, 1]);
  });

  it('know a list’s step: its entries’ own end, else the usual distance between them', () => {
    expect(stepOf(prices)).toBe(QUARTER);
    expect(stepOf([0, 1, 2, 4].map((h) => ({ t: h * HOUR, v: 1 })))).toBe(HOUR);
  });
});

describe('the marked windows', () => {
  it('find the lowest and the highest mean of a run of whole readings, from a slot on', () => {
    const values = [5, 1, 1, 4, null, 0, 9, 9];
    expect(windowAt(values, 2, 'min')).toEqual({ start: 1, mean: 1 });
    expect(windowAt(values, 2, 'max')).toEqual({ start: 6, mean: 9 });
    expect(windowAt(values, 2, 'min', 3)).toEqual({ start: 5, mean: 4.5 });
    expect(windowAt(values, 9, 'min')).toBeNull();
  });

  it('are the style’s where the card names none: step marks both, the others none', () => {
    expect(defaultWindows('step')).toBe('both');
    expect(defaultWindows('soft')).toBe('none');
    expect(defaultWindows(undefined)).toBe('none');
  });
});

describe('the Chart card’s height at a 360 column', () => {
  it('is its variant’s and its series count’s alone: 320, 364 with a legend of four or more, 240, 168', () => {
    const height = (config: Record<string, unknown>) =>
      chartHeight({ type: 'custom:fluvy-chart-card', ...config });
    const four = { series: ['a', 'b', 'c', 'd'] };
    expect(height({})).toBe(320);
    expect(height({ series: ['a', 'b', 'c'] })).toBe(320);
    expect(height(four)).toBe(364);
    expect(height({ ...four, show_legend: false })).toBe(320);
    expect(height({ ...four, variant: 'compact' })).toBe(240);
    expect(height({ ...four, variant: 'tile' })).toBe(168);
    expect(FluvyChartCard.layoutHeight({ type: 'custom:fluvy-chart-card' })).toBe(320);
  });

  it('keeps it loading, empty and out of reach, the chart’s room its 120', async () => {
    for (const series of [['sensor.cellar'], ['sensor.gone'], ['sensor.temperature']]) {
      const card = await draw({ series });
      expect(card.getCardSize()).toBe(6);
      const chart = root(card).querySelector<HTMLElement>('.ch-chart');
      expect(chart?.style.height).toBe('120px');
    }
  });
});

describe('a legend of four series or more', () => {
  it('lies in the columns under the axis that hold its items, by count and width alone, else in the value row', () => {
    // a card's content at 360, 320, 266, 211, 172 and 152; with its readings, then names alone
    const widths = [320, 280, 226, 171, 132, 112];
    expect(widths.map((w) => legendColumns(4, w, true))).toEqual([2, 2, 0, 0, 0, 0]);
    expect(widths.map((w) => legendColumns(4, w, false))).toEqual([2, 2, 2, 2, 0, 0]);
    expect([460, 320, 226].map((w) => legendColumns(6, w, true))).toEqual([3, 2, 0]);
  });

  it('keeps the card at its height: the plot gives the lines it takes past its room, and takes what it leaves', async () => {
    const series = ['sensor.temperature', 'sensor.cellar', 'sensor.nordpool', 'sensor.gone'];
    const laid = async (more: Record<string, unknown>, width: number) => {
      const card = await draw({ series, ...more }, house(), width);
      return {
        cols: root(card)
          .querySelector<HTMLElement>('.ch-legend')
          ?.style.getPropertyValue('--ch-cols'),
        lines: root(card).querySelectorAll('.ch-lines .fc-legend__item').length,
        row: root(card).querySelector<HTMLElement>('.ch-top')?.style.height,
        plot: root(card).querySelector<HTMLElement>('.ch-chart')?.style.height,
      };
    };
    // two lines under the axis at 360: the 44 the card's height counts
    expect(await laid({}, 360)).toEqual({ cols: '2', lines: 0, row: '', plot: '120px' });
    // narrower, the value row's four lines (76, 12 past its 64), the legend's 44 the plot's
    for (const width of [266, 211, 152])
      expect(await laid({}, width)).toEqual({
        cols: undefined,
        lines: 4,
        row: '76px',
        plot: '152px',
      });
    // six at 360: three lines under the axis, the third the plot's
    const six = [...series, 'sensor.nordpool_morning', 'weather.home'];
    expect(await laid({ series: six }, 360)).toMatchObject({ cols: '2', plot: '100px' });
  });
});

describe('the Chart card’s stub', () => {
  it('takes a sensor that holds a list (its day and tomorrow), else the first sensor', () => {
    const hass = house();
    expect(
      FluvyChartCard.getStubConfig(hass, ['light.a', 'sensor.temperature', 'sensor.nordpool']),
    ).toEqual({
      type: 'custom:fluvy-chart-card',
      series: ['sensor.nordpool'],
      span: 'today+tomorrow',
    });
    expect(FluvyChartCard.getStubConfig(hass, ['light.a', 'sensor.temperature']).series).toEqual([
      'sensor.temperature',
    ]);
    expect(FluvyChartCard.getStubConfig(hass, ['light.a']).series).toEqual([]);
  });
});

describe('a price list: Nordpool today and tomorrow', () => {
  it('draws its line again in each threshold’s tone where it crosses it', async () => {
    const card = await draw(NORDPOOL);
    const runs = [...root(card).querySelectorAll('.fc-run')].map(
      (run) => run.parentElement?.getAttribute('class') ?? '',
    );
    expect(new Set(runs)).toEqual(new Set(['fv-tone--warning', 'fv-tone--danger']));
    // the past solid, what is to come dashed from now
    expect(root(card).querySelector('.fc-line')).not.toBeNull();
    expect(root(card).querySelector('.fc-future')).not.toBeNull();
    expect(root(card).querySelector('.fc-now')).not.toBeNull();
  });

  it('steps never narrower than 6: a phone’s card reads the quarters by the hour, a wide one keeps them', async () => {
    const steps = async (width: number): Promise<number[]> => {
      const card = await draw(NORDPOOL, house(), width);
      const d = root(card).querySelector('.fc-line:not(.fc-run)')?.getAttribute('d') ?? '';
      expect(d.match(/M/g)).toHaveLength(1);
      const xs = (d.match(/H[\d.]+/g) ?? []).map((h) => Number(h.slice(1)));
      return xs.slice(1).map((x, i) => x - (xs[i] as number));
    };
    const phone = await steps(360);
    expect(Math.min(...phone)).toBeGreaterThanOrEqual(6);
    // two days of quarters across a wide card: 192 slots, each still 6 or more
    const wide = await steps(1400);
    expect(Math.min(...wide)).toBeGreaterThanOrEqual(6);
    expect(wide.length).toBeGreaterThan(3 * phone.length);
  });

  it('says the day of a midnight between its axis’s ends', async () => {
    // the axis's marks are the browser's clock: a house on it, not the server's
    const local = {
      ...house(),
      locale: { language: 'en', number_format: 'language', time_format: '24' },
    };
    const card = await draw(NORDPOOL, local as HomeAssistant);
    expect(texts(card, '.ch-axis .fv-axis > *')).toEqual(['Thu 00:00', 'Fri 00:00', 'Sat 00:00']);
  });

  it('raises its plot under the value row, which reads the chart with it: no bubble over the row', async () => {
    // the chart read at its start by the keys: where the plot's top is, what says the moment
    const read = async (config: Record<string, unknown>) => {
      const card = await draw(config);
      root(card)
        .querySelector('.ch-chart')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
      await card.updateComplete;
      const grid = [...root(card).querySelectorAll('.fc-grid')].map((g) =>
        Number(g.getAttribute('y1')),
      );
      return {
        top: Math.min(...grid),
        label: texts(card, '.ch-now .fv-readout__label'),
        bubble: texts(card, '.ch-chart > .fv-bubble'),
        when: texts(card, '.ch-axis.is-reading > .ch-when'),
      };
    };
    const head = await read(NORDPOOL);
    expect(head).toMatchObject({ label: ['00:00'], bubble: [], when: [] });
    expect(head.top).toBeLessThan(16);
    // the marked windows' pills alone leave the bubble its room, under them; without a row, the chart's own
    for (const bare of [{ show_head: false }, { show_head: false, highlight: 'none' }]) {
      const got = await read({ ...NORDPOOL, ...bare });
      expect(got.bubble).toHaveLength(1);
      expect(got.bubble[0]).toMatch(/00:00$/);
      expect(got.top).toBeGreaterThanOrEqual(44);
    }
    // two series' lines in the row read each: when that is goes on the axis, under the cursor
    const two = await read({ ...NORDPOOL, series: ['sensor.nordpool', 'sensor.temperature'] });
    expect(two).toMatchObject({ bubble: [], when: ['00:00'] });
  });

  it('marks the cheapest and the dearest two hours of what is to come, and names them', async () => {
    const card = await draw(NORDPOOL);
    const stretches = [...root(card).querySelectorAll('.fc-stretch')];
    expect(stretches.map((s) => s.parentElement?.getAttribute('class'))).toEqual([
      'fv-tone--ok',
      'fv-tone--danger',
    ]);
    // tomorrow's 13:00 and 19:00: past today's, which have happened
    expect(texts(card, '.ch-side .fc-pill')).toEqual([
      'Cheapest Fri 13:00–15:00 · 0.020 EUR/kWh',
      'Priciest Fri 19:00–21:00 · 0.340 EUR/kWh',
    ]);
    // the reading now (its quarter's, 21:45), big, in the list's own decimals
    expect(texts(card, '.ch-now .fv-readout__value')[0]?.replace(/\s+/g, '')).toBe('0.123EUR/kWh');
  });

  it('before tomorrow is published: today alone, marked across the whole of it', async () => {
    const card = await draw({
      ...NORDPOOL,
      series: [{ entity: 'sensor.nordpool_morning', tone: 'ok' }],
    });
    expect(texts(card, '.fv-card__sub')).toEqual(['Today']);
    expect(texts(card, '.ch-side .fc-pill')).toEqual([
      'Cheapest 13:00–15:00 · 0.020 EUR/kWh',
      'Priciest 19:00–21:00 · 0.340 EUR/kWh',
    ]);
  });

  it('marks nothing over several series, whose legend says each', async () => {
    const card = await draw({
      ...NORDPOOL,
      series: ['sensor.nordpool', 'sensor.temperature'],
    });
    expect(root(card).querySelector('.fc-stretch')).toBeNull();
    expect(texts(card, '.ch-lines .fc-legend__name')).toEqual(['nordpool', 'temperature']);
  });
});

describe('a sensor’s history', () => {
  it('is asked from as far before its window as the period it is compared with, and says its change', async () => {
    const asked: Asked = { messages: [], subscriptions: [] };
    // a moment of its own: the page's one cache has the sheets' evening already
    const at = '2026-09-18T09:00:00Z';
    const card = await draw(
      { series: ['sensor.temperature'], span: '24h', _now: at },
      house(asked),
    );
    const history = asked.messages.find((m) => m['type'] === 'history/history_during_period');
    expect(Date.parse(String(history?.['start_time']))).toBe(Date.parse(at) - 48 * HOUR);
    expect(texts(card, '.ch-delta')).toEqual(['+5 %']);
    expect(root(card).querySelector('.curve-line')).not.toBeNull();
  });

  it('is a line through time: calm on a phone, and read at the round time nearest the pointer, its reading then (1.18)', async () => {
    const card = await draw({ series: ['sensor.temperature'], span: '24h', chart: 'soft' });
    const line = root(card).querySelector('.fc-line')?.getAttribute('d') ?? '';
    // a day on a 360 card: a point every half hour at most, never closer than the soft line's 5 px
    expect(line.split(' C').length).toBeLessThanOrEqual(52);
    (card as unknown as { scrubber: { set(value: number): void } }).scrubber.set(0.5);
    await card.updateComplete;
    // 09:47 is half way through the day to 21:47: a pixel holds five minutes, so 09:45 and its reading then
    expect(texts(card, '.ch-now .fv-readout__label')).toEqual(['09:45']);
    expect(texts(card, '.ch-now .fv-readout__value')[0]?.replace(/\s+/g, '')).toBe('21.0°C');
  });

  it('with nothing in its window: the empty panel in the chart’s room', async () => {
    const card = await draw({ series: ['sensor.cellar'] });
    expect(texts(card, '.ch-empty .fv-empty')).toEqual(['Nothing to chart in this window']);
  });
});

describe('bars, a band and a step on the house’s round times (1.18)', () => {
  /** The sheets' clock: its hour's statistic is not compiled yet, its moment not on a round time. */
  const AT = '2026-09-17T14:37:00Z';
  const ROUND = Date.parse('2026-09-17T14:00:00Z');
  const scrubbed = async (card: Inner, fraction: number) => {
    (card as unknown as { scrubber: { set(value: number): void } }).scrubber.set(fraction);
    await card.updateComplete;
    return {
      time: texts(card, '.ch-now .fv-readout__label')[0],
      value: texts(card, '.ch-now .fv-readout__value')[0]?.replace(/\s+/g, ''),
    };
  };
  const ticks = (card: Inner) => texts(card, '.ch-axis .fv-axis > *');

  /** A recorder keeping `id`'s statistics by the hour (a row a whole hour, the running one none), and its raw history. */
  function recorder(
    id: string,
    row: (t: number) => Record<string, number>,
    history?: (t: number) => number,
    attributes: Record<string, unknown> = {
      unit_of_measurement: 'kWh',
      state_class: 'total_increasing',
    },
  ): HomeAssistant {
    const base = house();
    return {
      ...base,
      states: { ...base.states, [id]: state(id, '5', attributes) },
      callWS: (message: Record<string, unknown>) => {
        const start = Date.parse(String(message['start_time']));
        const end = Date.parse(String(message['end_time']));
        if (message['type'] === 'recorder/statistics_during_period') {
          const rows = [];
          for (
            let t = Math.ceil(start / HOUR) * HOUR;
            t + HOUR <= end && t + HOUR <= Date.parse(AT);
            t += HOUR
          )
            rows.push({ start: t, end: t + HOUR, ...row(t) });
          return Promise.resolve({ [id]: rows });
        }
        if (message['type'] === 'history/history_during_period' && history) {
          const rows = [];
          for (let t = start; t <= Math.min(end, Date.parse(AT)); t += 120_000)
            rows.push({ s: String(history(t)), lu: t / 1000 });
          return Promise.resolve({ [id]: rows });
        }
        return base.callWS(message as never);
      },
    } as HomeAssistant;
  }

  const hourOf = (t: number) => new Date(t).getUTCHours();

  it('a bar labelled 12:00 reads Home Assistant’s 12:00, where a slot from 11:37 blended two of its hours', async () => {
    const card = await draw(
      {
        _now: AT,
        chart: 'bars',
        span: '12h',
        series: [{ entity: 'sensor.kwh', source: 'statistics', stat: 'change', period: 'hour' }],
      },
      recorder('sensor.kwh', (t) => ({ change: hourOf(t) })),
    );
    // whole hours from 02:00 to the last compiled one, none running: twelve bars, the running hour left out
    expect(root(card).querySelectorAll('.fc-bar')).toHaveLength(12);
    expect(root(card).querySelector('.fc-bar--sofar')).toBeNull();
    expect(ticks(card)).toEqual(['02:00', '05:00', '08:00', '11:00', '14:00']);
    // the bar over 12:00 reads that hour's own figure, and the bubble says 12:00
    expect(await scrubbed(card, 10.5 / 12)).toEqual({ time: '12:00', value: '12kWh' });
    expect(await scrubbed(card, 0.5 / 12)).toEqual({ time: '02:00', value: '2kWh' });
  });

  it('a window of days adds up the hours each slot holds', async () => {
    const card = await draw(
      {
        _now: AT,
        chart: 'bars',
        span: '7d',
        series: [{ entity: 'sensor.kwh', source: 'statistics', stat: 'change', period: 'hour' }],
      },
      recorder('sensor.kwh', () => ({ change: 1 })),
    );
    // four hours a slot: the running one (12:00 to 16:00) so far, the two compiled hours of it, paler
    const bars = root(card).querySelectorAll('.fc-bar');
    expect(bars).toHaveLength(42);
    expect(root(card).querySelectorAll('.fc-bar--sofar')).toHaveLength(1);
    expect(await scrubbed(card, 41.5 / 42)).toEqual({ time: 'Now', value: '2kWh' });
    expect(await scrubbed(card, 0.5 / 42)).toMatchObject({ value: '4kWh' });
  });

  it('a sensor’s own history: the running hour is whole on the axis, reads so far and says Now', async () => {
    const card = await draw(
      {
        _now: AT,
        chart: 'bars',
        span: '12h',
        series: ['sensor.power'],
      },
      recorder(
        'sensor.power',
        () => ({}),
        (t) => (t >= ROUND ? 100 : 40),
        {
          unit_of_measurement: 'W',
          state_class: 'measurement',
        },
      ),
    );
    const bars = root(card).querySelectorAll('.fc-bar');
    expect(bars).toHaveLength(12);
    expect([...bars].map((b) => b.classList.contains('fc-bar--sofar')).at(-1)).toBe(true);
    expect(ticks(card).slice(0, 2)).toEqual(['03:00', '06:00']);
    expect(ticks(card).at(-1)).toBe('Now');
    // so far: the 40 of the reading at 13:59 for a minute, then 100 until 14:37
    expect(await scrubbed(card, 11.5 / 12)).toEqual({ time: 'Now', value: '98W' });
    expect(await scrubbed(card, 10.5 / 12)).toEqual({ time: '13:00', value: '40W' });
  });

  it('a band reads per slot: its low and its high around its mean, a whole hour each', async () => {
    const card = await draw(
      {
        _now: AT,
        chart: 'band',
        span: '12h',
        series: [
          {
            entity: 'sensor.room',
            source: 'statistics',
            stat: 'mean',
            period: 'hour',
            kind: 'band',
          },
        ],
      },
      recorder(
        'sensor.room',
        (t) => ({ mean: hourOf(t), min: hourOf(t) - 1, max: hourOf(t) + 1 }),
        undefined,
        { unit_of_measurement: '°C', state_class: 'measurement', device_class: 'temperature' },
      ),
    );
    // the band is drawn: a rolling window no longer leaves its last slot empty, which dropped the whole of it
    expect(root(card).querySelector('.fc-band')).not.toBeNull();
    expect(await scrubbed(card, 10.5 / 12)).toEqual({ time: '12:00', value: '12°C' });
    expect(ticks(card)).toEqual(['02:00', '05:00', '08:00', '11:00', '14:00']);
  });

  it('a stepped line of the history: each step a whole hour, the running one dashed', async () => {
    const card = await draw(
      { _now: AT, chart: 'step', span: '12h', series: ['sensor.room'] },
      recorder(
        'sensor.room',
        () => ({}),
        (t) => hourOf(t),
        {
          unit_of_measurement: '°C',
          state_class: 'measurement',
        },
      ),
    );
    const line = root(card).querySelector('.fc-line')?.getAttribute('d') ?? '';
    expect(line.startsWith('M')).toBe(true);
    expect(root(card).querySelector('.fc-future')).not.toBeNull();
    expect(ticks(card).at(-1)).toBe('Now');
    // a slot of a quarter of an hour (the card's width), on the house's round quarters
    for (const tick of ticks(card).slice(0, -1)) expect(tick).toMatch(/:(00|15|30|45)$/);
    // read at a slot, it says that slot's reading, on the round time
    expect((await scrubbed(card, 0.04)).time).toMatch(/:(00|15|30|45)$/);
  });

  it('a plain line card keeps its rolling window: its axis says when it is, not a round time', async () => {
    const card = await draw({ series: ['sensor.temperature'], span: '12h' });
    expect(ticks(card)[0]).toBe('09:47');
  });
});

describe('a weather’s forecast', () => {
  it('is subscribed by the hour and drawn as what is to come', async () => {
    const asked: Asked = { messages: [], subscriptions: [] };
    const card = await draw(
      { series: ['weather.home'], span: 'today+tomorrow', chart: 'soft' },
      house(asked),
    );
    expect(asked.subscriptions).toContainEqual({
      type: 'weather/subscribe_forecast',
      forecast_type: 'hourly',
      entity_id: 'weather.home',
    });
    expect(root(card).querySelector('.fc-future')).not.toBeNull();
    // the reading now is the weather's own
    expect(texts(card, '.ch-now .fv-readout__value')[0]?.replace(/\s+/g, '')).toBe('16.8°C');
  });
});

describe('out of reach', () => {
  it('keeps its anatomy in the off skin: the state under the title, the reading a dash', async () => {
    const card = await draw({ series: ['sensor.gone'], span: 'today' });
    expect(root(card).querySelector('.fv-card.is-unavailable')).not.toBeNull();
    expect(texts(card, '.fv-card__sub')).toEqual(['Unavailable']);
    expect(texts(card, '.ch-now .fv-readout__value')).toEqual(['—']);
    expect(root(card).querySelector('.ch-empty')).not.toBeNull();
    expect(root(card).querySelector('.ch-axis .fv-axis')).not.toBeNull();
  });
});

describe('the variants', () => {
  it('compact: the head, the chart and its axis; the tile: the reading over its spark', async () => {
    const compact = await draw({ ...NORDPOOL, variant: 'compact' });
    expect(root(compact).querySelector('.ch-top')).toBeNull();
    expect(root(compact).querySelector('.ch-chart')).not.toBeNull();
    const tile = await draw({ series: ['sensor.temperature'], variant: 'tile' });
    expect(root(tile).querySelector('.fv-tile .ch-spark svg')).not.toBeNull();
    expect(texts(tile, '.fv-readout__value')[0]?.replace(/\s+/g, '')).toBe('21.4°C');
  });

  it('gives the chart the value row’s room where the row has nothing to say', async () => {
    const card = await draw({ series: ['sensor.temperature'], show_head: false });
    expect(root(card).querySelector('.ch-top')).toBeNull();
    expect(root(card).querySelector<HTMLElement>('.ch-chart')?.style.height).toBe('200px');
  });
});

describe('the Chart card’s editor', () => {
  it('offers the now marker only where the window runs past now', () => {
    expect(capsIn({ series: ['sensor.temperature'] }).now).toBe(false);
    expect(capsIn({ series: ['sensor.temperature'], span: 'today' }).now).toBe(true);
    expect(capsIn({ series: ['weather.home'] }).now).toBe(true);
    expect(capsIn({ series: ['a', 'b'] }).several).toBe(true);
  });

  it('shows the windows a stepped chart marks by default, and the style’s highlight never', () => {
    const defaults = FluvyChartCard.defaults?.({ type: 'x', chart: 'step' }, undefined) ?? {};
    expect(defaults['highlight']).toBe('both');
    const names = JSON.stringify(FluvyChartCard.getConfigForm().schema);
    expect(names.match(/"name":"highlight"/g)).toHaveLength(1);
  });

  it('offers how far apart a line’s points stand only where a series reads the recorder, and no step finer than its statistics come', () => {
    // the field where the form shows it: in the chart's section, which keeps its title over what it has left
    const fields = (form: readonly HaFormSchemaItem[]): HaFormSchemaItem[] =>
      form.flatMap((item) => (item.schema ? fields(item.schema) : [item]));
    const steps = (config: Record<string, unknown>): string[] =>
      (
        fields(visibleFields(FluvyChartCard.getConfigForm().schema, config, house())).find(
          (field) => field.name === 'points',
        )?.selector as { select: { options: { value: string }[] } } | undefined
      )?.select.options.map((o) => o.value) ?? [];
    expect(steps({ series: ['sensor.temperature'] })).toEqual(['auto', '5m', '15m', '30m', '1h']);
    expect(steps({ series: [{ entity: 'sensor.temperature', source: 'statistics' }] })).toEqual([
      'auto',
      '1h',
    ]);
    // a day's statistics come by the day: automatic is all there is, and no field asks
    expect(
      steps({ series: [{ entity: 'sensor.temperature', source: 'statistics', period: 'day' }] }),
    ).toEqual([]);
    expect(steps({ series: ['sensor.nordpool'] })).toEqual([]);
    expect(steps({ series: ['sensor.temperature'], chart: 'bars' })).toEqual([]);
    // the house's window where the card names none
    expect(FluvyChartCard.defaults?.({ type: 'x' }, undefined)?.['span']).toBe('12h');
  });

  it('offers the legend only where one is drawn: several series on the full card', () => {
    const offered = (config: Record<string, unknown>) =>
      JSON.stringify(visibleFields(FluvyChartCard.getConfigForm().schema, config)).includes(
        '"name":"show_legend"',
      );
    const two = { series: ['sensor.temperature', 'sensor.cellar'] };
    expect(offered(two)).toBe(true);
    expect(offered({ ...two, variant: 'full' })).toBe(true);
    expect(offered({ series: ['sensor.temperature'] })).toBe(false);
    expect(offered({})).toBe(false);
    expect(offered({ ...two, variant: 'compact' })).toBe(false);
    expect(offered({ ...two, variant: 'tile' })).toBe(false);
  });

  it('offers a series the palette’s colours by their words, and keeps a colour typed (1.11)', () => {
    const field = JSON.stringify(SERIES_LIST.schema).match(
      /\{"name":"color".*?"helper":"[^"]+"\}/,
    )?.[0];
    const { selector, helper } = JSON.parse(field ?? '{}') as {
      selector: { select: { custom_value: boolean; options: { value: string; label: string }[] } };
      helper: string;
    };
    expect(selector.select.custom_value).toBe(true);
    expect(selector.select.options.map((o) => o.value)).toEqual([
      ...Array.from({ length: 12 }, (_u, n) => `graph-${n + 1}`),
      ...['accent', 'ok', 'warning', 'danger', 'notice', 'light'],
      ...['solar', 'grid', 'battery', 'water', 'gas', 'home'],
    ]);
    expect(selector.select.options.map((o) => o.label).slice(10, 18)).toEqual([
      'Series 11',
      'Series 12',
      'Accent',
      'Good',
      'Warning',
      'Danger',
      'Notice',
      'Light',
    ]);
    expect(selector.select.options.at(-1)?.label).toBe('House');
    expect(helper).toBe('chart-card.editor.color_helper');
  });
});

describe('a series’ own colour', () => {
  it('is one of the palette’s by its token, or a colour name as the card’s accent sheet derives it (1.11)', async () => {
    const card = await draw({
      series: [
        { entity: 'sensor.temperature', color: 'graph-9' },
        { entity: 'sensor.nordpool', color: 'solar' },
        { entity: 'sensor.nordpool_morning', color: 'teal' },
      ],
    });
    const groups = [
      ...root(card).querySelectorAll('svg.fc-chart g[style], svg.fc-chart g[data-accent]'),
    ];
    const inks = groups.map((g) => g.getAttribute('style'));
    expect(inks).toContain('--tone-ink:var(--fluvy-graph-9)');
    expect(inks).toContain('--tone-ink:var(--fluvy-state-energy-solar)');
    expect(groups.some((g) => g.hasAttribute('data-accent'))).toBe(true);
    // the legend's swatches wear the same paint
    expect(
      [...root(card).querySelectorAll('.fc-legend__item')].map((item) =>
        item.getAttribute('style'),
      ),
    ).toEqual([
      '--tone-ink:var(--fluvy-graph-9)',
      '--tone-ink:var(--fluvy-state-energy-solar)',
      null,
    ]);
  });
});
