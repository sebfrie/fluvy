// @vitest-environment happy-dom
import {
  ensureLanguage,
  type HaFormSchemaItem,
  type HassEntity,
  type HomeAssistant,
  type LovelaceCardConfig,
} from '@fluvy/core';
import { OUT_OF_REACH, outOfReachStates } from '@fluvy/demo-home/out-of-reach';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applianceHeight, APPLIANCE_VARIANTS } from '../appliances-family.js';
import { visibleFields } from '../shared/form.js';
import { editorDefaults } from '../shared/rows-editor.js';
import { applianceHouseHeight, FluvyApplianceCard } from './appliance-card.js';
import { appliancesHouseHeight, FluvyAppliancesCard } from './appliances-card.js';
import {
  allFixtures,
  de1,
  houseOf,
  laterFixtures,
  minutesFrom,
  plugFridge,
  type De1Moment,
} from './fixtures/index.js';
import { confirmHelper, listConfirmHelper } from './form.js';
import { applianceDevices } from './kinds.js';
import { forgetUnloaded } from './memory.js';
import { SETTLE_MS } from './nudge.js';

if (!customElements.get('fluvy-appliance-card'))
  customElements.define('fluvy-appliance-card', FluvyApplianceCard);

const NOW = Date.parse('2026-10-17T12:00:00Z');
const AT = new Date(NOW).toISOString();
const FIXTURES = allFixtures(NOW);
const APPLIANCES = FIXTURES.filter((fixture) => fixture.expected.kind);

type Mounted = FluvyApplianceCard & { updateComplete: Promise<boolean> };

/** A house of every fixture, Home Assistant's calls recorded, its recorder answering nothing. */
function house(changes: Record<string, Partial<HassEntity>> = {}): HomeAssistant & {
  calls: Array<{ domain: string; service: string; data: Record<string, unknown> }>;
} {
  const calls: Array<{ domain: string; service: string; data: Record<string, unknown> }> = [];
  const base = houseOf(FIXTURES, NOW);
  const states = { ...base.states };
  for (const [id, change] of Object.entries(changes))
    states[id] = { ...(states[id] as HassEntity), ...change } as HassEntity;
  return {
    ...base,
    states,
    calls,
    themes: { darkMode: false },
    user: { id: 'u', name: 'U', is_admin: true },
    callService: async (domain: string, service: string, data: Record<string, unknown> = {}) => {
      calls.push({ domain, service, data });
    },
    callWS: async () => ({}),
  } as unknown as HomeAssistant & { calls: typeof calls };
}

/** Every entity of a device out of reach. */
const unavailable = (device: string): Record<string, Partial<HassEntity>> =>
  Object.fromEntries(
    FIXTURES.filter((fixture) => fixture.device.id === device).flatMap((fixture) =>
      fixture.entities.map((entry) => [entry.entity_id, { state: 'unavailable' }]),
    ),
  );

async function mount(
  config: Record<string, unknown>,
  hass: HomeAssistant = house(),
  width = 360,
): Promise<Mounted> {
  const card = document.createElement('fluvy-appliance-card') as Mounted;
  card.setConfig({
    type: 'custom:fluvy-appliance-card',
    _now: AT,
    ...config,
  } as LovelaceCardConfig);
  card.hass = hass;
  (card as unknown as { width: number }).width = width;
  document.body.append(card);
  await card.updateComplete;
  await card.updateComplete;
  return card;
}

const root = (card: Mounted): ShadowRoot => card.shadowRoot as ShadowRoot;
const text = (el: Element | null | undefined): string =>
  (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
/** The card's sections, in order: what its anatomy is, whatever it says. */
const sections = (card: Mounted): string[] =>
  [...(root(card).querySelector('article')?.children ?? [])].map(
    (el) =>
      `${el.tagName.toLowerCase()}.${[...el.classList]
        .filter((c) => !/^is-|^fv-tone--/.test(c))
        .sort()
        .join('.')}`,
  );

afterEach(() => {
  document.body.replaceChildren();
  forgetUnloaded();
  window.localStorage.clear();
});

describe('the appliance card', () => {
  it.each(
    APPLIANCES.flatMap((fixture) =>
      APPLIANCE_VARIANTS.map((variant) => [fixture.title, variant, fixture.device.id] as const),
    ),
  )('draws %s as %s', async (_, variant, device) => {
    const card = await mount({ device, variant });
    expect(root(card).querySelector('.fv-card--empty')).toBeNull();
    expect(root(card).querySelector('article')).not.toBeNull();
  });

  it('knows its height at a 360 column for every variant and kind (the family’s, which every page carries)', () => {
    for (const variant of APPLIANCE_VARIANTS)
      for (const kind of ['washer', 'oven', 'fridge', 'hob', 'coffee', 'appliance'] as const)
        expect(FluvyApplianceCard.layoutHeight({ type: 'x', variant, kind })).toBe(
          applianceHeight({ type: 'x', variant, kind }),
        );
    // the row with its picture is 88, with its circle 76
    expect(applianceHeight({ type: 'x', variant: 'row' })).toBe(88);
    expect(applianceHeight({ type: 'x', variant: 'row', picture: 'icon' })).toBe(76);
  });

  it('as a whole card, every big kind is as tall as the next, so a dashboard’s row of them ends level (#47)', () => {
    const kinds = [
      'washer',
      'washer_dryer',
      'dryer',
      'dishwasher',
      'oven',
      'hob',
      'fridge',
      'freezer',
      'wine',
      'coffee',
      'air_fryer',
    ] as const;
    for (const kind of kinds) expect(applianceHeight({ type: 'x', kind }), kind).toBe(376);
    // what lives on a plug is a row where the card names no layout
    expect(applianceHeight({ type: 'x', kind: 'toaster' })).toBe(88);
    // a part left out takes its room with it
    expect(applianceHeight({ type: 'x', kind: 'washer', show_rows: false })).toBe(376 - 20 - 132);
    // the head keeps its 64 without a picture: the name over what it does, level with its row
    expect(applianceHeight({ type: 'x', kind: 'washer', picture: 'none' })).toBe(376);
  });

  it('draws the reporter’s design: the picture, the name over what it does, the power round, the hero, three rows', async () => {
    const card = await mount({ device: 'hc-dish' });
    const head = root(card).querySelector('.fv-card__head');
    expect(head?.querySelector('.ap-pic')).not.toBeNull();
    expect(head?.querySelector('.ap-power')?.getAttribute('aria-label')).toBe('Switch off');
    expect(root(card).querySelectorAll('.ap-items .ap-item')).toHaveLength(3);
    // the pictures are their own chunk: drawn once it has landed (however long a busy run takes to bring it), the box
    // keeping its size meanwhile
    await import('./art/art.js');
    await new Promise((resolve) => setTimeout(resolve, 0));
    await card.updateComplete;
    expect(root(card).querySelector('.ap-pic svg')).not.toBeNull();
    const icon = await mount({ device: 'hc-dish', picture: 'icon' });
    expect(root(icon).querySelector('.fv-card__head .fv-ico--hero')).not.toBeNull();
    const none = await mount({ device: 'hc-dish', picture: 'none', show_power: false });
    expect(root(none).querySelector('.ap-pic, .ap-power')).toBeNull();
  });

  it('draws its image entity’s new picture: the entity is watched (#99)', async () => {
    const picture = (url: string): HassEntity =>
      ({
        entity_id: 'image.dishwasher',
        state: AT,
        attributes: { entity_picture: url },
        last_changed: AT,
        last_updated: AT,
      }) as HassEntity;
    const hass = house();
    hass.states['image.dishwasher'] = picture('https://example.com/dish.png');
    const card = await mount({ device: 'hc-dish', image: 'image.dishwasher' }, hass);
    const src = (): string | null | undefined =>
      root(card).querySelector('.fv-card__head .ap-pic img')?.getAttribute('src');
    expect(src()).toBe('https://example.com/dish.png');
    card.hass = {
      ...hass,
      states: { ...hass.states, 'image.dishwasher': picture('https://example.com/dish-2.png') },
    };
    await card.updateComplete;
    expect(src()).toBe('https://example.com/dish-2.png');
  });

  it('a new card takes the house’s first appliance', () => {
    const hass = house();
    expect(FluvyApplianceCard.getStubConfig(hass)).toEqual({
      type: 'custom:fluvy-appliance-card',
      device: applianceDevices(hass)[0],
    });
    expect(FluvyApplianceCard.getStubConfig(undefined)).toEqual({
      type: 'custom:fluvy-appliance-card',
    });
  });

  // the row is 76 whatever it says: its anatomy is held by the suites (its round disabled, never gone)
  it.each(
    [
      'hc-dish',
      'lg-fridge',
      'hc-oven',
      'miele-hob',
      'hc-coffee',
      'st-washer',
      'plug-washer',
    ].flatMap((device) =>
      APPLIANCE_VARIANTS.filter((variant) => variant !== 'row').map(
        (variant) => [device, variant] as const,
      ),
    ),
  )(
    '%s as %s keeps its anatomy out of reach: the same sections, its values a dash',
    async (device, variant) => {
      const live = await mount({ device, variant });
      const gone = await mount({ device, variant }, house(unavailable(device)));
      expect(sections(gone)).toEqual(sections(live));
      expect(root(gone).querySelector('article')?.classList.contains('is-unavailable')).toBe(true);
    },
  );

  // a layout comes from the width, the config and what the appliance can do, never from its state: a setpoint's
  // stepper keeps its room out of reach (disabled), so a narrow column stacks the row live and out of reach alike;
  // the compartments' tiles are measured by their range's ends, so they keep their columns
  it.each([
    ['miele-fridge', 'ring', 'stepper'],
    ['miele-fridge', 'full', 'stepper'],
    ['miele-fridge', 'full', undefined],
    ['lg-fridge', 'full', 'stepper'],
    ['lg-fridge', 'full', undefined],
    ['hc-oven', 'full', 'stepper'],
    ['hc-oven', 'ring', 'stepper'],
  ] as const)(
    '%s as %s (%s) keeps its anatomy out of reach in a narrow column too: the same rows, stacked alike',
    async (device, variant, setpoint_style) => {
      for (const width of [211, 232, 266]) {
        const config = { device, variant, ...(setpoint_style ? { setpoint_style } : {}) };
        const live = await mount(config, house(), width);
        const gone = await mount(config, house(unavailable(device)), width);
        expect(sections(gone), `${width}`).toEqual(sections(live));
        const rows = (card: Mounted): string[] =>
          [...root(card).querySelectorAll('.fv-value-row')].map((row) =>
            [...row.classList].sort().join('.'),
          );
        expect(rows(gone), `${width}`).toEqual(rows(live));
        // its steppers stay, disabled
        expect(root(gone).querySelectorAll('.fv-stepper').length).toBe(
          root(live).querySelectorAll('.fv-stepper').length,
        );
        for (const half of root(gone).querySelectorAll('.fv-stepper__half'))
          expect((half as HTMLButtonElement).disabled).toBe(true);
      }
    },
  );

  // the owner's rule (1.9): unavailable, unknown or gone from the house, as Home Assistant writes each, an appliance
  // draws its live card's parts at every column — the head's words under it or beside the name by the column, never
  // by what they say; its rows the registry's (LG's older integration's attributes remembered while they could be
  // read); a missing entity's capabilities as they were (`@fluvy/core`'s `resolveEntity`)
  it.each(
    (
      [
        'lg-dryer',
        'st-dish',
        'rep-oven',
        'rep-fridge',
        'matter-fridge',
        'plug-washer',
        'hc-oven',
        'miele-hob',
        'hc-coffee',
      ] as const
    ).flatMap((device) =>
      APPLIANCE_VARIANTS.flatMap((variant) =>
        OUT_OF_REACH.map((kind) => [device, variant, kind] as const),
      ),
    ),
  )(
    '%s as %s keeps its parts and its rows %s, at 211, 266 and 360 alike',
    async (device, variant, kind) => {
      const ids = FIXTURES.filter((fixture) => fixture.device.id === device).flatMap((fixture) =>
        fixture.entities.map((entry) => entry.entity_id),
      );
      const count = (card: Mounted, selector: string): number =>
        root(card).querySelectorAll(selector).length;
      // a modifier (`…--…`) is a part's colour: the row's round is quiet or the accent's by what it may do
      const parts = (card: Mounted): string[] =>
        sections(card).map((section) =>
          section
            .split('.')
            .filter((c) => !c.includes('--'))
            .join('.'),
        );
      for (const width of [211, 266, 360]) {
        const live = await mount({ device, variant }, house(), width);
        const base = house();
        const gone = await mount(
          { device, variant },
          { ...base, states: outOfReachStates(base.states, ids, kind) },
          width,
        );
        const at = `${kind} at ${width}`;
        expect(parts(gone), at).toEqual(parts(live));
        if (kind !== 'unknown')
          expect(
            root(gone).querySelector('article')?.classList.contains('is-unavailable'),
            at,
          ).toBe(true);
        for (const part of [
          '.ap-head__under',
          '.ap-figures',
          '.ap-item',
          '.ap-zone',
          '.ap-tile',
          '.ap-plate',
          '.fv-action',
          '.fv-stepper',
          '.ap-line',
          '.ap-twin-line',
        ])
          expect(count(gone, part), `${at}: ${part}`).toBe(count(live, part));
      }
    },
  );

  it('says the cycle: the time left of its whole, its progress as a bar, its steps where asked', async () => {
    const card = await mount({ device: 'lg-washer' });
    expect(text(root(card).querySelector('.ap-figures'))).toMatch(
      /^Remaining 0:42 h of \d:\d\d h$/,
    );
    const bar = root(card).querySelector('.ap-progress [role="progressbar"]');
    expect(Number(bar?.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
    expect(text(root(card).querySelector('.ap-progress__share'))).toMatch(/^\d+ %$/);
    const stepped = await mount({ device: 'lg-washer', progress_style: 'steps' });
    expect(root(stepped).querySelector('.ap-steps [aria-current="step"]')).not.toBeNull();
    // when it ends instead of the time left
    const end = await mount({ device: 'lg-washer', time: 'end' });
    expect(text(root(end).querySelector('.ap-figures__label'))).toBe('Ends');
  });

  it('says a dishwasher’s steps in its own words where the language has them, a washer’s in laundry’s', async () => {
    await ensureLanguage('de');
    const de = { ...house(), language: 'de' } as HomeAssistant;
    const said = async (device: string): Promise<string> => {
      const card = await mount({ device, progress_style: 'steps' }, de, 412);
      const words = text(root(card).querySelector('.ap-steps'));
      card.remove();
      return words;
    };
    const dishes = await said('hc-dish');
    expect(dishes).toMatch(/Vorspülen|Reinigen|Klarspülen|Trocknen/);
    expect(dishes).not.toMatch(/Vorwäsche|Waschen/);
    expect(await said('lg-washer')).toMatch(/Waschen|Spülen|Schleudern/);
  });

  it('says its rows as the kind does: a washer’s values beside their words, a dryer’s at the end, a fridge’s as phrases', async () => {
    const washer = await mount({ device: 'miele-washer' });
    expect(root(washer).querySelector('.ap-items--inline')).not.toBeNull();
    const fridge = await mount({ device: 'lg-fridge' });
    expect(root(fridge).querySelector('.ap-items--plain')).not.toBeNull();
    // a reminder due says what to do, in the warning's ink, in the last row's place
    const due = [...root(fridge).querySelectorAll('.ap-item.is-warning')].map(text);
    expect(due).toContain('Replace the water filter');
    // at the row's end, as a dryer's lint filter says "Clean" (#47): what to do, its value in the warning's ink
    const ended = await mount({ device: 'lg-fridge', row_values: 'end' });
    const values = [...root(ended).querySelectorAll('.ap-item.is-warning .ap-item__value')];
    expect(values.map(text)).toContain('Replace');
    const own = await mount({
      device: 'hc-dish',
      rows: [
        { key: 'water', name: 'Litres' },
        'end',
        { entity: 'switch.geschirrspuler_strom', name: '' },
      ],
      row_values: 'end',
    });
    // its name and its value, as a reader hears them; a name left empty says the value alone
    expect(
      [...root(own).querySelectorAll('.ap-item')].map((row) => row.getAttribute('aria-label')),
    ).toEqual(['Litres · —', expect.stringMatching(/^Ends · \d{1,2}:\d{2}$/), 'On']);
  });

  it('a fridge that only says its setpoints says them alone, and in the house’s unit', async () => {
    const card = await mount({ device: 'lg-fridge' });
    const labels = [...root(card).querySelectorAll('.ap-tile__label')].map(text);
    expect(labels).toEqual(['Fridge', 'Freezer']);
    const steppers = await mount({ device: 'lg-fridge', setpoint_style: 'stepper' });
    expect([...root(steppers).querySelectorAll('.ap-zone .fv-readout__label')].map(text)).toEqual([
      'Fridge',
      'Freezer',
    ]);
    const imperial = await mount({ device: 'lg-fridge' }, {
      ...house({
        'number.kuhlschrank_fridge_temperatur': {
          state: '37',
          attributes: { min: 33, max: 45, step: 1, unit_of_measurement: '°F' },
        },
      }),
      config: { unit_system: { temperature: '°F', length: 'mi' } },
    } as unknown as HomeAssistant);
    expect(text(root(imperial).querySelector('.ap-tile__value'))).toBe('37 °F');
  });

  it('ten taps on a compartment’s stepper are one call, the value the last tap left, once they settle', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const hass = house();
      const card = await mount({ device: 'lg-fridge', setpoint_style: 'stepper' }, hass);
      const plus = root(card).querySelectorAll<HTMLButtonElement>('.ap-zone .fv-stepper__half')[1];
      for (let tap = 0; tap < 10; tap++) {
        plus?.dispatchEvent(new MouseEvent('click', { detail: 0, bubbles: true, composed: true }));
        await card.updateComplete;
      }
      expect(hass.calls).toEqual([]);
      vi.advanceTimersByTime(SETTLE_MS);
      expect(hass.calls).toEqual([
        {
          domain: 'number',
          service: 'set_value',
          data: { entity_id: 'number.kuhlschrank_fridge_temperatur', value: 7 },
        },
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('“Unloaded” is remembered for that finish: the reminder goes, the round with it', async () => {
    const card = await mount({
      device: 'lg-dryer',
      _now: new Date(NOW + 10 * 60_000).toISOString(),
    });
    const round = root(card).querySelector<HTMLButtonElement>('.fv-card__head .fv-round');
    expect(round?.getAttribute('aria-label')).toBe('Unloaded');
    // the load waiting is said in the warning's ink: by its alarm row where the card has one, else by its head
    const warned = (): string =>
      text(root(card).querySelector('.ap-head__sub.is-warning, .ap-item.is-warning'));
    expect(warned()).toMatch(/unloaded/i);
    round?.click();
    await card.updateComplete;
    // the power round is back in its place, the head says what it does
    expect(
      root(card).querySelector('.fv-card__head .fv-round')?.getAttribute('aria-label'),
    ).not.toBe('Unloaded');
    expect(warned()).toBe('');
    expect(text(root(card).querySelector('.ap-head__sub'))).not.toMatch(/unloaded/i);
  });

  it('stops only after Home Assistant’s dialog has asked; the start of one whose remote is off is disabled, saying why', async () => {
    const handed: unknown[] = [];
    document.body.addEventListener('hass-action', (event) =>
      handed.push((event as CustomEvent).detail),
    );
    const hass = house();
    const card = await mount({ device: 'hc-dish', show_controls: true }, hass);
    root(card).querySelector<HTMLButtonElement>('[data-action="stop"]')?.click();
    expect(hass.calls).toEqual([]);
    expect(JSON.stringify(handed)).toContain('"perform_action":"button.press"');
    expect(JSON.stringify(handed)).toContain('Stop the programme?');
    const remote = await mount({ device: 'st-dish', show_controls: true });
    const start = root(remote).querySelector<HTMLButtonElement>('[data-action="start"]');
    expect(start?.disabled).toBe(true);
    expect(start?.title).toMatch(/Remote start is off/);
  });

  it('asks before the commands a card names (#120): the row’s round asks before a start, naming the appliance; unset or empty, a start is one tap', async () => {
    const handed: Array<{ config?: { tap_action?: Record<string, unknown> } }> = [];
    const listen = (event: Event): void => void handed.push((event as CustomEvent).detail);
    document.body.addEventListener('hass-action', listen);
    try {
      // the dishwasher at rest: the row's round is Start (its active programme, Home Connect's)
      const start = async (config: Record<string, unknown>) => {
        handed.length = 0;
        const hass = house({ 'sensor.geschirrspuler_betriebszustand': { state: 'ready' } });
        const card = await mount({ device: 'hc-dish', variant: 'row', ...config }, hass);
        const round = root(card).querySelector<HTMLButtonElement>('.fv-round[aria-label="Start"]');
        expect(round, JSON.stringify(config)).not.toBeNull();
        round?.click();
        card.remove();
        return { calls: hass.calls, asked: handed.at(-1)?.config?.tap_action };
      };
      const started = [
        {
          domain: 'select',
          service: 'select_option',
          data: {
            entity_id: 'select.geschirrspuler_aktives_programm',
            option: 'dishcare_dishwasher_program_eco_50',
          },
        },
      ];
      // by default, and where the card names nothing to ask before, as before
      expect(await start({})).toEqual({ calls: started, asked: undefined });
      expect(await start({ confirm: [] })).toEqual({ calls: started, asked: undefined });
      expect(await start({ confirm: ['stop'] })).toEqual({ calls: started, asked: undefined });
      // asked before, Home Assistant's dialog asks first, in words that name the appliance as its head does
      expect(await start({ confirm: ['start', 'stop'] })).toEqual({
        calls: [],
        asked: {
          action: 'perform-action',
          perform_action: 'select.select_option',
          target: { entity_id: 'select.geschirrspuler_aktives_programm' },
          data: { option: 'dishcare_dishwasher_program_eco_50' },
          confirmation: { text: 'Start Geschirrspüler?' },
        },
      });
      expect((await start({ confirm: 'start', name: 'Dishwasher' })).asked).toMatchObject({
        confirmation: { text: 'Start Dishwasher?' },
      });
      // a pause names it too; a stop the card does not name is one tap
      const hass = house();
      const running = await mount(
        { device: 'hc-dish', show_controls: true, confirm: ['pause'] },
        hass,
      );
      root(running).querySelector<HTMLButtonElement>('[data-action="pause"]')?.click();
      expect(hass.calls).toEqual([]);
      expect(handed.at(-1)?.config?.tap_action).toMatchObject({
        confirmation: { text: 'Pause Geschirrspüler?' },
      });
      root(running).querySelector<HTMLButtonElement>('[data-action="stop"]')?.click();
      expect(hass.calls).toEqual([
        {
          domain: 'button',
          service: 'press',
          data: { entity_id: 'button.geschirrspuler_programm_stoppen' },
        },
      ]);
    } finally {
      document.body.removeEventListener('hass-action', listen);
    }
  });

  it('draws an oven’s Start where its integration can start it, asked about first (#128); one that cannot, as before', async () => {
    const handed: Array<{ config?: { tap_action?: Record<string, unknown> } }> = [];
    const listen = (event: Event): void => void handed.push((event as CustomEvent).detail);
    document.body.addEventListener('hass-action', listen);
    try {
      // LocalThings' oven at rest: Start, Stop, the light, its power; a tap on Start asks first
      const hass = house({
        'sensor.backofen_kuche_maschinenzustand': { state: 'idle' },
        'sensor.backofen_kuche_garraumstatus': { state: 'ready' },
      });
      const actions = (card: Mounted): Array<string | null> =>
        [...root(card).querySelectorAll('[data-action]')].map((el) =>
          el.getAttribute('data-action'),
        );
      const oven = await mount({ device: 'lt-oven', show_controls: true }, hass);
      expect(actions(oven)).toEqual(['start', 'stop', 'light', 'power']);
      root(oven).querySelector<HTMLButtonElement>('[data-action="start"]')?.click();
      expect(hass.calls).toEqual([]);
      expect(handed.at(-1)?.config?.tap_action).toMatchObject({
        perform_action: 'button.press',
        target: { entity_id: 'button.backofen_kuche_garen_starten' },
        confirmation: { text: 'Start Backofen Küche?' },
      });
      // the home's own list over the kind's: a start at one tap
      const quick = await mount(
        { device: 'lt-oven', show_controls: true, confirm: ['stop'] },
        hass,
      );
      root(quick).querySelector<HTMLButtonElement>('[data-action="start"]')?.click();
      expect(hass.calls).toEqual([
        {
          domain: 'button',
          service: 'press',
          data: { entity_id: 'button.backofen_kuche_garen_starten' },
        },
      ]);
      // Whirlpool's oven has no start from Home Assistant: the cells it drew before
      expect(actions(await mount({ device: 'wp-oven', show_controls: true }))).toEqual([
        'stop',
        'light',
      ]);
      // its height is its config's, whatever it can do: the one row of buttons it declared before
      for (const variant of ['full', 'compact', 'ring'])
        for (const device of ['lt-oven', 'wp-oven']) {
          const config = { type: 'x', device, kind: 'oven', variant, show_controls: true };
          expect(applianceHouseHeight(config as never, hass), `${device} ${variant}`).toBe(
            applianceHouseHeight(
              { ...config, controls: ['stop', 'light', 'power'] } as never,
              hass,
            ),
          );
        }
    } finally {
      document.body.removeEventListener('hass-action', listen);
    }
  });

  it('gives a row the round that can act now: an oven at rest its Start, cooking its power round, never a dead Start', async () => {
    const roundOf = async (states: Record<string, { state: string }>): Promise<string | null> => {
      const card = await mount({ device: 'lt-oven', variant: 'row' }, house(states));
      const round = root(card).querySelector('.fv-round');
      const said = round?.closest('.ap-power--row') ? 'power' : round?.getAttribute('aria-label');
      card.remove();
      return said ?? null;
    };
    // at rest, the cook set at the oven is one tap away (asked first)
    expect(
      await roundOf({
        'sensor.backofen_kuche_maschinenzustand': { state: 'idle' },
        'sensor.backofen_kuche_garraumstatus': { state: 'ready' },
      }),
    ).toBe('Start');
    // preheating, its Start cannot act: the round switches it off (asked first), where it was a greyed Start
    expect(await roundOf({})).toBe('power');
  });

  it('offers in its editor what an appliance can be asked before, those it can send; every one where it names none (#120)', () => {
    const form = FluvyApplianceCard.getConfigForm();
    const field = form.schema
      .flatMap((item) => item.schema ?? [item])
      .flatMap((item) => item.schema ?? [item])
      .find((item) => item.name === 'confirm');
    const offered = (config: Record<string, unknown>, hass?: HomeAssistant) =>
      (FluvyApplianceCard.choices?.({ type: 'x', ...config }, hass)['confirm'] ?? []).map(
        (option) => option.value,
      );
    const hass = house();
    // Home Connect's dishwasher: its programme starts, pauses, resumes and stops, its power switches off
    expect(offered({ device: 'hc-dish' }, hass)).toEqual([
      'start',
      'resume',
      'pause',
      'stop',
      'off',
    ]);
    // LG cannot pause from Home Assistant; a washer on a plug only switches off
    expect(offered({ device: 'lg-washer' }, hass)).toEqual(['start', 'stop', 'off']);
    expect(offered({ device: 'plug-washer' }, hass)).toEqual(['off']);
    // what it can send at all, by the entities it found: LG's operation lists nothing while the washer sleeps, nor out
    // of reach, and still starts and stops it
    const asleep = house({ 'select.waschmaschine_betrieb': { attributes: { options: [] } } });
    expect(offered({ device: 'lg-washer' }, asleep)).toEqual(['start', 'stop', 'off']);
    expect(offered({ device: 'lg-washer' }, house(unavailable('lg-washer')))).toEqual([
      'start',
      'stop',
      'off',
    ]);
    // its words are its buttons'
    expect(
      FluvyApplianceCard.choices?.({ type: 'x', device: 'lg-washer' }, hass)['confirm'],
    ).toEqual([
      { value: 'start', label: 'Start' },
      { value: 'stop', label: 'Stop' },
      { value: 'off', label: 'Switch off' },
    ]);
    // nothing to send, nothing to ask: the field steps out; no appliance yet, every one
    expect(field?.when?.({ device: 'hon-washer' }, hass)).toBe(false);
    expect(field?.when?.({ device: 'hc-dish' }, hass)).toBe(true);
    expect(field?.when?.({}, hass)).toBe(true);
    expect(offered({}, hass)).toEqual([
      'start',
      'resume',
      'pause',
      'stop',
      'off',
      'feed',
      'clean',
      'level',
    ]);
    // what the editor shows where the card names nothing: today's, of what it can send
    expect(FluvyApplianceCard.defaults?.({ type: 'x', device: 'lg-washer' }, hass)).toMatchObject({
      confirm: ['stop', 'off'],
    });
    // a command it does not know (a typo by hand) is said under the field: left out, or the default asked in its place
    const helper = (confirm: unknown) =>
      confirmHelper(field ?? { name: 'confirm' }, (key) => key, { confirm });
    expect(helper(['start', 'stop'])).toBeUndefined();
    expect(helper(['Start', 'power'])).toBeUndefined();
    expect(helper(['start', 'stopp'])).toBe('Not known, left out: stopp.');
    expect(helper(['stopp', 'paus'])).toBe(
      'Not known: stopp, paus. The card asks before its default commands.',
    );
    expect(form.computeHelper).toBe(confirmHelper);
    expect(FluvyAppliancesCard.getConfigForm().computeHelper).toBe(listConfirmHelper);
  });

  it('the Appliances card’s editor shows no `confirm` of its own: its appliances ask as each kind does, which it says', () => {
    // one list cannot show an oven's start beside a washer's: a default shown and then edited would drop the oven's
    const defaults = FluvyAppliancesCard.defaults?.({ type: 'x', variant: 'cards' }, house());
    expect(defaults).not.toHaveProperty('confirm');
    const helper = (data: Record<string, unknown>) =>
      listConfirmHelper({ name: 'confirm' }, (key) => key, data);
    expect(helper({ variant: 'cards' })).toBe(
      'Left empty, each appliance asks as on its own card, an oven, a microwave or an air fryer before it starts too. What you choose here, every appliance asks.',
    );
    expect(helper({ variant: 'cards', confirm: ['stop'] })).toBeUndefined();
    expect(helper({ variant: 'cards', confirm: [] })).toBeUndefined();
    expect(helper({ variant: 'cards', confirm: ['stopp'] })).toBe(
      'Not known: stopp. The card asks before its default commands.',
    );
    expect(listConfirmHelper({ name: 'sort' }, (key) => key, { variant: 'cards' })).toBeUndefined();
  });

  it('leaves out a control it does not know, a typo by hand, and draws the others', async () => {
    const config = { device: 'hc-dish', show_controls: true, controls: ['stopp', 'stop', 'power'] };
    const card = await mount(config);
    expect(root(card).querySelector('.fv-card--empty')).toBeNull();
    expect(
      [...root(card).querySelectorAll('[data-action]')].map((el) => el.getAttribute('data-action')),
    ).toEqual(['stop', 'power']);
    expect(applianceHouseHeight({ type: 'x', ...config } as never, house())).toBe(
      applianceHouseHeight({ type: 'x', ...config, controls: ['stop', 'power'] } as never, house()),
    );
    // one written without its dash is a list of one
    const one = await mount({ device: 'hc-dish', show_controls: true, controls: 'stop' });
    expect(
      [...root(one).querySelectorAll('[data-action]')].map((el) => el.getAttribute('data-action')),
    ).toEqual(['stop']);
  });

  it('presses LocalThings’ own buttons (#97): its pause at once, its stop once the dialog has asked, its resume greyed while its Smart Control is off', async () => {
    const handed: unknown[] = [];
    const listen = (event: Event): void => void handed.push((event as CustomEvent).detail);
    document.body.addEventListener('hass-action', listen);
    try {
      const hass = house();
      const card = await mount({ device: 'lt-washer', show_controls: true }, hass);
      root(card).querySelector<HTMLButtonElement>('[data-action="pause"]')?.click();
      expect(hass.calls).toEqual([
        {
          domain: 'button',
          service: 'press',
          data: { entity_id: 'button.waschmaschine_flur_pause' },
        },
      ]);
      root(card).querySelector<HTMLButtonElement>('[data-action="stop"]')?.click();
      expect(hass.calls).toHaveLength(1);
      expect(JSON.stringify(handed)).toContain('"perform_action":"button.press"');
      expect(JSON.stringify(handed)).toContain('button.waschmaschine_flur_stopp');
      const off = await mount(
        { device: 'lt-washer', show_controls: true },
        house({
          'sensor.waschmaschine_flur_maschinenzustand': { state: 'pause' },
          'binary_sensor.waschmaschine_flur_intelligente_steuerung': { state: 'off' },
        }),
      );
      const resume = root(off).querySelector<HTMLButtonElement>('[data-action="start"]');
      expect(resume?.disabled).toBe(true);
      expect(root(off).querySelector<HTMLButtonElement>('[data-action="stop"]')?.disabled).toBe(
        false,
      );
    } finally {
      document.body.removeEventListener('hass-action', listen);
    }
  });

  it('starts a dishwasher whose remote start says off at rest once the card names that role none (#127), and leaves out a door so named', async () => {
    // the reporter's LocalThings dishwasher: switched on and waiting, its Smart Control off, which it ignores
    const hass = house({
      'switch.geschirrspuler_kuche_ein_aus': { state: 'on' },
      'binary_sensor.geschirrspuler_kuche_intelligente_steuerung': { state: 'off' },
    });
    const start = async (config: Record<string, unknown>) =>
      root(
        await mount({ device: 'lt-dish', show_controls: true, ...config }, hass),
      ).querySelector<HTMLButtonElement>('[data-action="start"]');
    expect((await start({}))?.disabled).toBe(true);
    // `none`, or the editor's cleared picker: written without an entity, or an empty one
    for (const remote of [{ entity: 'none' }, {}, { entity: '' }]) {
      const button = await start({ roles: [{ role: 'remote', ...remote }] });
      expect(button?.disabled, JSON.stringify(remote)).toBe(false);
      expect(button?.title).not.toMatch(/Remote start is off/);
    }
    (await start({ roles: [{ role: 'remote', entity: 'none' }] }))?.click();
    expect(hass.calls.at(-1)).toEqual({
      domain: 'button',
      service: 'press',
      data: { entity_id: 'button.geschirrspuler_kuche_start' },
    });
    // a fridge's door open past its minute: said in its line and its alarm row, until the card names the door none
    const said = async (config: Record<string, unknown>) =>
      text(root(await mount({ device: 'lg-fridge', ...config })).querySelector('article'));
    expect(await said({})).toMatch(/Door open/);
    expect(await said({ roles: [{ role: 'door', entity: 'none' }] })).not.toMatch(/Door/);
    // a row's reading named none: its row goes, the kind's next takes its place, never a dash for an entity "none"
    const rows = async (config: Record<string, unknown>) =>
      [...root(await mount({ device: 'hc-dish', ...config })).querySelectorAll('.ap-item')].map(
        text,
      );
    expect(await rows({})).toEqual(['Eco 50', 'Add salt', 'Add rinse aid']);
    expect(await rows({ roles: [{ role: 'program', entity: 'none' }] })).toEqual([
      'Add salt',
      'Add rinse aid',
      'Elapsed 40 min',
    ]);
  });

  it.each([
    ['LocalThings', 'lt-washer', /9,121/, /214\.7|215/],
    ['SmartThings', 'st-washer', /1,642/, /312/],
  ] as const)(
    'never says %s’ lifetime meters as its programme’s: no water, and its energy is what this cycle used',
    async (_, device, water, energy) => {
      const card = await mount({ device });
      const said = text(root(card).querySelector('article'));
      expect(said).not.toMatch(water);
      expect(said).not.toMatch(energy);
      expect(said).not.toMatch(/Water/);
      // its readouts the same
      const compact = await mount({ device, variant: 'compact', readouts: ['energy', 'water'] });
      expect(root(compact).querySelector('[data-readout="water"]')).toBeNull();
      expect(text(root(compact).querySelector('[data-readout="energy"]'))).toMatch(/^Energy/);
      expect(text(root(compact).querySelector('[data-readout="energy"]'))).not.toMatch(energy);
    },
  );

  it('asks the recorder for a meter’s history only where the card draws what this cycle used', async () => {
    const asked = async (config: Record<string, unknown>): Promise<unknown[]> => {
      const ids: unknown[] = [];
      const hass = {
        ...house(),
        callWS: async (message: { type: string; entity_ids?: unknown }) => {
          if (message.type.startsWith('history/') || message.type.startsWith('recorder/'))
            ids.push(message.entity_ids);
          return {};
        },
      } as unknown as HomeAssistant;
      await mount(config, hass);
      return ids;
    };
    // SmartThings' and LocalThings' meters count the machine's years: nothing asked where no energy is drawn
    for (const device of ['st-washer', 'lt-washer']) {
      for (const variant of ['row', 'ring'])
        expect(await asked({ device, variant }), `${device} ${variant}`).toEqual([]);
      expect(await asked({ device, variant: 'compact', readouts: ['program'] })).toEqual([]);
      expect(await asked({ device, rows: ['program', 'spin'] }), device).toEqual([]);
    }
    // where it is, its meter alone: the whole card's energy row, a readout of it
    const meter = [['sensor.samsung_waschmaschine_energie']];
    expect(await asked({ device: 'st-washer' })).toEqual(meter);
    expect(await asked({ device: 'st-washer', variant: 'compact', readouts: ['energy'] })).toEqual(
      meter,
    );
    expect(await asked({ device: 'lt-washer' })).toEqual([['sensor.waschmaschine_flur_energie']]);
    // a plug's cycle is its power's history; its meter is asked for where its hero says this cycle's energy
    const power = ['sensor.waschmaschine_keller_leistung'];
    expect(await asked({ device: 'plug-washer', variant: 'row' })).toEqual([power]);
    expect(await asked({ device: 'plug-washer' })).toEqual([
      power,
      ['sensor.waschmaschine_keller_energie'],
    ]);
  });

  it('reads no device where it names `device: none` (#98), as before 1.13: its entity’s name, or its roles alone', async () => {
    const entity = 'switch.geschirrspuler_kuche_ein_aus';
    const hass = house({ [entity]: { attributes: { friendly_name: 'Spülmaschine' } } });
    const card = await mount({ device: 'none', entity, kind: 'dishwasher' }, hass);
    expect(text(root(card).querySelector('[data-name]'))).toBe('Spülmaschine');
    const roles = [
      { role: 'state', entity: 'sensor.waschmaschine_flur_maschinenzustand' },
    ] as const;
    const alone = await mount({ device: 'none', kind: 'washer', roles }, hass);
    expect(root(alone).querySelector('.fv-card--empty')).toBeNull();
    expect(applianceHouseHeight({ type: 'x', device: 'none', kind: 'washer', roles }, hass)).toBe(
      applianceHouseHeight({ type: 'x', device: 'lt-washer', scan: false, roles }, hass),
    );
    // it has no device to search: the editor's switch for it steps out
    const scan = FluvyApplianceCard.getConfigForm()
      .schema.flatMap((item) => item.schema ?? [item])
      .find((item) => item.name === 'scan');
    expect(scan?.when?.({ device: 'none' })).toBe(false);
    expect(scan?.when?.({ device: 'lt-washer' })).toBe(true);
  });

  it('a washer on a plug says what it draws and what this cycle used, from its power’s history; its rows never again', async () => {
    const hass = {
      ...house({
        'sensor.waschmaschine_keller_leistung': {
          state: '410',
          last_changed: minutesFrom(NOW, -10),
          attributes: { unit_of_measurement: 'W', device_class: 'power' },
        },
        'sensor.waschmaschine_keller_energie': {
          state: '182.4',
          last_changed: minutesFrom(NOW, -5),
          attributes: { unit_of_measurement: 'kWh', device_class: 'energy' },
        },
      }),
      callWS: async () => ({
        'sensor.waschmaschine_keller_leistung': [
          { s: '0.4', lu: (NOW - 600 * 60_000) / 1000 },
          { s: '2050', lu: (NOW - 42 * 60_000) / 1000 },
        ],
        'sensor.waschmaschine_keller_energie': [{ s: '181.5', lu: (NOW - 600 * 60_000) / 1000 }],
      }),
    } as unknown as HomeAssistant;
    const card = await mount({ device: 'plug-washer' }, hass);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await card.updateComplete;
    expect(text(root(card).querySelector('.ap-figures'))).toBe('Power 410 W This cycle 0.90 kWh');
    expect(text(root(card).querySelector('.fv-card__head'))).toMatch(/Running/);
    const rows = [...root(card).querySelectorAll('.ap-item')].map(text);
    // what it draws and what this cycle used are the hero's (#47): the rows say when it ends, how long it has run, its
    // alarm
    expect(rows).toEqual(['Ends —', 'Elapsed 42 min', 'No alarm']);
  });

  it('draws a device of an integration it does not know as its kind (#115): the DE1’s state, profiles, last brew, tank and alarm', async () => {
    const at = (moment: De1Moment): HomeAssistant => houseOf([de1(moment)(NOW)], NOW, house());
    const said = async (moment: De1Moment): Promise<[string, string[], string[]]> => {
      const card = await mount({ device: 'de1' }, at(moment));
      const drawn: [string, string[], string[]] = [
        text(root(card).querySelector('.fv-card__head')),
        [...root(card).querySelectorAll('.ap-drink')].map(text),
        [...root(card).querySelectorAll('.ap-item')].map(text),
      ];
      card.remove();
      return drawn;
    };
    const [head, drinks, rows] = await said('idle');
    expect(head).toMatch(/^Decent Espresso DE1PRO Ready/);
    expect(drinks).toEqual(['Default', 'Blooming espresso', 'Londinium', '']);
    // its values at the rows' ends, as a coffee machine's are
    expect(rows).toEqual(['Last brew11:35', 'Water1,240 mL', 'No alarm']);
    // its own words, said apart; a failure or a call for a hand its state alone says is said in the house's words, its
    // own the alarm's detail; wanting water, its tank's row says so whatever is left in it
    expect((await said('espresso'))[0]).toMatch(/Espresso/);
    expect((await said('sleep'))[0]).toMatch(/Off/);
    const [refill, , refillRows] = await said('refill');
    expect(refill).toMatch(/Needs attention/);
    expect(refill).not.toMatch(/Refill/);
    expect(refillRows).toEqual(['Last brew11:35', 'WaterRefill', 'Needs attentionRefill']);
    const wanting = await mount({ device: 'de1' }, at('refill'));
    expect([...root(wanting).querySelectorAll('.ap-item.is-warning')].map(text)).toEqual([
      'WaterRefill',
      'Needs attentionRefill',
    ]);
    wanting.remove();
    const [fatal, , fatalRows] = await said('fatal');
    expect(fatal).toMatch(/Error/);
    expect(fatal).not.toMatch(/Fatal/);
    expect(fatalRows).toEqual([
      'Last brew11:35',
      'Water1,240 mL',
      'Something went wrongFatal error',
    ]);
    expect((await said('lost'))[2]).toEqual(['Last brew—', 'Water—', '—']);
    // its tank as a pet device's tile says it the same way
    const tile = await mount({ device: 'de1', kind: 'fountain' }, at('idle'));
    expect(text(root(tile).querySelector('.ap-tile'))).toBe('Water1,240 mL');
    tile.remove();
  });

  it('names a readout of its device’s entity without the words they all begin with: its device’s name and its integration’s (the DE1’s plugin’s "DE1+")', async () => {
    const labels = (card: Mounted): string[] =>
      [...root(card).querySelectorAll('.ap-stat .fv-readout__label')].map(text);
    const de1House = houseOf([de1('idle')(NOW)], NOW, house());
    const counted = await mount({ device: 'de1', variant: 'compact' }, de1House);
    expect(labels(counted)).toEqual(['Espresso Count', 'Steaming Count']);
    // a sensor named by hand the same, its own name where it gives one
    const named = await mount(
      {
        device: 'de1',
        variant: 'compact',
        readouts: [],
        sensors: [
          'sensor.decent_espresso_de1pro_de1_steam_temperature',
          { entity: 'sensor.decent_espresso_de1pro_de1_mix_temperature', name: 'Mix' },
        ],
      },
      de1House,
    );
    expect(labels(named)).toEqual(['Espresso Count', 'Steaming Count', 'Steam Temperature', 'Mix']);
    // a device whose entities share nothing after its name keeps the rest of each whole, and one's own words are never
    // all taken: "Zyklen" beside "Zyklen heute"
    const named2 = (zyklen: string, other: string): HomeAssistant =>
      house({
        'sensor.waschmaschine_zyklen': { attributes: { friendly_name: zyklen } },
        'sensor.waschmaschine_gesamtzeit': {
          attributes: { friendly_name: other, unit_of_measurement: 'min' },
        },
      });
    const lg = async (hass: HomeAssistant): Promise<string[]> =>
      labels(
        await mount(
          {
            device: 'lg-washer',
            variant: 'compact',
            readouts: [],
            sensors: ['sensor.waschmaschine_zyklen', 'sensor.waschmaschine_gesamtzeit'],
          },
          hass,
        ),
      );
    expect(await lg(named2('Waschmaschine Zyklen', 'Waschmaschine Gesamtzeit'))).toEqual([
      'Zyklen',
      'Gesamtzeit',
    ]);
    expect(await lg(named2('Waschmaschine Zyklen', 'Waschmaschine Zyklen heute'))).toEqual([
      'Zyklen',
      'Zyklen heute',
    ]);
    // a word they all share after the device's name goes only where it is a mark in capitals, an integration's (the
    // DE1's "DE1+", "ENERGY"), never one of their own words ("Total coffees", "Rinse aid", リンス)
    expect(
      await lg(named2('Waschmaschine ENERGY Zyklen', 'Waschmaschine ENERGY Gesamtzeit')),
    ).toEqual(['Zyklen', 'Gesamtzeit']);
    expect(
      await lg(named2('Waschmaschine Total coffees', 'Waschmaschine Total espressos')),
    ).toEqual(['Total coffees', 'Total espressos']);
    expect(await lg(named2('Waschmaschine Rinse aid', 'Waschmaschine Rinse aid level'))).toEqual([
      'Rinse aid',
      'Rinse aid level',
    ]);
    expect(await lg(named2('Waschmaschine リンス 残量', 'Waschmaschine リンス 補充'))).toEqual([
      'リンス 残量',
      'リンス 補充',
    ]);
  });

  it('draws the DE1’s drinks out of reach as it draws them live, each a dash: as many, as wide', async () => {
    // its names measured as a glyph of 7 px each: "Blooming espresso" takes a tile of its own
    const ruler = {
      width: (_cls: string, text: string) => text.length * 7,
      pill: (_cls: string, text: string, sides: number) => text.length * 7 + sides,
      clear() {},
    };
    const drinks = async (moment: De1Moment, width: number): Promise<[string, string[]]> => {
      const hass = houseOf([de1(moment)(NOW)], NOW, house());
      const card = await mount({ device: 'de1' }, hass, width);
      Object.assign((card as unknown as { head: object }).head, { ruler });
      card.requestUpdate();
      await card.updateComplete;
      const cells = root(card).querySelector<HTMLElement>('.ap-drinks__cells');
      const said: [string, string[]] = [
        cells?.style.gridTemplateColumns ?? '',
        [...root(card).querySelectorAll('.ap-drinks__cells .ap-drink')].map(text),
      ];
      card.remove();
      return said;
    };
    for (const width of [211, 266, 300, 360, 412]) {
      const [live, names] = await drinks('idle', width);
      const [lost, dashes] = await drinks('lost', width);
      expect(lost, `${width}`).toBe(live);
      expect(dashes, `${width}`).toEqual(names.map(() => '—'));
    }
    // fewer than three where its names take the room: the live card's anatomy, out of reach too
    expect((await drinks('lost', 300))[1].length).toBeLessThan(3);
  });

  it('says what asks for attention in its alarm row on one line: its shorter words where the line does not hold them', async () => {
    await ensureLanguage('de');
    // a glyph of 8 px: "Etwas ist schiefgelaufen" is 192, over a 211 card's line
    const ruler = {
      width: (_cls: string, text: string) => text.length * 8,
      pill: (_cls: string, text: string, sides: number) => text.length * 8 + sides,
      clear() {},
    };
    const alarm = async (width: number): Promise<[string, string]> => {
      const hass = {
        ...houseOf([de1('fatal')(NOW)], NOW, house()),
        language: 'de',
      } as HomeAssistant;
      const card = await mount({ device: 'de1' }, hass, width);
      Object.assign((card as unknown as { head: object }).head, { ruler });
      card.requestUpdate();
      await card.updateComplete;
      const row = [...root(card).querySelectorAll('.ap-item')].at(-1);
      const said: [string, string] = [
        text(row?.querySelector('.ap-item__text')),
        text(row?.querySelector('.ap-item__value')),
      ];
      card.remove();
      return said;
    };
    expect(await alarm(412)).toEqual(['Etwas ist schiefgelaufen', 'Fatal error']);
    expect(await alarm(211)).toEqual(['Fehler', 'Fatal error']);
  });

  it('keeps a failure’s whole words in reach where its alarm row says them shorter: its title, and its tap opens what failed', async () => {
    const ruler = {
      width: (_cls: string, text: string) => text.length * 8,
      pill: (_cls: string, text: string, sides: number) => text.length * 8 + sides,
      clear() {},
    };
    const reason = 'water_supply_error_check_the_tap';
    const handed: Array<{ entityId?: string }> = [];
    const listen = (event: Event): void => void handed.push((event as CustomEvent).detail);
    document.body.addEventListener('hass-more-info', listen);
    try {
      const alarm = async (width: number) => {
        const hass = house({
          'event.waschmaschine_fehler': {
            state: new Date(NOW - 4 * 60_000).toISOString(),
            attributes: { event_type: reason },
          },
        });
        const card = await mount({ device: 'lg-washer' }, hass, width);
        Object.assign((card as unknown as { head: object }).head, { ruler });
        card.requestUpdate();
        await card.updateComplete;
        const row = root(card).querySelector<HTMLElement & { fvTap?: () => void }>(
          '.ap-item.is-warning',
        );
        row?.fvTap?.();
        return {
          said: text(row?.querySelector('.ap-item__text')),
          title: row?.getAttribute('title'),
          label: row?.getAttribute('aria-label'),
          opens: handed.at(-1)?.entityId,
        };
      };
      // the row holds it: said whole
      expect(await alarm(412)).toEqual({
        said: reason,
        title: null,
        label: reason,
        opens: 'event.waschmaschine_fehler',
      });
      // a 211 card's line does not: "Error", the reason its title and its name, its details a tap away
      expect(await alarm(211)).toEqual({
        said: 'Error',
        title: reason,
        label: reason,
        opens: 'event.waschmaschine_fehler',
      });
    } finally {
      document.body.removeEventListener('hass-more-info', listen);
    }
  });

  it('says the DE1’s call for a hand and its failure in the house’s language, never its own English but as the alarm’s detail', async () => {
    for (const language of ['de', 'sk'] as const) {
      await ensureLanguage(language);
      for (const [moment, own] of [
        ['refill', /Refill/],
        ['fatal', /Fatal/],
      ] as const) {
        const hass = { ...houseOf([de1(moment)(NOW)], NOW, house()), language } as HomeAssistant;
        const card = await mount({ device: 'de1' }, hass);
        const compact = await mount({ device: 'de1', variant: 'compact' }, hass);
        const row = await mount({ device: 'de1', variant: 'row' }, hass);
        const said = `${language} ${moment}`;
        expect(text(root(card).querySelector('.fv-card__head')), said).not.toMatch(own);
        expect(text(root(compact).querySelector('article')), said).not.toMatch(own);
        expect(text(root(row).querySelector('.fv-row__text')), said).not.toMatch(own);
        // the alarm says it in the house's words, the device's own its value
        const alarm = [...root(card).querySelectorAll('.ap-item')].at(-1);
        expect(text(alarm?.querySelector('.ap-item__value')), said).toMatch(own);
        expect(text(alarm), said).toMatch(
          language === 'de' ? /Aktion|schiefgelaufen/ : /Vyžaduje|pokazilo/,
        );
        for (const each of [card, compact, row]) each.remove();
      }
    }
  });

  it('draws a Bosch washer on hcpy by its own keys (#115): running, its time left of its whole, its programme', async () => {
    const card = await mount({ device: 'hcpy-washer' });
    expect(text(root(card).querySelector('.fv-card__head'))).toMatch(/^washer Running/);
    expect(text(root(card).querySelector('.ap-figures'))).toMatch(/0:47 h of 1:16 h/);
    expect([...root(card).querySelectorAll('.ap-item')].map(text)[0]).toBe('Cotton');
  });

  it('a washer on a plug out of reach while its cycle ran says nothing of what the cycle used, its ring neither', async () => {
    const away = { state: 'unavailable', last_changed: minutesFrom(NOW, -2) };
    const hass = {
      ...house({
        'switch.waschmaschine_keller': away,
        'sensor.waschmaschine_keller_leistung': away,
        'sensor.waschmaschine_keller_energie': away,
      }),
      callWS: async () => ({
        'sensor.waschmaschine_keller_leistung': [
          { s: '0.4', lu: (NOW - 600 * 60_000) / 1000 },
          { s: '2050', lu: (NOW - 42 * 60_000) / 1000 },
        ],
        'sensor.waschmaschine_keller_energie': [
          { s: '181.5', lu: (NOW - 600 * 60_000) / 1000 },
          { s: '182.4', lu: (NOW - 5 * 60_000) / 1000 },
        ],
      }),
    } as unknown as HomeAssistant;
    for (const variant of ['full', 'ring', 'compact']) {
      const card = await mount({ device: 'plug-washer', variant }, hass, 412);
      await new Promise((resolve) => setTimeout(resolve, 0));
      await card.updateComplete;
      // the dial says its words in its own root
      const dial = root(card).querySelector<HTMLElement & { sub: string }>('fluvy-dial');
      expect(
        `${text(root(card).querySelector('article'))} ${dial?.sub ?? ''}`,
        variant,
      ).not.toMatch(/kWh/);
    }
  });

  it('a fridge on a plug is in operation, its compressor resting or running: never done, no bell, and switching it off asks first (#47)', async () => {
    const handed: Array<{ config?: { tap_action?: Record<string, unknown> } }> = [];
    const listen = (event: Event): void => void handed.push((event as CustomEvent).detail);
    document.body.addEventListener('hass-action', listen);
    try {
      for (const watts of ['0.9', '85']) {
        const base = house();
        const hass = houseOf([plugFridge(NOW)], NOW, base);
        hass.states['sensor.kuhlschrank_keller_leistung'] = {
          ...(hass.states['sensor.kuhlschrank_keller_leistung'] as HassEntity),
          state: watts,
        };
        Object.assign(hass, { callService: base.callService, calls: base.calls });
        for (const variant of ['full', 'row'] as const) {
          handed.length = 0;
          base.calls.length = 0;
          const card = await mount({ device: 'plug-fridge', variant }, hass);
          const head = text(root(card).querySelector('.fv-card__head, .fv-row__text'));
          expect(head, `${watts} W ${variant}`).toMatch(/In operation/);
          expect(head, `${watts} W ${variant}`).not.toMatch(/Running|Done|Ready/);
          expect(root(card).querySelector('.ap-notice'), `${watts} W ${variant}`).toBeNull();
          // no cycle to have used anything in
          expect(text(root(card).querySelector('.ap-figures'))).not.toMatch(/This cycle/);
          const power = root(card).querySelector<HTMLButtonElement>('.ap-power');
          expect(power?.className, `${watts} W ${variant}`).toMatch(/ap-power--ok/);
          power?.click();
          expect(base.calls, `${watts} W ${variant}`).toEqual([]);
          expect(handed.at(-1)?.config?.tap_action, `${watts} W ${variant}`).toMatchObject({
            perform_action: 'switch.turn_off',
            confirmation: { text: 'Switch it off? It stops cooling.' },
          });
          card.remove();
        }
      }
    } finally {
      document.body.removeEventListener('hass-action', listen);
    }
  });

  it('asks before switching off one that failed, even out of its cycle (#47)', async () => {
    const handed: Array<{ config?: { tap_action?: Record<string, unknown> } }> = [];
    const listen = (event: Event): void => void handed.push((event as CustomEvent).detail);
    document.body.addEventListener('hass-action', listen);
    try {
      const hass = house({
        'event.waschmaschine_fehler': {
          state: new Date(NOW - 4 * 60_000).toISOString(),
          attributes: { event_type: 'unbalanced_load_error' },
        },
      });
      const card = await mount({ device: 'lg-washer' }, hass);
      root(card).querySelector<HTMLButtonElement>('.fv-card__head .ap-power')?.click();
      expect(hass.calls).toEqual([]);
      expect(handed.at(-1)?.config?.tap_action).toMatchObject({
        perform_action: 'switch.turn_off',
        confirmation: { text: expect.any(String) },
      });
    } finally {
      document.body.removeEventListener('hass-action', listen);
    }
  });

  // the contract `shared/heads.test.ts` holds every card to, which its house of loose entities cannot draw this one in
  it.each(APPLIANCE_VARIANTS)(
    'as %s, its head (the row: its cover) is the card’s button: a tap and a hold reach their actions, a named one; nothing to run, no button',
    async (variant) => {
      const went: string[] = [];
      const heard = (): void => void went.push(window.location.pathname);
      window.addEventListener('location-changed', heard);
      try {
        const card = await mount({
          device: 'lg-washer',
          variant,
          tap_action: { action: 'navigate', navigation_path: '/t' },
          hold_action: { action: 'navigate', navigation_path: '/h' },
        });
        type Pressable = HTMLElement & { fvHold?: () => void };
        // the head's words are its button, the head itself holds; the row's cover does both
        const row = variant === 'row';
        const button = root(card).querySelector<Pressable>(row ? '.fv-tile__tap' : '.fv-card__tap');
        expect(button?.getAttribute('aria-label') || text(button)).not.toBe('');
        button?.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }),
        );
        window.dispatchEvent(new PointerEvent('pointerup'));
        button?.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, detail: 1 }),
        );
        root(card)
          .querySelector<Pressable>(row ? '.fv-tile__tap' : '.fv-card__head')
          ?.fvHold?.();
        expect(went).toEqual(['/t', '/h']);
        expect(
          root(card).querySelector('.fv-card__head > :is(button.fv-ico, .fv-ico--tap)'),
        ).toBeNull();
        const none = { action: 'none' };
        const still = await mount({
          device: 'lg-washer',
          variant,
          tap_action: none,
          hold_action: none,
        });
        expect(root(still).querySelector('.fv-card__tap, .fv-tile__tap')).toBeNull();
      } finally {
        window.removeEventListener('location-changed', heard);
      }
    },
  );

  it('says a second drum as a row over the others (a line under the hero, compact), alone where asked, or not', async () => {
    const both = await mount({ device: 'st-washer' });
    expect(text(root(both).querySelector('.ap-item'))).toMatch(/^Upper /);
    const compact = await mount({ device: 'st-washer', variant: 'compact' });
    expect(text(root(compact).querySelector('.ap-twin-line'))).toMatch(/^Upper · /);
    const main = await mount({ device: 'st-washer', unit: 'main' });
    expect(text(root(main).querySelector('.ap-item'))).not.toMatch(/^Upper /);
  });
});

/** The kinds the whole card draws in the standard slot (#47): 376 at a 360 column, so a row of them lines up. */
const BIG = new Set([
  'washer',
  'washer_dryer',
  'dryer',
  'dishwasher',
  'oven',
  'hob',
  'fridge',
  'freezer',
  'wine',
  'coffee',
  'air_fryer',
  'microwave',
  'kettle',
]);

describe('the whole card’s standard slot (#47)', () => {
  /** The house at the reporter's appliances' work (his four LG appliances under way). */
  const atWork = (): HomeAssistant => houseOf(laterFixtures(NOW), NOW, house());
  /** A house without one of its entities: what an appliance that lacks it has. */
  const without = (hass: HomeAssistant, id: string): HomeAssistant => {
    const states = { ...hass.states };
    const entities = { ...hass.entities };
    delete states[id];
    delete entities[id];
    return { ...hass, states, entities } as HomeAssistant;
  };
  /** The whole card's anatomy: its head, its hero's region (108 or more), its rows. */
  const anatomy = (card: Mounted): readonly [number, number, number] => [
    root(card).querySelectorAll('.ap-head').length,
    root(card).querySelectorAll('.ap-region.is-fixed').length,
    root(card).querySelectorAll('.ap-items > .ap-item').length,
  ];
  const height = (config: Record<string, unknown>, hass: HomeAssistant): number =>
    applianceHouseHeight({ type: 'x', ...config }, hass);
  /** The house as Home Assistant words it: a Miele plate's level ("Off", "Level 7"), the rest as raw. */
  const spoken = (hass: HomeAssistant): HomeAssistant =>
    ({
      ...hass,
      formatEntityState: (stateObj: HassEntity, state?: string) => {
        const raw = state ?? stateObj.state;
        const step = /^plate_step_(\d+)$/.exec(raw)?.[1];
        return step === undefined ? raw.replace(/_/g, ' ') : step === '0' ? 'Off' : `Level ${step}`;
      },
    }) as HomeAssistant;
  /** The coffee machine with its select of drinks (Home Connect's programme), in English. */
  const drinks = (): HomeAssistant => {
    const base = house();
    const id = 'select.kaffeevollautomat_ausgewahltes_programm';
    const options = ['espresso', 'coffee', 'cappuccino', 'latte_macchiato'];
    return {
      ...spoken(base),
      entities: {
        ...base.entities,
        [id]: {
          entity_id: id,
          device_id: 'hc-coffee',
          platform: 'home_connect',
          translation_key: 'selected_program',
        },
      },
      states: {
        ...base.states,
        [id]: {
          entity_id: id,
          state: 'espresso',
          attributes: { options },
          last_changed: AT,
          last_updated: AT,
        },
      },
    } as HomeAssistant;
  };

  // every big kind on a device of its own, and a few on one that stands in for it (an oven read as an air fryer)
  const cases = [
    ...APPLIANCES.filter((fixture) => BIG.has(fixture.expected.kind ?? '')).map(
      (fixture) => [fixture.title, fixture.device.id, fixture.expected.kind ?? ''] as const,
    ),
    ['an oven as an air fryer', 'hc-oven', 'air_fryer'],
    ['an oven as a microwave', 'hc-oven', 'microwave'],
    ['a fridge as a freezer', 'miele-fridge', 'freezer'],
    ['a fridge as a wine cooler', 'wp-fridge', 'wine'],
    ['a washer as a washer-dryer', 'lg-washer', 'washer_dryer'],
  ] as const;

  it.each(cases)(
    '%s (%s, %s) draws its hero and three rows and says so, live, at work, out of reach and without any one entity',
    async (_, device, kind) => {
      const config = { device, kind, variant: 'full' };
      const ids = FIXTURES.filter((fixture) => fixture.device.id === device).flatMap((fixture) =>
        fixture.entities.map((entry) => entry.entity_id),
      );
      const houses: ReadonlyArray<readonly [string, HomeAssistant]> = [
        ['live', house()] as const,
        ['at work', atWork()] as const,
        ['out of reach', house(unavailable(device))] as const,
        ...ids.map((id) => [`without ${id}`, without(house(), id)] as const),
      ].map(([said, hass]) => [said, spoken(hass)] as const);
      // the reporter's cooktop is read as its range's burners: five, three a row (it says so: 472)
      const slot = device === 'rep-oven' && kind === 'hob' ? 472 : 376;
      for (const [said, hass] of houses) {
        const card = await mount(config, hass);
        expect(anatomy(card), said).toEqual([1, 1, 3]);
        expect(height(config, hass), said).toBe(slot);
        card.remove();
      }
    },
  );

  it('fills a row the appliance lacks with its next one, else a dash in its place, the same anatomy', async () => {
    const said = (card: Mounted): Array<string | null> =>
      [...root(card).querySelectorAll('.ap-item')].map((row) => row.getAttribute('aria-label'));
    // a coffee machine that offers no drinks: their tiles, a dash each and disabled; its last brew, "Water —" in its
    // tank's place, then its alarm, its next row
    const coffee = await mount({ device: 'miele-coffee' });
    const tiles = [...root(coffee).querySelectorAll('.ap-drink')] as HTMLButtonElement[];
    expect(tiles.map(text)).toEqual(['—', '—', '—', '']);
    expect(tiles.every((tile) => tile.disabled)).toBe(true);
    expect(said(coffee)).toEqual([expect.stringMatching(/^Last brew · /), 'Water · —', 'No alarm']);
    // a fridge without a filter: its mode, "Filter —", its alarm, as the reporter's
    expect(said(await mount({ device: 'hc-fridge' }))).toEqual([
      'Super cool',
      'Filter · —',
      expect.stringMatching(/^Door open/),
    ]);
    // a hob without a meter: "Power —", how long it has been on, its alarm — its plates on are its panel's and its
    // head's; a washer on a plug: when it ends, how long, its alarm — what it draws and uses are its hero's (#47)
    expect(said(await mount({ device: 'miele-hob' }))).toEqual([
      'Power · —',
      expect.stringMatching(/^Elapsed · /),
      'No alarm',
    ]);
    expect(said(await mount({ device: 'plug-washer' }))).toEqual([
      'Ends · —',
      expect.stringMatching(/^Elapsed · /),
      'No alarm',
    ]);
  });

  it('holds a second drum or cavity in the slot: its row over two of the kind’s', async () => {
    for (const device of ['st-oven', 'st-washer', 'wp-oven', 'rep-oven']) {
      const card = await mount({ device });
      const rows = [...root(card).querySelectorAll('.ap-item')];
      expect(rows, device).toHaveLength(3);
      expect(text(rows[0]), device).toMatch(/^(Upper|Lower|Second cavity)/);
      expect(height({ device }, house()), device).toBe(376);
    }
    // beside the card's own rows it is one more, and says so
    expect(height({ device: 'st-oven', rows: ['program'] }, house())).toBe(376 - 44);
    expect(height({ device: 'st-oven', rows: ['program'], unit: 'main' }, house())).toBe(376 - 88);
  });

  it('declares what it draws beyond the slot, from the house: steppers, quick modes, buttons, programmes, plates', () => {
    const hass = house();
    // two compartments' steppers (64 each, 12 apart) and one row of quick modes; four quick modes two a row
    expect(height({ device: 'lg-fridge', setpoint_style: 'stepper', show_modes: true }, hass)).toBe(
      376 + 32 + 60,
    );
    expect(height({ device: 'hc-fridge', show_modes: true }, hass)).toBe(376 + 16 + 88);
    // the buttons where it can be pressed, none where it cannot
    expect(height({ device: 'hc-dish', show_controls: true }, hass)).toBe(376 + 60);
    expect(height({ device: 'miele-fridge', show_controls: true }, hass)).toBe(376);
    // the programmes where a card can choose one (a select of drinks: "Latte macchiato" holds one a row), none where
    // it cannot
    expect(height({ device: 'hc-coffee', show_programs: true }, hass)).toBe(376);
    expect(height({ device: 'hc-coffee', show_programs: true }, drinks())).toBe(376 + 16 + 4 * 44);
    expect(height({ device: 'miele-coffee', show_programs: true }, hass)).toBe(376);
    // a range's five burners as a hob, three a row: two rows of plates; compact, two rows of cells and its oven's line
    expect(height({ device: 'rep-oven', kind: 'hob' }, hass)).toBe(472);
    expect(height({ device: 'rep-oven', kind: 'hob', variant: 'compact' }, hass)).toBe(264);
    // compact with its buttons asked for: their row under it, as a ring's; a fridge's none
    const compact = height({ device: 'hc-dish', variant: 'compact' }, hass);
    expect(height({ device: 'hc-dish', variant: 'compact', show_controls: true }, hass)).toBe(
      compact + 60,
    );
    expect(height({ device: 'miele-fridge', variant: 'compact', show_controls: true }, hass)).toBe(
      height({ device: 'miele-fridge', variant: 'compact' }, hass),
    );
    // the kind the house says, not a washer's: a fridge's two dials, no buttons
    expect(height({ device: 'miele-fridge', variant: 'ring' }, hass)).toBe(288);
    // without the house, the family's from the config alone
    expect(FluvyApplianceCard.layoutHeight({ type: 'x', device: 'rep-oven', kind: 'hob' })).toBe(
      376,
    );
  });

  it('says a programme Home Assistant has no words for by its own name, a long one whole in its title', async () => {
    const base = house();
    const id = 'select.kaffeevollautomat_ausgewahltes_programm';
    const key = (drink: string): string => `consumer_products_coffee_maker_program_${drink}`;
    const options = [
      key('beverage_espresso'),
      key('coffee_world_cold_brew_macchiato'),
      key('coffee_world_iced_cafe_con_leche_with_oat_milk_double_shot_and_cinnamon'),
    ];
    // Home Assistant says an option it has no translation for as its raw key
    const raw = {
      ...base,
      formatEntityState: (stateObj: HassEntity, state?: string) => state ?? stateObj.state,
      entities: {
        ...base.entities,
        [id]: {
          entity_id: id,
          device_id: 'hc-coffee',
          platform: 'home_connect',
          translation_key: 'selected_program',
        },
      },
      states: {
        ...base.states,
        [id]: {
          entity_id: id,
          state: options[0],
          attributes: { options },
          last_changed: AT,
          last_updated: AT,
        },
      },
    } as unknown as HomeAssistant;
    const tiles = (card: Mounted): string[] =>
      [...root(card).querySelectorAll('.ap-drink__name')].map(text);
    expect(tiles(await mount({ device: 'hc-coffee' }, raw))).toEqual([
      'Espresso',
      'Cold brew macchiato',
      'Iced cafe con leche with oat milk double shot and cinnamon',
    ]);
    // a name its tile may end in its ellipsis keeps its whole words in its title
    const long = await mount({ device: 'hc-coffee', drinks: [options[2]] }, raw);
    expect(root(long).querySelector('.ap-drink__name')?.getAttribute('title')).toBe(
      'Iced cafe con leche with oat milk double shot and cinnamon',
    );
  });

  it('the list’s whole cards follow them: each what its appliance draws, one a row 16 apart', () => {
    const hass = house();
    const list = (config: Record<string, unknown>, at?: HomeAssistant): number =>
      at
        ? appliancesHouseHeight({ type: 'x', variant: 'cards', ...config }, at)
        : FluvyAppliancesCard.layoutHeight({ type: 'x', variant: 'cards', ...config });
    expect(list({ appliances: ['st-oven', 'miele-coffee', 'hc-fridge'] }, hass)).toBe(
      3 * 376 + 2 * 16,
    );
    expect(list({ appliances: ['miele-coffee', { device: 'rep-oven', kind: 'hob' }] }, hass)).toBe(
      376 + 16 + 472,
    );
    // without the house, the family's
    expect(list({ appliances: ['st-oven'] })).toBe(376);
  });
});

describe('the appliance card’s editor', () => {
  beforeEach(() => {
    document.documentElement.lang = 'en';
  });

  /**
   * What the editor shows of an appliance as it stands, as a person sees it: its fields at the top, each section by its
   * title and its fields, and its lists.
   */
  const editor = (
    config: Record<string, unknown>,
    hass: HomeAssistant = house(),
  ): { readonly form: Record<string, string[]>; readonly lists: string[] } => {
    const form = FluvyApplianceCard.getConfigForm();
    const card = { type: 'custom:fluvy-appliance-card', ...config };
    const asked = { ...editorDefaults(form, FluvyApplianceCard.defaults)?.(card, hass), ...card };
    const names = (items: readonly HaFormSchemaItem[]): string[] =>
      items.flatMap((item) => (item.schema ? names(item.schema) : [item.name]));
    const shown: Record<string, string[]> = {};
    for (const item of visibleFields(form.schema, asked, hass)) {
      const title = item.type === 'expandable' ? String(item.title) : '';
      shown[title] = [...(shown[title] ?? []), ...names(item.schema ?? [item])];
    }
    const lists = (FluvyApplianceCard.lists ?? [])
      .filter((list) => list.when?.(asked, hass) ?? true)
      .map((list) => list.key);
    return { form: shown, lists };
  };

  it('keeps its settings in sections, each offering only what acts on the appliance and its layout', () => {
    // Home Connect's dishwasher, its whole card: its cycle's steps and times, its programmes, its salt and its door
    expect(editor({ device: 'hc-dish' }).form).toEqual({
      '': ['device', 'entity', 'kind', 'variant', 'name', 'icon', 'scan'],
      Header: ['picture', 'image', 'picture_min', 'show_power', 'power_action', 'show_notify'],
      'What it shows': [
        'show_hero',
        'show_progress',
        'progress_style',
        'time',
        'show_rows',
        'row_values',
      ],
      Buttons: ['show_controls', 'show_programs', 'confirm'],
      Reminders: ['low_level', 'unload_reminder', 'unload_after', 'done_for', 'door_alert'],
      Appearance: ['tone', 'color', 'card_color', 'card_opacity', 'unavailable'],
      Interactions: ['tap_action', 'hold_action'],
    });
    expect(editor({ device: 'hc-dish' }).lists).toEqual(['rows', 'maintenance', 'roles']);
    // a fridge: its compartments and its quick modes, its door; nothing it could be told to do, no buttons
    const fridge = editor({ device: 'miele-fridge' });
    expect(fridge.form['What it shows']).toEqual([
      'show_zones',
      'setpoint_style',
      'show_modes',
      'show_rows',
      'row_values',
    ]);
    expect(fridge.form['Buttons']).toBeUndefined();
    expect(fridge.form['Reminders']).toEqual(['door_alert']);
    expect(fridge.lists).toEqual(['rows', 'zones', 'roles']);
    // an oven: its heat and its target's stepper, no steps to its cycle, nothing to unload
    const oven = editor({ device: 'hc-oven' });
    expect(oven.form['What it shows']).toEqual([
      'show_hero',
      'show_progress',
      'time',
      'setpoint_style',
      'show_rows',
      'row_values',
    ]);
    expect(oven.form['Reminders']).toEqual(['done_for']);
    // a coffee machine: its drinks, never a cycle's figures
    expect(editor({ device: 'hc-coffee' }).form['What it shows']).toEqual([
      'show_drinks',
      'drinks',
      'show_rows',
      'row_values',
    ]);
    // a washer on a plug: what it draws says its cycle, the plug's own section with it
    const plug = editor({ device: 'plug-washer' });
    expect(plug.form['On a smart plug']).toEqual(['running_power', 'finished_after']);
    expect(plug.form['What it shows']).toEqual(['show_hero', 'show_rows', 'row_values']);
    expect(editor({ device: 'lg-washer' }).form['On a smart plug']).toBeUndefined();
    // a pet device named by hand: its tiles, its meal amount's days, never a cycle's
    const feeder = editor({ device: 'none', kind: 'feeder' });
    expect(feeder.form['What it shows']).toEqual(['show_hero', 'show_rows', 'row_values']);
    expect(feeder.form['Reminders']).toEqual(['low_level', 'low_days']);
    expect(feeder.lists).toEqual(['rows', 'tiles', 'maintenance', 'roles']);
  });

  it('offers each layout what it draws: the compact head’s circle and readouts, the row’s round and its buttons', () => {
    const compact = editor({ device: 'lg-washer', variant: 'compact' });
    expect(compact.form['Header']).toEqual(['show_icon']);
    expect(compact.form['What it shows']).toEqual([
      'show_progress',
      'progress_style',
      'time',
      'readouts',
    ]);
    expect(compact.lists).toEqual(['sensors', 'roles']);
    // the row draws no buttons, but its round is the first of them that can act: their order is offered alone
    const row = editor({ device: 'lg-washer', variant: 'row' });
    expect(row.form['Header']).toEqual([
      'picture',
      'image',
      'picture_min',
      'show_power',
      'power_action',
    ]);
    expect(row.form['What it shows']).toEqual(['time']);
    expect(row.form['Buttons']).toEqual(['controls', 'confirm']);
    expect(row.lists).toEqual(['roles']);
    // a setting that depends on another follows it: the buttons' order once they show, the drawing's photo
    expect(editor({ device: 'lg-washer', show_controls: true }).form['Buttons']).toEqual([
      'show_controls',
      'controls',
      'confirm',
    ]);
    expect(editor({ device: 'lg-washer', picture: 'icon' }).form['Header']).not.toContain('image');
  });

  it('offers the buttons an appliance can do, and any its config names already', () => {
    const offered = (config: Record<string, unknown>) =>
      (FluvyApplianceCard.choices?.({ type: 'x', ...config }, house())['controls'] ?? []).map(
        (option) => option.value,
      );
    expect(offered({ device: 'hc-oven' })).toEqual(['stop', 'power', 'light']);
    expect(offered({ device: 'hc-oven', controls: ['start'] })).toEqual([
      'start',
      'stop',
      'power',
      'light',
    ]);
    // nothing of an appliance found yet: every one
    expect(offered({})).toHaveLength(9);
  });

  it('offers every device an appliance can live on, whatever its integration: an MQTT one, a pet device (#115)', () => {
    const picker = {
      name: 'device',
      selector: { device: { entity: { domain: ['sensor', 'binary_sensor', 'switch'] } } },
    };
    expect(FluvyApplianceCard.getConfigForm().schema[0]).toEqual(picker);
    // the list of the house's appliances names its items the same way
    const items = FluvyAppliancesCard.lists?.find((list) => list.key === 'appliances');
    expect(items?.picker).toEqual(picker);
    expect(items?.schema[0]).toEqual(picker);
  });

  it('offers the roles that make sense for what the appliance is, in the order a person thinks of them (#115)', () => {
    const hass = house();
    const roles = (config: Record<string, unknown>): string[] =>
      (
        FluvyApplianceCard.choices?.({ type: 'custom:fluvy-appliance-card', ...config }, hass)[
          'role'
        ] ?? []
      ).map((option) => option.value);
    expect(roles({ device: 'de1' })).toEqual([
      'state',
      'power',
      'program',
      'temperature',
      'start',
      'stop',
      'error',
      'energy',
      'watts',
      'running',
      'online',
    ]);
    // a litter box's own, never a coffee machine's; a washer's times and door, never a meal
    const litter = roles({ device: 'de1', kind: 'litter_box' });
    expect(litter).toEqual(expect.arrayContaining(['clean', 'pause', 'last_pet']));
    expect(litter).not.toContain('program');
    const washer = roles({ device: 'hcpy-washer' });
    expect(washer.slice(0, 5)).toEqual(['state', 'power', 'program', 'phase', 'remaining']);
    expect(washer).toEqual(expect.arrayContaining(['door', 'water', 'pause']));
    expect(washer).not.toContain('feed');
    // a role the card names already stays offered, whatever the kind
    expect(roles({ device: 'de1', roles: [{ role: 'feed', entity: 'button.x' }] })).toContain(
      'feed',
    );
  });

  it('offers None for a role’s entity, first in Home Assistant’s picker, in the editor’s words (#127)', () => {
    const roles = FluvyApplianceCard.lists?.find((list) => list.key === 'roles');
    const form = roles?.schemaOf?.({ role: 'remote' }) ?? [];
    expect(form.map((field) => field.name)).toEqual(['role', 'entity']);
    expect(form[1]?.selector).toEqual({
      entity: { extra_options: [{ id: 'none', primary: 'None', icon: 'mdi:cancel' }] },
    });
    // the same form while the language is
    expect(roles?.schemaOf?.({ role: 'door' })).toBe(form);
  });

  it('offers its device’s own entities in every list that picks one, none without a device (#115)', () => {
    const hass = house();
    const own = (key: string, config: Record<string, unknown>): readonly string[] =>
      FluvyApplianceCard.lists
        ?.find((list) => list.key === key)
        ?.own?.entities({ type: 'custom:fluvy-appliance-card', ...config }, hass) ?? [];
    const de1 = own('roles', { device: 'de1' });
    expect(de1).toHaveLength(12);
    expect(de1).toContain('select.decent_espresso_de1pro_de1_profile');
    for (const key of ['rows', 'sensors', 'zones'])
      expect(own(key, { device: 'de1' })).toEqual(de1);
    // its entity's device where it names an entity
    expect(own('roles', { entity: 'switch.decent_espresso_de1pro_de1_on' })).toEqual(de1);
    expect(
      own('roles', { device: 'none', entity: 'switch.decent_espresso_de1pro_de1_on' }),
    ).toEqual([]);
  });

  it('shows what the card does for the appliance it is about where the config says nothing', () => {
    const hass = house();
    const defaults = FluvyApplianceCard.defaults?.(
      { type: 'custom:fluvy-appliance-card', device: 'lg-fridge' },
      hass,
    );
    expect(defaults).toMatchObject({ door_alert: 60, unload_reminder: false, controls: [] });
    const washer = FluvyApplianceCard.defaults?.(
      { type: 'custom:fluvy-appliance-card', device: 'lg-washer' },
      hass,
    );
    // the programme is the head's to say: no readout of it unless asked for
    expect(washer).toMatchObject({
      unload_reminder: true,
      readouts: ['temperature', 'spin', 'energy'],
    });
  });
});

describe('“Tell me when it’s done” (#47)', () => {
  const ID = 'fluvy_done_hc_dish';
  /** The house with Home Assistant's config API, recording what it is sent; the notice's automation where it is. */
  function houseWith(automation?: 'on' | 'off', admin = true, id = ID) {
    const hass = house();
    const api: Array<[string, string, unknown?]> = [];
    const states = { ...hass.states };
    if (automation)
      states['automation.geschirrspuler_tell_me'] = {
        entity_id: 'automation.geschirrspuler_tell_me',
        state: automation,
        attributes: { id, friendly_name: 'Geschirrspüler: tell me when it’s done' },
        last_changed: AT,
        last_updated: AT,
      } as HassEntity;
    return Object.assign(hass, {
      states,
      api,
      user: { id: 'u', name: 'U', is_admin: admin },
      callApi: async (method: string, path: string, body?: unknown) => {
        api.push(body === undefined ? [method, path] : [method, path, body]);
        return { result: 'ok' };
      },
    });
  }
  const bell = (card: Mounted) => root(card).querySelector<HTMLButtonElement>('.ap-notice');

  it('is an administrator’s round beside the figures, for what can say it finished', async () => {
    const card = await mount({ device: 'hc-dish' }, houseWith());
    expect(bell(card)?.getAttribute('aria-label')).toBe('Tell me when it’s done');
    expect(bell(card)?.getAttribute('aria-pressed')).toBe('false');
    expect(bell(card)?.closest('.ap-figures')).not.toBeNull();
    // never for a guest, never where asked not to, never for what has no finish (a fridge)
    expect(bell(await mount({ device: 'hc-dish' }, houseWith(undefined, false)))).toBeNull();
    expect(bell(await mount({ device: 'hc-dish', show_notify: false }, houseWith()))).toBeNull();
    expect(bell(await mount({ device: 'lg-fridge' }, houseWith()))).toBeNull();
    // out of reach it keeps its place, disabled
    const away = Object.assign(houseWith(), { states: { ...houseWith().states } });
    for (const [id, change] of Object.entries(unavailable('hc-dish')))
      away.states[id] = { ...(away.states[id] as HassEntity), ...change } as HassEntity;
    expect(bell(await mount({ device: 'hc-dish' }, away))?.disabled).toBe(true);
  });

  it('writes the automation in the administrator’s words, on at once', async () => {
    const hass = houseWith();
    const card = await mount({ device: 'hc-dish' }, hass);
    bell(card)?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await card.updateComplete;
    const [method, path, body] = hass.api[0] ?? [];
    expect([method, path]).toEqual(['POST', `config/automation/config/${ID}`]);
    expect(body).toMatchObject({
      id: ID,
      alias: 'Geschirrspüler: tell me when it’s done',
      triggers: [{ trigger: 'state', entity_id: 'sensor.geschirrspuler_betriebszustand' }],
      // no app on a phone in this house: Home Assistant's own notifications
      actions: [
        {
          action: 'persistent_notification.create',
          data: { title: 'Geschirrspüler', message: 'Geschirrspüler is done.' },
        },
      ],
    });
    // on until Home Assistant lists it
    expect(bell(card)?.getAttribute('aria-pressed')).toBe('true');
    expect(bell(card)?.classList.contains('ap-power--accent')).toBe(true);
  });

  it('once written, turns it off and on; a hold readies its removal, which a tap does', async () => {
    const hass = houseWith('on');
    const card = await mount({ device: 'hc-dish' }, hass);
    expect(bell(card)?.getAttribute('aria-pressed')).toBe('true');
    bell(card)?.click();
    expect(hass.calls.at(-1)).toMatchObject({ domain: 'automation', service: 'turn_off' });
    await card.updateComplete;
    // shown off at once, until Home Assistant says so
    expect(bell(card)?.getAttribute('aria-pressed')).toBe('false');
    vi.useFakeTimers();
    try {
      const button = bell(card)!;
      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', button: 0 }),
      );
      vi.advanceTimersByTime(600);
      await card.updateComplete;
      expect(bell(card)?.getAttribute('aria-label')).toBe('Tap again to delete');
      window.dispatchEvent(new PointerEvent('pointerup'));
      bell(card)?.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
      expect(hass.api.at(-1)).toEqual(['DELETE', `config/automation/config/${ID}`]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('on a `device: none` card, is the one 1.12 wrote, known by that `none`, until it is removed; then its own', async () => {
    const state = 'sensor.geschirrspuler_betriebszustand';
    const config = {
      device: 'none',
      kind: 'dishwasher',
      roles: [{ role: 'state', entity: state }],
    };
    const old = houseWith('on', true, 'fluvy_done_none');
    const card = await mount(config, old);
    expect(bell(card)?.getAttribute('aria-pressed')).toBe('true');
    bell(card)?.click();
    expect(old.calls.at(-1)).toMatchObject({ domain: 'automation', service: 'turn_off' });
    vi.useFakeTimers();
    try {
      bell(card)?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', button: 0 }),
      );
      vi.advanceTimersByTime(600);
      await card.updateComplete;
      window.dispatchEvent(new PointerEvent('pointerup'));
      bell(card)?.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
      expect(old.api.at(-1)).toEqual(['DELETE', 'config/automation/config/fluvy_done_none']);
    } finally {
      vi.useRealTimers();
    }
    // read, never moved: nothing written for it; once it is gone, a tap writes the card's own
    expect(old.api.filter(([method]) => method === 'POST')).toEqual([]);
    const fresh = houseWith();
    bell(await mount(config, fresh))?.click();
    expect(fresh.api[0]?.slice(0, 2)).toEqual([
      'POST',
      'config/automation/config/fluvy_done_sensor_geschirrspuler_betriebszustand',
    ]);
    // a card that names its device was never known by `none`
    const named = await mount({ device: 'hc-dish' }, houseWith('on', true, 'fluvy_done_none'));
    expect(bell(named)?.getAttribute('aria-pressed')).toBe('false');
  });
});
