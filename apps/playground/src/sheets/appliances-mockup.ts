import {
  resolveLanguage,
  wordsIn,
  type DeviceRegistryEntry,
  type EntityRegistryDisplayEntry,
  type HassEntity,
  type HomeAssistant,
  type LovelaceCardConfig,
} from '@fluvy/core';
import { FluvyApplianceCard } from '../../../../packages/cards/src/appliance/appliance-card.js';
import { FluvyAppliancesCard } from '../../../../packages/cards/src/appliance/appliances-card.js';
import { FluvyHeadingCard } from '../../../../packages/cards/src/heading/heading-card.js';
import { noticeId } from '../../../../packages/cards/src/automations/notice.js';
import { applianceSections } from '../../../../packages/cards/src/strategy/appliances.js';
import { HomeRegistry } from '../../../../packages/cards/src/strategy/home-registry.js';
import type { StateSeed } from '../hass.js';
import { NOW } from '../now.js';
import type { FrameSpec, SheetSpec } from '../scenes.js';

if (!customElements.get('fluvy-appliance-card'))
  customElements.define('fluvy-appliance-card', FluvyApplianceCard);
if (!customElements.get('fluvy-appliances-card'))
  customElements.define('fluvy-appliances-card', FluvyAppliancesCard);
if (!customElements.get('fluvy-heading-card'))
  customElements.define('fluvy-heading-card', FluvyHeadingCard);

/*
 * Issue #47's reporter's design, as the reporter drew it (`issue-images/i47-mockup.png`, 1536 wide): "Großgeräte" —
 * the fridge in operation, the dishwasher rinsing its Eco programme, the washer and the dryer at work, the oven heating
 * up, the hob with its first zone on, the air fryer cooking, the coffee machine ready — over "Kleingeräte", five
 * small appliances on their plugs, all off. The same thirteen appliances in the same states, in German, at noon (the
 * reporter's oven ends at 12:45 and the last coffee was at 08:14), on the page's width; a German house's ids, each one
 * this sheet's own. Drawn beside the image at `?sheet=appliances-mockup&lang=de&width=1504` in a lavender palette
 * close to the reporter's (`&accent=%233b5bdb&character=vivid&base=cool`); that page is for the eye, and the same cards
 * in a column (and the small ones half a section each) are the measurer's, at every probe.
 */

/** The reporter's moment: Thursday at 12:20, the sheets' day. */
const MOMENT = new Date(2026, 8, 17, 12, 20, 0);
const at = MOMENT.toISOString();
/** Seconds before the sheets' moment (21:47) a state changed, for a moment of the reporter's morning. */
const before = (hours: number, minutes: number): number =>
  Math.round((NOW.getTime() - new Date(2026, 8, 17, hours, minutes).getTime()) / 1000);

/** A device of the sheet, as the registry lists it. */
const device = (id: string, name: string, model: string, maker: string): DeviceRegistryEntry => ({
  id,
  name,
  name_by_user: null,
  area_id: null,
  model,
  manufacturer: maker,
  via_device_id: null,
});

/** An entity of a device: its id, its translation key and its integration. */
const entry =
  (platform: string, device: string) =>
  (entity_id: string, translation_key?: string): EntityRegistryDisplayEntry => ({
    entity_id,
    device_id: device,
    platform,
    ...(translation_key ? { translation_key } : {}),
  });

/** A span in minutes, as a duration sensor says it. */
const duration = (value: number): [string, Record<string, unknown>] => [
  String(value),
  { device_class: 'duration', unit_of_measurement: 'min' },
];
const percent = { unit_of_measurement: '%' };
const kwh = { device_class: 'energy', unit_of_measurement: 'kWh' };
const litres = { unit_of_measurement: 'l' };
const watts = { device_class: 'power', unit_of_measurement: 'W' };
const celsius = (min: number, max: number) => ({
  device_class: 'temperature',
  unit_of_measurement: '°C',
  min,
  max,
  step: 1,
});

interface Appliance {
  readonly device: DeviceRegistryEntry;
  readonly entities: readonly EntityRegistryDisplayEntry[];
  readonly states: readonly StateSeed[];
}

/** A front loader or a dishwasher at work: its state, its phase, its times and progress, its programme, its meters. */
function cycle(
  id: string,
  slug: string,
  name: string,
  o: {
    readonly phase: string;
    readonly left: number;
    readonly elapsed: number;
    readonly progress: number;
    readonly program: string;
    readonly programs: readonly string[];
    readonly extra?: ReadonlyArray<readonly [string, string, string, Record<string, unknown>?]>;
  },
): Appliance {
  const e = entry('home_connect', id);
  const extra = o.extra ?? [];
  return {
    device: device(id, name, 'WAV28M40', 'Siemens'),
    entities: [
      e(`sensor.${slug}_betriebszustand`, 'operation_state'),
      e(`sensor.${slug}_programmphase`, 'program_phase'),
      e(`sensor.${slug}_restzeit`, 'remaining_time'),
      e(`sensor.${slug}_laufzeit`, 'elapsed_time'),
      e(`sensor.${slug}_programmfortschritt`, 'program_progress'),
      e(`select.${slug}_ausgewahltes_programm`, 'selected_program'),
      e(`switch.${slug}_strom`, 'power'),
      ...extra.map(([entity, key]) => e(entity, key)),
    ],
    states: [
      [`sensor.${slug}_betriebszustand`, 'run', {}, 40 * 60],
      [`sensor.${slug}_programmphase`, o.phase],
      [`sensor.${slug}_restzeit`, ...duration(o.left)],
      [`sensor.${slug}_laufzeit`, ...duration(o.elapsed)],
      [`sensor.${slug}_programmfortschritt`, String(o.progress), percent],
      [`select.${slug}_ausgewahltes_programm`, o.program, { options: [...o.programs] }],
      [`switch.${slug}_strom`, 'on'],
      ...extra.map(([entity, , state, attributes]): StateSeed => [entity, state, attributes ?? {}]),
    ],
  };
}

const LARGE: Readonly<Record<string, Appliance>> = {
  // LG's fridge (the reporter's): its compartments' setpoints, its quick modes off, its air filter fine, its door shut
  'mk-fridge': (() => {
    const e = entry('lg_thinq', 'mk-fridge');
    return {
      device: device(
        'mk-fridge',
        'Kühlschrank',
        'GBB92STAXP (DEVICE_REFRIGERATOR)',
        'LG Electronics',
      ),
      entities: [
        e('number.mk_kuhlschrank_fridge_temperatur', 'target_temperature_for_location'),
        e('number.mk_kuhlschrank_freezer_temperatur', 'target_temperature_for_location'),
        e('binary_sensor.mk_kuhlschrank_tur'),
        e('switch.mk_kuhlschrank_express_kuhlen', 'express_fridge'),
        e('switch.mk_kuhlschrank_schnellgefrieren', 'rapid_freeze'),
        e('sensor.mk_kuhlschrank_frischluftfilter', 'fresh_air_filter'),
      ],
      states: [
        ['number.mk_kuhlschrank_fridge_temperatur', '4', celsius(1, 7)],
        ['number.mk_kuhlschrank_freezer_temperatur', '-18', celsius(-23, -15)],
        ['binary_sensor.mk_kuhlschrank_tur', 'off', { device_class: 'door' }],
        ['switch.mk_kuhlschrank_express_kuhlen', 'off'],
        ['switch.mk_kuhlschrank_schnellgefrieren', 'off'],
        ['sensor.mk_kuhlschrank_frischluftfilter', 'normal'],
      ],
    };
  })(),
  'mk-dish': cycle('mk-dish', 'mk_geschirrspuler', 'Geschirrspüler', {
    phase: 'rinsing',
    left: 72,
    elapsed: 93,
    progress: 60,
    program: 'dishcare_dishwasher_program_eco_50',
    programs: ['dishcare_dishwasher_program_eco_50', 'dishcare_dishwasher_program_auto_2'],
    extra: [
      ['sensor.mk_geschirrspuler_wasser', 'water_consumption', '8.5', litres],
      ['sensor.mk_geschirrspuler_energie', 'energy_consumption', '0.9', kwh],
    ],
  }),
  'mk-washer': cycle('mk-washer', 'mk_waschmaschine', 'Waschmaschine', {
    phase: 'washing',
    left: 48,
    elapsed: 42,
    progress: 53,
    program: 'laundry_care_washer_program_cotton',
    programs: ['laundry_care_washer_program_cotton', 'laundry_care_washer_program_mix'],
    extra: [
      [
        'select.mk_waschmaschine_temperatur',
        'washer_temperature',
        'laundry_care_washer_enum_type_temperature_g_c_40',
      ],
      ['sensor.mk_waschmaschine_wasser', 'water_consumption', '42', litres],
      ['sensor.mk_waschmaschine_energie', 'energy_consumption', '0.6', kwh],
    ],
  }),
  'mk-dryer': cycle('mk-dryer', 'mk_trockner', 'Trockner', {
    phase: 'drying',
    left: 32,
    elapsed: 48,
    progress: 40,
    program: 'laundry_care_dryer_program_synthetic',
    programs: ['laundry_care_dryer_program_synthetic', 'laundry_care_dryer_program_cotton'],
    extra: [
      ['sensor.mk_trockner_energie', 'energy_consumption', '1.2', kwh],
      [
        'sensor.mk_trockner_flusensieb',
        'smart_filter_cleaning_reminder',
        'present',
        { device_class: 'enum', options: ['confirmed', 'off', 'present'] },
      ],
    ],
  }),
  // the oven heating up for its top and bottom heat: 180 °C on its way to 200, 25 minutes left
  'mk-oven': (() => {
    const e = entry('home_connect', 'mk-oven');
    return {
      device: device('mk-oven', 'Backofen', 'HBG7741B1', 'Bosch'),
      entities: [
        e('sensor.mk_backofen_betriebszustand', 'operation_state'),
        e('sensor.mk_backofen_programmphase', 'program_phase'),
        e('sensor.mk_backofen_garraumtemperatur', 'oven_current_cavity_temperature'),
        e('number.mk_backofen_temperatur', 'setpoint_temperature'),
        e('sensor.mk_backofen_restzeit', 'remaining_time'),
        e('sensor.mk_backofen_programmfortschritt', 'program_progress'),
        e('select.mk_backofen_ausgewahltes_programm', 'selected_program'),
        e('switch.mk_backofen_strom', 'power'),
      ],
      states: [
        ['sensor.mk_backofen_betriebszustand', 'run', {}, 20 * 60],
        ['sensor.mk_backofen_programmphase', 'heating'],
        [
          'sensor.mk_backofen_garraumtemperatur',
          '180',
          { device_class: 'temperature', unit_of_measurement: '°C' },
        ],
        ['number.mk_backofen_temperatur', '200', celsius(30, 300)],
        ['sensor.mk_backofen_restzeit', ...duration(25)],
        ['sensor.mk_backofen_programmfortschritt', '70', percent],
        [
          'select.mk_backofen_ausgewahltes_programm',
          'cooking_oven_program_heating_mode_top_bottom_heating',
          {
            options: [
              'cooking_oven_program_heating_mode_top_bottom_heating',
              'cooking_oven_program_heating_mode_hot_air',
            ],
          },
        ],
        ['switch.mk_backofen_strom', 'on'],
      ],
    };
  })(),
  // Miele's hob: its first zone on at 7, its timer, what it draws
  'mk-hob': (() => {
    const e = entry('miele', 'mk-hob');
    return {
      device: device('mk-hob', 'Kochfeld', 'Hob', 'Miele'),
      entities: [
        e('sensor.mk_kochfeld_status', 'status'),
        ...[1, 2, 3, 4].map((n) => e(`sensor.mk_kochfeld_kochzone_${n}`, 'plate')),
        e('sensor.mk_kochfeld_timer_zone_1'),
        e('sensor.mk_kochfeld_leistung'),
      ],
      states: [
        ['sensor.mk_kochfeld_status', 'in_use'],
        ['sensor.mk_kochfeld_kochzone_1', 'plate_step_7'],
        ['sensor.mk_kochfeld_kochzone_2', 'plate_step_0'],
        ['sensor.mk_kochfeld_kochzone_3', 'plate_step_0'],
        ['sensor.mk_kochfeld_kochzone_4', 'plate_step_0'],
        ['sensor.mk_kochfeld_timer_zone_1', ...duration(18)],
        ['sensor.mk_kochfeld_leistung', '1800', watts],
      ],
    };
  })(),
  // an air fryer cooking chips at 200 °C with hot air, 12 of its 25 minutes left (48 % of its programme, it says)
  'mk-fryer': (() => {
    const e = entry('tuya', 'mk-fryer');
    return {
      device: device('mk-fryer', 'Heißluftfritteuse', 'Dual Blaze', 'Cosori'),
      entities: [
        e('sensor.mk_heissluftfritteuse_status', 'status'),
        e('sensor.mk_heissluftfritteuse_restzeit', 'remaining_time'),
        e('sensor.mk_heissluftfritteuse_laufzeit', 'elapsed_time'),
        e('sensor.mk_heissluftfritteuse_progress'),
        e('number.mk_heissluftfritteuse_temperatur', 'target_temperature'),
        e('select.mk_heissluftfritteuse_program'),
        e('select.mk_heissluftfritteuse_modus'),
        e('switch.mk_heissluftfritteuse_strom', 'power'),
      ],
      states: [
        ['sensor.mk_heissluftfritteuse_status', 'cooking', {}, 13 * 60],
        ['sensor.mk_heissluftfritteuse_restzeit', ...duration(12)],
        ['sensor.mk_heissluftfritteuse_laufzeit', ...duration(13)],
        ['sensor.mk_heissluftfritteuse_progress', '48', percent],
        ['number.mk_heissluftfritteuse_temperatur', '200', celsius(80, 230)],
        [
          'select.mk_heissluftfritteuse_program',
          'fries',
          { options: ['fries', 'chicken', 'vegetables'] },
        ],
        [
          'select.mk_heissluftfritteuse_modus',
          'hot_air',
          { options: ['hot_air', 'grill', 'dehydrate'] },
        ],
        ['switch.mk_heissluftfritteuse_strom', 'on'],
      ],
    };
  })(),
  // Home Connect's coffee machine, ready: its drinks, its last coffee at 08:14, its water and beans fine
  'mk-coffee': (() => {
    const e = entry('home_connect', 'mk-coffee');
    const drinks = [
      'consumer_products_coffee_maker_program_beverage_espresso',
      'consumer_products_coffee_maker_program_beverage_coffee',
      'consumer_products_coffee_maker_program_beverage_cappuccino',
      'consumer_products_coffee_maker_program_beverage_latte_macchiato',
    ];
    const event = { device_class: 'enum', options: ['confirmed', 'off', 'present'] };
    return {
      device: device('mk-coffee', 'Kaffeemaschine', 'TI9573X1RW', 'Siemens'),
      entities: [
        e('sensor.mk_kaffeemaschine_betriebszustand', 'operation_state'),
        e('select.mk_kaffeemaschine_ausgewahltes_programm', 'selected_program'),
        e('sensor.mk_kaffeemaschine_kaffees', 'coffee_counter'),
        e('sensor.mk_kaffeemaschine_wassertank_leer', 'water_tank_empty'),
        e('sensor.mk_kaffeemaschine_bohnenbehalter_leer', 'bean_container_empty'),
        e('switch.mk_kaffeemaschine_strom', 'power'),
      ],
      states: [
        ['sensor.mk_kaffeemaschine_betriebszustand', 'ready'],
        ['select.mk_kaffeemaschine_ausgewahltes_programm', drinks[0] ?? '', { options: drinks }],
        [
          'sensor.mk_kaffeemaschine_kaffees',
          '1234',
          { state_class: 'total_increasing' },
          before(8, 14),
        ],
        ['sensor.mk_kaffeemaschine_wassertank_leer', 'off', event],
        ['sensor.mk_kaffeemaschine_bohnenbehalter_leer', 'off', event],
        ['switch.mk_kaffeemaschine_strom', 'on'],
      ],
    };
  })(),
};

/** The small appliances: each on a smart plug, off. */
const SMALL: ReadonlyArray<readonly [string, string, string]> = [
  ['mk-toaster', 'Toaster', 'mk_toaster'],
  ['mk-kettle', 'Wasserkocher', 'mk_wasserkocher'],
  ['mk-microwave', 'Mikrowelle', 'mk_mikrowelle'],
  ['mk-blender', 'Mixer', 'mk_mixer'],
  ['mk-sandwich', 'Sandwichmaker', 'mk_sandwichmaker'],
];
const PLUGS: Readonly<Record<string, Appliance>> = Object.fromEntries(
  SMALL.map(([id, name, slug]) => {
    const e = entry('shelly', id);
    return [
      id,
      {
        device: device(id, name, 'Shelly Plus Plug S', 'Shelly'),
        entities: [e(`switch.${slug}`), e(`sensor.${slug}_leistung`)],
        states: [
          [`switch.${slug}`, 'off'],
          [`sensor.${slug}_leistung`, '0', watts, 3 * 3600],
        ],
      },
    ];
  }),
);

const ALL = { ...LARGE, ...PLUGS };

/** Home Assistant's German words for the states and options of this house. */
const GERMAN: Readonly<Record<string, string>> = {
  run: 'Läuft',
  rinsing: 'Spült (Eco)',
  washing: 'Waschen',
  drying: 'Trocknet',
  heating: 'Heizt auf',
  cooking: 'Gart',
  ready: 'Bereit',
  in_use: 'In Betrieb',
  on: 'Ein',
  off: 'Aus',
  plate_step_0: 'Aus',
  plate_step_7: 'Stufe 7',
  dishcare_dishwasher_program_eco_50: 'Eco 50 °C',
  dishcare_dishwasher_program_auto_2: 'Auto 45–65 °C',
  laundry_care_washer_program_cotton: 'Baumwolle',
  laundry_care_washer_program_mix: 'Mix',
  laundry_care_washer_enum_type_temperature_g_c_40: '40 °C',
  laundry_care_dryer_program_synthetic: 'Schontrocknen',
  laundry_care_dryer_program_cotton: 'Baumwolle',
  cooking_oven_program_heating_mode_top_bottom_heating: 'Ober-/Unterhitze',
  cooking_oven_program_heating_mode_hot_air: '3D-Heißluft',
  fries: 'Pommes',
  chicken: 'Hähnchen',
  vegetables: 'Gemüse',
  hot_air: 'Heißluft',
  grill: 'Grill',
  dehydrate: 'Dörren',
  consumer_products_coffee_maker_program_beverage_espresso: 'Espresso',
  consumer_products_coffee_maker_program_beverage_coffee: 'Kaffee',
  consumer_products_coffee_maker_program_beverage_cappuccino: 'Cappuccino',
  consumer_products_coffee_maker_program_beverage_latte_macchiato: 'Latte macchiato',
};

const OURS = new Set(
  Object.values(ALL).flatMap((appliance) => appliance.entities.map((e) => e.entity_id)),
);

/** The house in German, as Home Assistant says this house's states. */
const german = (hass: HomeAssistant): HomeAssistant => {
  const format = hass.formatEntityState;
  return {
    ...hass,
    formatEntityState: (stateObj: HassEntity, state?: string) => {
      const raw = state ?? stateObj.state;
      return (
        (OURS.has(stateObj.entity_id) ? GERMAN[raw] : undefined) ?? format?.(stateObj, state) ?? raw
      );
    },
  } as HomeAssistant;
};

/** An appliance card on one of the sheet's devices, at the reporter's moment. */
const card = (device: string, more: Record<string, unknown> = {}): LovelaceCardConfig => ({
  type: 'custom:fluvy-appliance-card',
  device,
  _now: at,
  ...more,
});
const heading = (title: string, icon: string, meta: string): LovelaceCardConfig => ({
  type: 'custom:fluvy-heading-card',
  title,
  icon,
  subtitle: meta,
  path: '/geraete',
  heading_style: 'title',
});

/** The eight large appliances as the reporter shows them: their names, their rows and their colours where they differ. */
const LARGE_CARDS: readonly LovelaceCardConfig[] = [
  card('mk-fridge', {
    kind: 'fridge',
    zones: [
      { entity: 'number.mk_kuhlschrank_fridge_temperatur', name: 'Kühlfach' },
      { entity: 'number.mk_kuhlschrank_freezer_temperatur', name: 'Gefrierfach' },
    ],
    maintenance: [{ key: 'air_filter', name: 'Filter' }],
  }),
  card('mk-dish', { kind: 'dishwasher' }),
  card('mk-washer', { kind: 'washer' }),
  card('mk-dryer', {
    kind: 'dryer',
    rows: ['program', { key: 'energy', color: 'orange' }, 'filter'],
  }),
  card('mk-oven', { kind: 'oven' }),
  card('mk-hob', {
    kind: 'hob',
    rows: [
      { entity: 'sensor.mk_kochfeld_timer_zone_1', name: 'Timer Zone 1', icon: 'timer' },
      'power',
      'zones',
    ],
  }),
  card('mk-fryer', {
    kind: 'air_fryer',
    rows: [
      { key: 'target', name: '' },
      { entity: 'select.mk_heissluftfritteuse_modus', name: '', icon: 'steam' },
      'program',
    ],
  }),
  card('mk-coffee', { kind: 'coffee' }),
];
const SMALL_CARDS = SMALL.map(([id]) => card(id, { variant: 'row' }));

/** The sheet's house as the automatic dashboard reads it: the appliances' registries and states. */
const HOUSE = new HomeRegistry({
  states: Object.fromEntries(
    Object.values(ALL)
      .flatMap((appliance) => appliance.states)
      .map(([entity_id, state, attributes = {}]) => [
        entity_id,
        { entity_id, state, attributes, last_changed: at, last_updated: at },
      ]),
  ),
  entities: Object.fromEntries(
    Object.values(ALL).flatMap((appliance) =>
      appliance.entities.map((e) => [e.entity_id, e] as const),
    ),
  ),
  devices: Object.fromEntries(Object.entries(ALL).map(([id, appliance]) => [id, appliance.device])),
  areas: {},
  language: 'de',
  user: { id: 'u1', name: 'Marta', is_admin: true },
});

/**
 * Home's appliances as the automatic dashboard lays them out (#47), in the page's language: the band's headings and
 * the appliances card that sets each appliance's whole card side by side, at the reporter's moment. Read when the
 * frame is drawn, once the page's words have landed.
 */
const band = (): LovelaceCardConfig[] => {
  const t = wordsIn(resolveLanguage(new URLSearchParams(location.search).get('lang') ?? 'en'));
  const [section] = applianceSections({ home: HOUSE, t }, HOUSE.applianceDevices, 3, {
    path: '/fluvy-home/appliances',
    caps: true,
  });
  return (section?.cards ?? []).map((config) =>
    config.type === 'custom:fluvy-appliances-card' ? { ...config, _now: at } : config,
  );
};

/**
 * "Tell me when it's done" (#47) as Home Assistant lists it: the dishwasher's on, the washer's off; and on, the one
 * 1.12 wrote for a card that names no device, known by that `none`.
 */
const NOTICES: ReadonlyArray<readonly [string, 'on' | 'off']> = [
  ['mk-dish', 'on'],
  ['mk-washer', 'off'],
  ['none', 'on'],
];
const withNotices = (hass: HomeAssistant): HomeAssistant => {
  const states = { ...hass.states };
  for (const [device, state] of NOTICES) {
    const id = noticeId(device);
    states[`automation.${id}`] = {
      entity_id: `automation.${id}`,
      state,
      attributes: { id, friendly_name: id },
      last_changed: at,
      last_updated: at,
    };
  }
  return { ...german(hass), states };
};

/** Home Assistant's config API for the notices the cards write: the automation follows a beat later, as it reloads. */
function api(method: string, path: string, body?: unknown): unknown {
  const id = /^config\/automation\/config\/(fluvy_done_[a-z0-9_]+)$/.exec(path)?.[1];
  if (!id || (method !== 'POST' && method !== 'DELETE')) return undefined;
  const house = (
    window as unknown as {
      fluvyMock?: {
        hass(): HomeAssistant;
        add(seed: StateSeed): void;
        remove(id: string): void;
        fire(eventType: string): void;
      };
    }
  ).fluvyMock;
  const alias = String((body as { alias?: unknown } | undefined)?.alias ?? id);
  setTimeout(() => {
    if (!house) return;
    const entity = `automation.${id}`;
    if (method === 'DELETE') house.remove(entity);
    else if (!house.hass().states[entity]) house.add([entity, 'on', { id, friendly_name: alias }]);
    house.fire('automation_reloaded');
  }, 300);
  return { result: 'ok' };
}

export const sheet: SheetSpec = {
  states: Object.values(ALL).flatMap((appliance) => appliance.states),
  registry: {
    devices: Object.fromEntries(
      Object.entries(ALL).map(([id, appliance]) => [id, appliance.device]),
    ),
    entities: Object.fromEntries(
      Object.values(ALL).flatMap((appliance) =>
        appliance.entities.map((e) => [e.entity_id, e] as const),
      ),
    ),
  },
  frames: [
    // the reporter's page: eight large appliances four a row (a 1536 window), then five small ones on their plugs
    {
      title: 'The reporter’s design (#47)',
      width: 1504,
      columns: 60,
      measure: false,
      hass: german,
      cards: [
        { ...heading('Großgeräte', 'fluvy:dishwasher', 'Alle Geräte'), cols: 60 },
        ...LARGE_CARDS.map((config) => ({ ...config, cols: 15 })),
        { ...heading('Kleingeräte', 'plug', 'Alle anzeigen'), cols: 60 },
        ...SMALL_CARDS.map((config) => ({ ...config, cols: 12 })),
      ],
    } satisfies FrameSpec,
    // the same appliances in a column of the measurer's widths, the small ones half a section each
    { title: 'Its large appliances · a column', hass: german, cards: LARGE_CARDS },
    {
      title: 'Its small appliances · half a section',
      width: 360,
      hass: german,
      cards: SMALL_CARDS.map((config) => ({ ...config, cols: 6 })),
    },
    // the automatic dashboard's Home lays the same appliances out across under its columns (#47): a desktop's band
    // (three columns of 480 and their gaps), the large ones four across and 360 each, the small ones five across
    {
      title: 'Home’s appliances · a desktop’s band',
      width: 1488,
      measure: false,
      hass: german,
      get cards() {
        return band();
      },
    } satisfies FrameSpec,
    // the same band in a column of the measurer's widths: one a row
    {
      title: 'Home’s appliances · a column',
      hass: german,
      get cards() {
        return band();
      },
    } satisfies FrameSpec,
    // the band's section titles at half a section (a heading takes six columns at least): the link's words give way
    // first, then the title's size, then the chevron, before a title ends in its ellipsis
    {
      title: 'Its section titles · half a section',
      width: 360,
      hass: german,
      get cards() {
        return band()
          .filter((config) => config.type === 'custom:fluvy-heading-card')
          .map((config) => ({ ...config, cols: 6 }));
      },
    } satisfies FrameSpec,
    // "Tell me when it's done" (an administrator's): on for the dishwasher, off for the washer, none yet for the dryer
    {
      title: 'Tell me when it’s done',
      hass: withNotices,
      cards: [
        card('mk-dish', { kind: 'dishwasher' }),
        card('mk-washer', { kind: 'washer' }),
        card('mk-dryer', { kind: 'dryer' }),
      ],
    },
    // a card that names no device (`device: none`, its roles by hand) finds the one 1.12 wrote for it
    {
      title: 'Tell me when it’s done · no device, as 1.12 wrote it',
      hass: withNotices,
      cards: [
        card('none', {
          kind: 'dishwasher',
          name: 'Geschirrspüler',
          roles: [{ role: 'state', entity: 'sensor.mk_geschirrspuler_betriebszustand' }],
        }),
      ],
    },
  ],
  api,
};
