// @vitest-environment happy-dom
import type { HaFormSchemaItem, HomeAssistant } from '@fluvy/core';
import { describe, expect, it, vi } from 'vitest';
import {
  accentField,
  boolField,
  byName,
  colourFields,
  editorLabels,
  fieldRow,
  formLabels,
  onlyWhen,
  pickFields,
  sectionField,
  selectField,
  textField,
  toneField,
  visibleFields,
} from './form.js';

const label = (form: ReturnType<typeof formLabels>, name: string): string | undefined =>
  form.computeLabel?.({ name } as HaFormSchemaItem, (key) => key);

describe('editor labels', () => {
  it('name the shared fields without a card listing them', () => {
    document.documentElement.lang = 'en';
    expect(label(formLabels(), 'title')).toBe('Title');
    expect(label(formLabels(), 'entities')).toBe('Entities');
    expect(label(formLabels(), 'mystery')).toBeUndefined();
  });
  it('let a card give a shared field another word, and its own fields its own', () => {
    document.documentElement.lang = 'en';
    expect(label(formLabels({ title: 'editor.tabs' }), 'title')).toBe('Tabs');
    const own = editorLabels((_hass, key: 'mine') => `own:${key}`, { field: 'mine' });
    expect(label(own, 'field')).toBe('own:mine');
    expect(label(own, 'icon')).toBe('Icon');
  });
});

describe('the choices of a select', () => {
  const labels = (item: HaFormSchemaItem): string[] =>
    ((item.selector as { select: { options: { label: string }[] } }).select.options ?? []).map(
      (option) => option.label,
    );
  it('are said in the editor’s language, from the catalogue', () => {
    document.documentElement.lang = 'es';
    expect(labels(selectField('variant', ['full', 'compact']))).toEqual(['Completa', 'Compacta']);
    expect(labels(toneField())).toContain('Ventilador');
    document.documentElement.lang = 'en';
    expect(labels(selectField('forecast', ['both', 'none']))).toEqual(['Daily and hourly', 'None']);
    expect(labels(toneField())[0]).toBe('Accent');
  });
});

describe('a select that takes a value of its own', () => {
  const select = (item: HaFormSchemaItem): Record<string, unknown> =>
    (item.selector as { select: Record<string, unknown> }).select;
  it('offers it only when asked (a keyword, an attribute or a template in the second line)', () => {
    expect(select(selectField('variant', ['full', 'compact']))['custom_value']).toBeUndefined();
    expect(
      select(selectField('secondary', ['area', 'none'], { custom: true }))['custom_value'],
    ).toBe(true);
  });
});

describe('a colour field', () => {
  const picker = (item: HaFormSchemaItem): Record<string, unknown> =>
    (item.selector as { ui_color: Record<string, unknown> }).ui_color;
  it('says the palette’s accent for a card’s colour, none for a surface until one is chosen (#40)', () => {
    expect(picker(accentField())).toMatchObject({ default_color: 'primary', include_none: false });
    const surface = colourFields()[1]!;
    expect(surface.name).toBe('card_color');
    expect(picker(surface)).toMatchObject({ default_color: 'none', include_none: true });
  });
  it('offers the card’s opacity beside its surface colour, a percentage on the slider in 5 % steps (1.15)', () => {
    const [, surface, opacity] = colourFields();
    expect(surface!.name).toBe('card_color');
    expect(opacity).toMatchObject({
      name: 'card_opacity',
      helper: 'editor.card_opacity_helper',
      selector: {
        number: { min: 0, max: 100, step: 5, mode: 'slider', unit_of_measurement: '%' },
      },
    });
    document.documentElement.lang = 'en';
    expect(label(formLabels(), 'card_opacity')).toBe('Card opacity');
  });

  it('offers how the card looks out of reach after its opacity, dashed or as when off, the house’s until chosen (#126)', () => {
    const [, , , look] = colourFields();
    expect(look).toMatchObject({
      name: 'unavailable',
      helper: 'editor.unavailable_helper',
      selector: { select: { mode: 'dropdown' } },
    });
    document.documentElement.lang = 'en';
    expect(
      (look!.selector as { select: { options: { value: string; label: string }[] } }).select
        .options,
    ).toEqual([
      { value: 'dashed', label: 'Dashed' },
      { value: 'quiet', label: 'As when off' },
    ]);
    expect(label(formLabels(), 'unavailable')).toBe('When unavailable');
    // a card that shows no entity has nothing out of reach
    expect(colourFields({ unavailable: false }).map((field) => field.name)).not.toContain(
      'unavailable',
    );
  });

  it('shows none chosen for an item’s colour, and says under it what the item wears then', () => {
    // the picker would call the card's colour "Primary": no default of its own, the word under the field instead
    const bulb = accentField('color', { item: 'bulb' });
    expect(picker(bulb)['default_color']).toBeUndefined();
    expect(bulb.helper).toBe('editor.item_color_helper');
    const card = accentField('color', { item: 'card' });
    expect(picker(card)['default_color']).toBeUndefined();
    expect(card.helper).toBe('editor.item_color_card_helper');
    const own = accentField('color', { item: 'own' });
    expect(picker(own)['default_color']).toBeUndefined();
    expect(own.helper).toBe('editor.item_color_own_helper');
    expect(accentField().helper).toBeUndefined();
  });
});

describe('a form that shows only what can act', () => {
  const full = ({ variant }: Readonly<Record<string, unknown>>): boolean => variant !== 'compact';
  const schema: HaFormSchemaItem[] = [
    selectField('variant', ['full', 'compact']),
    fieldRow(textField('title'), onlyWhen(full, textField('subtitle'))),
    onlyWhen(full, fieldRow(boolField('show_rows'), boolField('show_icon'))),
    boolField('live_update'),
  ];
  /** A form as names, a row as the list of its own. */
  const shape = (form: readonly HaFormSchemaItem[]): unknown[] =>
    form.map((item) => (item.schema ? shape(item.schema) : item.name));
  /** Whether anything in a form is a function. */
  const callable = (form: readonly HaFormSchemaItem[]): boolean =>
    form.some(
      (item) =>
        Object.values(item).some((value) => typeof value === 'function') ||
        callable(item.schema ?? []),
    );

  it('keeps every field and row while each can act', () => {
    expect(shape(visibleFields(schema, { variant: 'full' }))).toEqual([
      'variant',
      ['title', 'subtitle'],
      ['show_rows', 'show_icon'],
      'live_update',
    ]);
  });

  it('drops a field or a whole row that cannot, and a row that loses one field keeps the other on its own line', () => {
    expect(shape(visibleFields(schema, { variant: 'compact' }))).toEqual([
      'variant',
      'title',
      'live_update',
    ]);
  });

  it('keeps a section’s title over the fields it has left, and drops a section left with none', () => {
    const sections: HaFormSchemaItem[] = [
      selectField('variant', ['full', 'compact']),
      sectionField('appliance.section_show', [
        boolField('show_hero'),
        onlyWhen(full, boolField('show_rows')),
      ]),
      sectionField('appliance.section_plug', [onlyWhen(full, boolField('show_icon'))]),
    ];
    // a section losing one of its fields keeps the other under its title: never spilled into the form around it
    expect(shape(visibleFields(sections, { variant: 'compact' }))).toEqual([
      'variant',
      ['show_hero'],
    ]);
    expect(visibleFields(sections, { variant: 'compact' })[1]).toMatchObject({
      type: 'expandable',
      title: 'What it shows',
    });
    expect(shape(visibleFields(sections, { variant: 'full' }))).toEqual([
      'variant',
      ['show_hero', 'show_rows'],
      ['show_icon'],
    ]);
    // a row in it that loses a field leaves its other alone, even where the section counts as many items as before
    const row: HaFormSchemaItem[] = [
      sectionField('appliance.section_show', [
        fieldRow(boolField('show_hero'), onlyWhen(full, boolField('show_rows'))),
        boolField('show_icon'),
      ]),
    ];
    expect(shape(visibleFields(row, { variant: 'compact' }))).toEqual([['show_hero', 'show_icon']]);
  });

  it('hands Home Assistant’s form no function: every `when` stays behind', () => {
    expect(callable(schema)).toBe(true);
    expect(callable(visibleFields(schema, { variant: 'full' }))).toBe(false);
    expect(callable(visibleFields(schema, { variant: 'compact' }))).toBe(false);
    // the fields themselves are the card's, whole
    expect(visibleFields(schema, {})[0]).toBe(schema[0]);
    expect(visibleFields(schema, {})[1]?.schema?.[1]).toEqual(textField('subtitle'));
  });

  it('asks with what the form holds and the house', () => {
    const when = vi.fn(() => true);
    const hass = { language: 'en' } as HomeAssistant;
    const data = { variant: 'full' };
    visibleFields([onlyWhen(when, textField('title'))], data, hass);
    expect(when).toHaveBeenCalledWith(data, hass);
  });

  it('picks by any test of the item, a row and a field alike; by name, every row is opened', () => {
    const title = { name: 'title', selector: { text: {} } };
    const rows: HaFormSchemaItem[] = [fieldRow(title, textField('subtitle')), textField('icon')];
    expect(shape(pickFields(rows, (item) => !item.schema))).toEqual(['icon']);
    expect(
      shape(
        pickFields(
          rows,
          byName((name) => name !== 'subtitle'),
        ),
      ),
    ).toEqual(['title', 'icon']);
    expect(
      pickFields(
        rows,
        byName((name) => name !== 'subtitle'),
      )[0],
    ).toBe(title);
    expect(
      pickFields(
        rows,
        byName(() => true),
      )[0],
    ).toBe(rows[0]);
  });
});

describe('fieldRow', () => {
  const text = { name: 'a', selector: { text: {} } };
  const entity = { name: 'b', selector: { entity: {} } };
  const statistic = { name: 'c', selector: { statistic: {} } };

  it('stacks a picker whose label stands above its box beside a field whose label is inside its own (#150)', () => {
    expect(fieldRow(entity, text).column_min_width).toBe('100%');
    expect(fieldRow(text, statistic).column_min_width).toBe('100%');
  });

  it('keeps side by side the fields whose boxes line up', () => {
    expect(fieldRow(text, text)).not.toHaveProperty('column_min_width');
    expect(fieldRow(entity, statistic)).not.toHaveProperty('column_min_width');
  });
});
