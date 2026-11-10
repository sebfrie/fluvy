import {
  addEnglish,
  idsOf,
  localize,
  resolveEntity,
  type HaFormSchemaItem,
  type HomeAssistant,
  type KeyOf,
  type LovelaceCardConfig,
  type LovelaceConfigForm,
  type MessageKey,
  SLIDER_STYLES,
  SLIDER_WORDS,
  sliderDefaults,
  type SliderStyle,
  UNAVAILABLE_LOOKS,
} from '@fluvy/core';
import { TONES } from '@fluvy/ui';
import type { EditorChoices, RowsListSpec, SelectOption } from './rows-editor.js';
import { LADDERS, ladderOf, unitClass } from './units.js';
import words from '@fluvy/core/locales/en/editor.json';

// the editors' English, in this chunk: every editor is built of these fields, so its words are here before it speaks
addEnglish(words);

/** The words every card's editor shares, by field name: a card maps only its own fields (or another word). */
export const SHARED_LABELS: Readonly<Record<string, MessageKey>> = {
  title: 'editor.title',
  subtitle: 'editor.subtitle',
  icon: 'editor.icon',
  tone: 'editor.tone',
  color: 'editor.color',
  card_color: 'editor.card_color',
  entity: 'editor.entity',
  entities: 'editor.entities',
  name: 'editor.name',
  tap_action: 'editor.tap_action',
  hold_action: 'editor.hold_action',
  hours: 'editor.hours',
  variant: 'editor.variant',
  size: 'editor.size',
  columns: 'editor.columns',
  secondary: 'editor.secondary',
  min: 'editor.min',
  max: 'editor.max',
};

/** The language an editor speaks: `getConfigForm()` is static, so it comes from the document. */
export const editorLanguage = (): Pick<HomeAssistant, 'language'> => ({
  language: document.documentElement.lang || 'en',
});

/** A value a select may hold: one the catalogue has a word for (`option.<value>`), in every language. */
export type OptionWord = KeyOf<'option'>;

/** A word of the catalogue in the editor's language (a select built by hand names its choices with it). */
export const editorWord = (key: MessageKey): string => localize(editorLanguage(), key);

/** What names an editor's field (`computeLabel` of a config form): a word, or HA's own when undefined. */
export type FormLabeler = (
  schema: HaFormSchemaItem,
  localize: (key: string) => string,
) => string | undefined;

/** Editor labels in the dashboard's language. `getConfigForm()` is static, so the language comes from the document. */
/** A field's own editor word, when the catalogue has one (`show_rows` → `editor.show_rows`). */
const editorKey = (name: string): MessageKey | undefined =>
  Object.hasOwn(words.editor, name) ? (`editor.${name}` as MessageKey) : undefined;

export function formLabels(map: Readonly<Record<string, MessageKey>> = {}): {
  readonly computeLabel: FormLabeler;
} {
  return {
    computeLabel: (schema: HaFormSchemaItem) => {
      const key = map[schema.name] ?? SHARED_LABELS[schema.name] ?? editorKey(schema.name);
      if (!key) return undefined;
      return localize(editorLanguage(), key);
    },
  };
}

/**
 * Editor labels for a card with words of its own: a field it owns is named from its own namespace (`own`, the
 * card's `strings('<name>')`), the rest from the shared editor words (the defaults, and `shared` for another word).
 */
export function editorLabels<K extends string>(
  strings: (hass: Pick<HomeAssistant, 'language'> | undefined, key: K) => string,
  own: Readonly<Record<string, K>>,
  shared: Readonly<Record<string, MessageKey>> = {},
): { readonly computeLabel: FormLabeler } {
  const fallback = formLabels(shared);
  return {
    computeLabel: (schema, localize) => {
      const key = own[schema.name];
      return key ? strings(editorLanguage(), key) : fallback.computeLabel(schema, localize);
    },
  };
}

/**
 * The visual editor shows a list as an entity picker, which can only hold ids. A list with
 * `{ entity, name, … }` rows makes Home Assistant fall back to its YAML editor instead of mangling them.
 */
export function idsOnly(...keys: readonly string[]): Pick<LovelaceConfigForm, 'assertConfig'> {
  return {
    assertConfig: (config: LovelaceCardConfig) => {
      for (const key of keys) {
        const list = config[key];
        if (Array.isArray(list) && list.some((row) => typeof row !== 'string'))
          throw new Error(`"${key}" has rows with options: edit them as YAML`);
      }
    },
  };
}

export const entityField = (
  domains?: readonly string[],
  name = 'entity',
  required = true,
): HaFormSchemaItem => ({
  name,
  required,
  selector: { entity: domains ? { domain: [...domains] } : {} },
});

export const textField = (name: string): HaFormSchemaItem => ({ name, selector: { text: {} } });
export const iconField = (name = 'icon'): HaFormSchemaItem => ({ name, selector: { icon: {} } });
/** An area of the house, from Home Assistant's own picker. */
export const areaField = (name = 'area'): HaFormSchemaItem => ({
  name,
  required: true,
  selector: { area: {} },
});
export const boolField = (name: string): HaFormSchemaItem => ({ name, selector: { boolean: {} } });
/** A number typed in a box, from `min` to `max`; without a `max` where the card takes any (a list's rows). */
export const numberField = (
  name: string,
  min: number,
  max?: number,
  step = 1,
): HaFormSchemaItem => ({
  name,
  selector: { number: { min, ...(max === undefined ? {} : { max }), step, mode: 'box' } },
});
/**
 * A choice among values the catalogue names (a value without a word does not compile), in the editor's language;
 * `custom` lets a value of the person's own be typed as well (an attribute's name, a template); `words` names a value
 * by another word where its own would say something else here (`full` strength is not the full layout).
 */
export const selectField = (
  name: string,
  options: readonly OptionWord[],
  {
    custom = false,
    words = {},
  }: { custom?: boolean; words?: Partial<Record<OptionWord, OptionWord>> } = {},
): HaFormSchemaItem => ({
  name,
  selector: {
    select: {
      mode: 'dropdown',
      ...(custom ? { custom_value: true } : {}),
      options: optionChoices(options, words),
    },
  },
});

/** A select's choices: each value with its words (`option.*`, or another value's where `words` says so). */
export const optionChoices = (
  options: readonly OptionWord[],
  words: Partial<Record<OptionWord, OptionWord>> = {},
): SelectOption[] =>
  options.map((value) => ({
    value,
    label: localize(editorLanguage(), `option.${words[value] ?? value}`),
  }));
/**
 * Where a row's last change is read from (`since`, #67): one of the house's timestamp sensors (`sinceChoices`), or
 * `attribute:<name>` of the row's own entity, typed.
 */
export const sinceField = (): HaFormSchemaItem => ({
  ...selectField('since', [], { custom: true }),
  helper: 'editor.since_help',
});

/** The house's timestamp sensors, by name, as a `since` select's choices: what a real last change is read from. */
export const sinceChoices: EditorChoices = (_config, hass) => ({
  since: Object.values(hass?.states ?? {})
    .filter(
      (state) =>
        state.entity_id.startsWith('sensor.') && state.attributes.device_class === 'timestamp',
    )
    .map((state) => ({
      value: state.entity_id,
      label: state.attributes.friendly_name ?? state.entity_id,
    })),
});

/**
 * A select's row (#96): the options its list offers, in their order (of those the select lists, `selectRowChoices`),
 * and its own words for them.
 */
export const selectRowFields = (): [options: HaFormSchemaItem, labels: HaFormSchemaItem] => [
  { name: 'options', selector: { select: { multiple: true, reorder: true, options: [] } } },
  { name: 'labels', selector: { object: {} } },
];

/** Whether a row's entity is a select: its form offers its options and their words. */
export const isSelectRow = (item: Readonly<Record<string, unknown>>): boolean =>
  /^(input_)?select\./.test(String(item['entity']));

/** A row's `since` offers the house's timestamp sensors, a select's `options` what it lists, in its words. */
export const selectRowChoices: EditorChoices = (item, hass) => {
  const state = hass?.states[String(item['entity'])];
  const listed: unknown = state?.attributes['options'];
  return {
    ...sinceChoices(item, hass),
    options: (Array.isArray(listed) ? listed : []).map((option) => {
      const value = String(option);
      return { value, label: (state && hass?.formatEntityState?.(state, value)) || value };
    }),
  };
};

/**
 * A choice among values, each named by a word of the catalogue — a family's own words among them, where `selectField`
 * takes the core's option words alone.
 */
export const choiceField = (
  name: string,
  options: ReadonlyArray<readonly [value: string, word: MessageKey]>,
): HaFormSchemaItem => ({
  name,
  selector: {
    select: {
      mode: 'dropdown',
      options: options.map(([value, word]) => ({ value, label: editorWord(word) })),
    },
  },
});

/**
 * An ordered subset of named choices (a compact row's `controls`): Home Assistant's select as chips that are
 * dragged into order, with a box to add the rest. The dropdown mode is asked for: with fewer than six choices the
 * selector would draw check boxes, which keep no order. `custom` lets a value of the person's own be typed as well
 * (a light's quick colour as `#rrggbb`).
 */
export const orderedField = (
  name: string,
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>,
  { custom = false }: { custom?: boolean } = {},
): HaFormSchemaItem => ({
  name,
  selector: {
    select: {
      multiple: true,
      reorder: true,
      mode: 'dropdown',
      ...(custom ? { custom_value: true } : {}),
      options: [...options],
    },
  },
});

export const actionField = (name = 'tap_action'): HaFormSchemaItem => ({
  name,
  selector: { ui_action: {} },
});

/** What a card answers a tap and a still press with, on one row. */
export const actionFields = (): HaFormSchemaItem =>
  fieldRow(actionField('tap_action'), actionField('hold_action'));

/** The palette's tones as a dropdown, each by its word. */
export const toneSelector = (language: Pick<HomeAssistant, 'language'> = editorLanguage()) => ({
  select: {
    mode: 'dropdown',
    options: TONES.map((value) => ({ value, label: localize(language, `tone.${value}`) })),
  },
});

/** Whether a field's label stands above its box (an entity's or a statistic's picker); every other field's is inside it. */
const labelAbove = (item: HaFormSchemaItem): boolean =>
  Boolean(item.selector && ('entity' in item.selector || 'statistic' in item.selector));

/**
 * Fields side by side: one row of the editor (Home Assistant's form grid), on their boxes' tops whatever hint is under
 * each. A label above its box beside one inside its own would leave the boxes 24 apart: such a row stacks.
 */
export const fieldRow = (...schema: HaFormSchemaItem[]): HaFormSchemaItem => {
  const above = schema.filter(labelAbove).length;
  return {
    type: 'grid',
    name: '',
    flatten: true,
    ...(above && above < schema.length ? { column_min_width: '100%' } : {}),
    schema,
  };
};

/** A group of fields under a title of its own, folded until opened (Home Assistant's expandable section). */
export const sectionField = (
  title: MessageKey,
  schema: readonly HaFormSchemaItem[],
): HaFormSchemaItem => ({
  type: 'expandable',
  name: '',
  title: editorWord(title),
  flatten: true,
  schema,
});

/**
 * A form with only the items `keep` takes, asked of every row and every field: a row it refuses goes whole, and a row
 * that loses one of its fields keeps the other on its own line. A section keeps its title over the fields it has left,
 * and goes where it has none: what stays of it is never spilled into the form around it.
 */
export function pickFields(
  schema: readonly HaFormSchemaItem[],
  keep: (item: HaFormSchemaItem) => boolean,
): HaFormSchemaItem[] {
  return schema.flatMap((item): HaFormSchemaItem[] => {
    if (!keep(item)) return [];
    if (!item.schema) return [item];
    const inner = pickFields(item.schema, keep);
    // unchanged only where every item is its own: a row that lost a field counts one, as the row did
    if (
      inner.length === item.schema.length &&
      inner.every((kept, at) => kept === item.schema?.[at])
    )
      return [item];
    if (item.type === 'expandable') return inner.length ? [{ ...item, schema: inner }] : [];
    return inner;
  });
}

/** A `pickFields` test of the fields' names alone: every row is opened, for its fields to be asked. */
export const byName =
  (keep: (name: string) => boolean) =>
  (item: HaFormSchemaItem): boolean =>
    item.schema !== undefined || keep(item.name);

/** A field as `ha-form` takes it, through its rows: without its `when` (a form is never handed a function). */
function bare(item: HaFormSchemaItem): HaFormSchemaItem {
  const { when, schema, ...field } = item;
  return when || schema ? { ...field, ...(schema ? { schema: schema.map(bare) } : {}) } : item;
}

/**
 * The form as it stands: the fields and rows that can act on what it holds (`when`, asked with the config over the
 * card's defaults, and the house), the rest left out — their values stay in the config.
 */
export const visibleFields = (
  schema: readonly HaFormSchemaItem[],
  data: Readonly<Record<string, unknown>>,
  hass?: HomeAssistant,
): HaFormSchemaItem[] => pickFields(schema, (item) => item.when?.(data, hass) ?? true).map(bare);

/**
 * A card's list as its editor's `when` reads it: under its key, else its alias; none where the config holds no list
 * there (that slip is the card's to say, never the editor's to throw on).
 */
export const listed = (
  data: Readonly<Record<string, unknown>>,
  key: string,
  alias?: string,
): readonly unknown[] => {
  const list = data[key] ?? (alias ? data[alias] : undefined);
  return Array.isArray(list) ? list : [];
};

/** Whether a card's list names a light: what the lights' colours act on (`lightColourFields`). */
export const holdsLight =
  (key: string, alias?: string) =>
  (data: Readonly<Record<string, unknown>>): boolean =>
    idsOf(listed(data, key, alias)).some((id) => id.startsWith('light.'));

/** A field (or a row) shown only while `when` says it can act: one that acts only in a style is shown in that style. */
export const onlyWhen = (
  when: NonNullable<HaFormSchemaItem['when']>,
  item: HaFormSchemaItem,
): HaFormSchemaItem => ({ ...item, when });

/** A card's tone, from the palette's tones. */
export const toneField = (): HaFormSchemaItem => ({ name: 'tone', selector: toneSelector() });

/**
 * What an item's colour (or a part's) is while none is chosen: its bulb's where the card shows bulbs' colours, else
 * the card's (`bulb`: an item of a card of lights, tiles or rows); the card's alone (`card`: a scene, a chip, a person,
 * a row of a lock, a camera or an alarm, the history bars' bar below zero or in progress); or the one the card gives it
 * (`own`: an appliance's kind's, a source's, an alert's severity's, a figure's or a reading's neutral).
 */
export type ItemColour = 'bulb' | 'card' | 'own';

const ITEM_HELPER: Record<ItemColour, MessageKey> = {
  bulb: 'editor.item_color_helper',
  card: 'editor.item_color_card_helper',
  own: 'editor.item_color_own_helper',
};

/**
 * A card's or an item's own colour: Home Assistant's colour picker — its named swatches, shown in the palette's
 * colours where the look reaches the editor, or any colour typed — with the palette's accent as its default. A colour
 * that may be none (`card_color`) is none until one is chosen: the picker then says what the card draws, and offers
 * to clear it. One that follows its entity (`state`: a light card's, its bulb's) says so as Home Assistant's own
 * tile does, State by default. An item's (`item`) has no default of its own — the picker would call it "Primary",
 * whatever it wears — and shows none chosen, its helper saying what it wears then (`ItemColour`).
 */
export const accentField = (
  name = 'color',
  {
    none = false,
    state = false,
    item,
  }: { none?: boolean; state?: boolean; item?: ItemColour } = {},
): HaFormSchemaItem => {
  const helper = item && ITEM_HELPER[item];
  return {
    name,
    selector: {
      ui_color: {
        ...(helper ? {} : { default_color: none ? 'none' : state ? 'state' : 'primary' }),
        include_none: none,
        include_state: state,
      },
    },
    ...(helper ? { helper } : {}),
  };
};

/**
 * How opaque the card's surface is (`card_opacity`, 1.15), beside its colour: a percentage on Home Assistant's slider in
 * 5 % steps, its figure in the box beside it — the house's, shown and never written, until one is chosen
 * (`editorDefaults`), the word under it saying so.
 */
export const cardOpacityField = (): HaFormSchemaItem => ({
  name: 'card_opacity',
  selector: { number: { min: 0, max: 100, step: 5, mode: 'slider', unit_of_measurement: '%' } },
  helper: 'editor.card_opacity_helper',
});

/**
 * How the card looks out of reach (`unavailable`, 1.16, #126): dashed, or as when off, its words saying so — the
 * house's, shown and never written, until one is chosen (`editorDefaults`), the word under it saying so. An item's
 * (`item`: a tile of a group) is empty until chosen, its group's then.
 */
export const unavailableField = ({ item = false } = {}): HaFormSchemaItem => ({
  ...selectField('unavailable', UNAVAILABLE_LOOKS),
  helper: item ? 'editor.item_unavailable_helper' : 'editor.unavailable_helper',
});

/** A style's word among the options: the fill's is a tile's ("Fill"), where `fill` alone is a view's. */
const STYLE_WORDS: Readonly<Record<SliderStyle, OptionWord>> = {
  ruler: 'ruler',
  bar: 'bar',
  liquid: 'liquid',
  fill: 'tile_fill',
};

/** The style a card's config asks of its sliders: its own, else the house's it keeps to (`house`, or nothing). */
export const askedSliderStyle = (data: Readonly<Record<string, unknown>>): unknown => {
  const own = data['slider_style'];
  return own === undefined || own === 'house' ? sliderDefaults().style : own;
};

/** Whether the style asked says words under it: a bar's or a liquid's. */
const saysWords = (data: Readonly<Record<string, unknown>>): boolean => {
  const style = askedSliderStyle(data);
  return style === 'bar' || style === 'liquid';
};

/**
 * The style a card's sliders are drawn in (`slider_style`, 1.18, #144) and the words under them (`slider_words`),
 * on one row: the house's, named with the style it draws ("House (Ruler)"), the ruler, a bar, a liquid and, where the
 * card draws a tile (`tile`: always, or asked of the config), the tile's fill — the whole tile being the slider;
 * elsewhere a card asked for the fill draws the ruler, so the editor never offers it; the words — the ends and the
 * middle, or none — while the style asked is a bar or a liquid. The house's, shown and never written, until one is
 * chosen (`editorDefaults`), the word under the style saying so.
 */
export const sliderFields = (
  tile: boolean | NonNullable<HaFormSchemaItem['when']> = false,
): HaFormSchemaItem[] => {
  const row = (fill: boolean): HaFormSchemaItem =>
    fieldRow(
      {
        name: 'slider_style',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              {
                value: 'house',
                label: localize(editorLanguage(), 'option.house_style', {
                  style: editorWord(`option.${STYLE_WORDS[sliderDefaults().style]}`),
                }),
              },
              ...optionChoices(
                SLIDER_STYLES.filter((style) => fill || style !== 'fill'),
                STYLE_WORDS,
              ),
            ],
          },
        },
        helper: 'editor.slider_style_helper',
      },
      onlyWhen(saysWords, selectField('slider_words', SLIDER_WORDS)),
    );
  return typeof tile === 'function'
    ? [onlyWhen(tile, row(true)), onlyWhen((data, hass) => !tile(data, hass), row(false))]
    : [row(tile)];
};

/**
 * A tone and a colour on one row, then the card's own surface: its colour (`card_color`, none by default), its opacity
 * and how it looks out of reach (`unavailable: false`: a card that shows no entity has nothing out of reach).
 */
export const colourFields = ({ state = false, unavailable = true } = {}): HaFormSchemaItem[] => [
  fieldRow(toneField(), accentField('color', { state })),
  accentField('card_color', { none: true }),
  cardOpacityField(),
  ...(unavailable ? [unavailableField()] : []),
];

/**
 * When an item's colour shows on its surface: while it is on (the default), or always (a quiet wash at rest); a light
 * card's may be off as well — "Never" beside "Show its colour", not "Off" (a light's own off is another thing).
 */
export const tintField = (options: readonly OptionWord[] = ['on', 'always']): HaFormSchemaItem =>
  selectField('tint', options, { words: { off: 'never' } });

/**
 * A lit light in its bulb's colour (`light_colors`), and beside it how a white shows then (`light_whites`: by its
 * temperature, or as the palette's light) — a choice only while the bulbs show their colours.
 */
export const lightColourFields = (): HaFormSchemaItem =>
  fieldRow(
    boolField('light_colors'),
    onlyWhen(
      ({ light_colors }) => light_colors === true,
      selectField('light_whites', ['palette', 'temperature']),
    ),
  );

/** What a device card shows while the device is off: everything (the default), or the essentials alone. */
export const whenOffField = (): HaFormSchemaItem => selectField('when_off', ['all', 'essentials']);

/** A small tile's name in one line (the default) or two where one would cut it (`name_lines`, #100). */
export const nameLinesField = (): HaFormSchemaItem => selectField('name_lines', ['1', '2']);

/** A card's head: its title and its subtitle, on one row. */
export const titleFields = (): HaFormSchemaItem =>
  fieldRow(textField('title'), textField('subtitle'));

/** A card's icon and its tone, on one row. */
export const iconToneFields = (): HaFormSchemaItem => fieldRow(iconField(), toneField());

/**
 * A name, a card's or an item's in a list, as Home Assistant's own editors write one (#125): words of the person's own,
 * or the parts read with the entity beside it (its own name, its device's, its area's, its floor's: `entityName`).
 */
export const nameField = (): HaFormSchemaItem => ({
  name: 'name',
  selector: { entity_name: {} },
  context: { entity: 'entity' },
});

/** A name and an icon, on one row (a card's, or an item's in a list): the entity's parts where one is beside them. */
export const nameIconFields = (): HaFormSchemaItem => fieldRow(nameField(), iconField());

/** Whether a card's head shows its circle: automatic (it gives way to a long name), always or never. */
export const showIconField = (): HaFormSchemaItem =>
  selectField('show_icon', ['auto', 'always', 'never']);

/** What a card of a list says while the list has nothing to show, and whether it hides then (`EmptyList`). */
export const emptyFields = (): HaFormSchemaItem =>
  fieldRow(textField('empty_text'), boolField('hide_empty'));

/** A list of entities in one picker (the visual editor's form; `listsEditor` gives each its own). */
export const entitiesField = (
  name: string,
  domains?: readonly string[],
  required = false,
): HaFormSchemaItem => ({
  name,
  ...(required ? { required } : {}),
  selector: { entity: { multiple: true, ...(domains ? { domain: [...domains] } : {}) } },
});

/** The fields a row of any list may carry (`RowConfig`, `lock/rows.ts`), as its editor shows them. */
const ROW_KEYS = [
  'entity',
  'name',
  'icon',
  'secondary',
  'since',
  'options',
  'labels',
  'tap_action',
  'tone',
  'color',
] as const;

/**
 * A row's form: the entity, its name and icon, what it says, a select's (`select`: what its dropdown offers, its
 * words), its colours, its tap. Its colour has none chosen by default: a light wears its bulb's on a card that shows
 * them (`bulb`), the row the card's otherwise.
 */
const rowSchema = (bulb: boolean, select: readonly HaFormSchemaItem[] = []): HaFormSchemaItem[] => [
  entityField(),
  nameIconFields(),
  selectField('secondary', ['area', 'last-changed', 'state', 'none'], { custom: true }),
  sinceField(),
  ...select,
  fieldRow(toneField(), accentField('color', { item: bulb ? 'bulb' : 'card' })),
  actionField(),
];

/**
 * A list of rows as its editor shows each: the keys a row may carry and its form, a select's with the options its
 * dropdown offers (of those it lists, in Home Assistant's words) and its words for them (#96) — its words alone where
 * the row names a tap of its own, which opens no dropdown.
 */
export function rowItems(
  bulb = false,
): Pick<RowsListSpec, 'keys' | 'schema' | 'schemaOf' | 'choices'> {
  const [options, labels] = selectRowFields();
  const plain = rowSchema(bulb);
  const select = rowSchema(bulb, [options, labels]);
  const worded = rowSchema(bulb, [labels]);
  return {
    keys: ROW_KEYS,
    schema: select,
    schemaOf: (item) => (!isSelectRow(item) ? plain : item['tap_action'] ? worded : select),
    choices: selectRowChoices,
  };
}

/** The choices of a unit select: the automatic one, then each unit by its symbol. */
export const unitChoices = (units: readonly string[]): SelectOption[] => [
  { value: 'auto', label: editorWord('option.auto') },
  ...units.map((value) => ({ value, label: value })),
];

/** Every unit a card's figures may be asked in: the ladders of power, energy, volume and distance. */
const EVERY_LADDER: readonly string[] = Object.values(LADDERS).flat();
const DECIMALS: readonly OptionWord[] = ['auto', '0', '1', '2', '3'];

/**
 * The unit a card's figures read in and their decimals, on one row — the last before the actions. `unit` offers the
 * ladders given (every one by default, narrowed to the entity's class at render where the card says so, through
 * `unitChoicesOf`), or a unit typed; `decimals` is fixed, or automatic (the sensor's own precision, else the figure's
 * size). Neither default is written (`NUMBER_DEFAULTS`). `when` says while the unit can act: an entity whose unit
 * has no ladder gives it nothing to do (`hasLadder`).
 */
export const numberFields = ({
  units = EVERY_LADDER,
  when,
  decimals = DECIMALS,
}: {
  units?: readonly string[];
  when?: HaFormSchemaItem['when'];
  decimals?: readonly OptionWord[];
} = {}): HaFormSchemaItem => {
  const unit: HaFormSchemaItem = {
    name: 'unit',
    selector: {
      select: { mode: 'dropdown', custom_value: true, options: unitChoices(units) },
    },
  };
  return fieldRow(when ? onlyWhen(when, unit) : unit, selectField('decimals', decimals));
};

/** What the row shows where the config says nothing: automatic, both. */
export const NUMBER_DEFAULTS = { unit: 'auto', decimals: 'auto' } as const;

/** The unit of the card's entity as the editor's `when` and `choices` read it: none where the house does not hold it. */
const unitOf = (
  data: Readonly<Record<string, unknown>>,
  hass?: HomeAssistant,
): string | undefined => {
  const id = data['entity'];
  return typeof id === 'string' && hass?.states[id] ? resolveEntity(hass, id).unit : undefined;
};

/** Whether the card's entity's figures can be asked in another unit: its unit converts (one not there: shown). */
export const hasLadder = (
  data: Readonly<Record<string, unknown>>,
  hass?: HomeAssistant,
): boolean => {
  const unit = unitOf(data, hass);
  return unit === undefined || unitClass(unit) !== undefined;
};

/** The units the editor offers a card's entity: its class's ladder (a class without one: typed), as its `choices`. */
export const unitChoicesOf: EditorChoices = (config, hass) => {
  const unit = unitOf(config, hass);
  return unit !== undefined && unitClass(unit) ? { unit: unitChoices(ladderOf(unit)) } : {};
};
