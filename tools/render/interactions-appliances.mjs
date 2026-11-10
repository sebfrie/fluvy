#!/usr/bin/env node
/**
 * The appliance cards, 1.9 (issue #47), on the playground's `appliances` sheet (real cards, simulated hass). Exit code
 * 1 on any failure.
 *   PLAYGROUND=http://127.0.0.1:5183/ node interactions-appliances.mjs
 * What it proves: a cycle's progress says where it is to a reader, its steps where asked; a compartment's stepper (one
 * choice away) shows each tap at once and sends one call once the taps settle (ten taps, one call — an appliance's
 * cloud counts them), held until Home Assistant answers; a quick mode switches its switch; pause presses the
 * appliance's own button, stop asks first in Home Assistant's dialog; a start the appliance does not allow from afar is
 * disabled and says why; LocalThings' Pause and Stop are the card's (#97), its resume disabled while its Smart Control
 * is off; a row, a zone and a compartment open their entity, a reminder's hold resets it after asking
 * where its integration lets a card; the power round switches a small appliance on its plug and asks first before
 * switching off one that runs, and a fridge on a plug — in operation, never done, no bell — whatever its compressor
 * does; a drink starts where the integration lets a card; the pictures land in their own chunk;
 * "Unloaded" is remembered for that finish, past a reload; the time left ticks on the page's clock and a door opened
 * now is said after a minute; the row gives way in its order and never cuts its state; the list of the house's
 * appliances follows what each does; an appliance out of reach keeps its card's height and its parts (the hob's zones,
 * the drinks, the compartments, a small appliance's row); the reporter's design keeps a dashboard's row of appliances
 * level (#47); the automatic dashboard lays them out as the reporter drew them — four whole cards across a desktop's
 * band, five small rows, as many as hold on a narrower screen; "Tell me when it's done" writes its automation, turns it
 * off and on, and a hold then a tap removes it; and the 3D printer's ring row is the card's button, its round its own.
 */
import { apiCalls, calls, frame, moreInfo, reset, settle, startSuite, taps } from './lib/suite.mjs';

const suite = await startSuite();
const { check } = suite;

const card = (page, title, n = 0) =>
  frame(page, title).locator('fluvy-appliance-card, fluvy-appliances-card').nth(n);

/** What a card says: its head, its hero, what asks for attention (its head's words, its line, a row), its rows. */
const read = (c) =>
  c.evaluate((el) => {
    const root = el.shadowRoot;
    const t = (node) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const warned = root.querySelector(
      '.ap-head__sub.is-warning, .ap-line.is-warning, .ap-item.is-warning',
    );
    return {
      head: t(root.querySelector('.fv-card__head')),
      figures: t(root.querySelector('.ap-figures')),
      line: t(warned ?? root.querySelector('.ap-line, .ap-head__sub')),
      warning: Boolean(warned),
      progress: root.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow') ?? null,
      current: root.querySelector('[aria-current="step"]') ? true : false,
      unloaded:
        root.querySelector('.fv-card__head .fv-round')?.getAttribute('aria-label') === 'Unloaded',
      items: [...root.querySelectorAll('.ap-item')].map(t),
      rows: [...root.querySelectorAll('.al-rows .fv-row--bar .fv-row__title')].map(t),
      height: Math.round(root.querySelector('article')?.getBoundingClientRect().height ?? 0),
    };
  });

const page = await suite.sheet('appliances');
await page.evaluate(() => {
  window.__handed = [];
  document.body.addEventListener('hass-action', (event) => window.__handed.push(event.detail));
});
const handed = () => page.evaluate(() => window.__handed.slice());

/* ---------- a cycle, said to a reader ---------- */
const washer = await read(card(page, 'LG · washer spinning'));
check(
  'a cycle: the time left of its whole, its progress as a progress bar’s value',
  washer.progress !== null &&
    Number(washer.progress) > 0 &&
    /^Remaining 0:42 h of \d+:\d\d h$/.test(washer.figures),
  JSON.stringify(washer),
);

/* ---------- a compartment's stepper: ten taps, one call ---------- */
{
  await reset(page);
  const fridge = card(page, 'Whole card · steppers, quick modes, buttons', 0);
  const plus = fridge.locator('.ap-zone .fv-stepper__half').nth(1);
  await taps(plus, 10);
  const shown = await fridge.evaluate((el) =>
    el.shadowRoot.querySelector('.ap-zone .fv-readout__value')?.textContent.replace(/\s+/g, ''),
  );
  await settle(page, 900);
  // one call in all, of the last tap's value: a call sent before the taps settled would be a second one (read by count,
  // not by the clock, which a loaded runner stretches past the settle between the last tap and a read)
  const after = await calls(page);
  check(
    'a compartment’s stepper shows each tap at once and sends one call once the taps settle: ten taps, one call',
    shown === '7°C' &&
      after.length === 1 &&
      after[0].s === 'number.set_value' &&
      after[0].d.entity_id === 'number.kuhlschrank_fridge_temperatur' &&
      after[0].d.value === 7,
    JSON.stringify({ shown, after }),
  );
  // held until Home Assistant answers: the mock writes the state a beat later, and it reads 7 all along
  await settle(page, 300);
  const held = await fridge.evaluate((el) =>
    el.shadowRoot.querySelector('.ap-zone .fv-readout__value')?.textContent.replace(/\s+/g, ''),
  );
  check('the stepped setpoint is held until Home Assistant reports it', held === '7°C', held);
}

/* ---------- a quick mode, pause, stop ---------- */
{
  await reset(page);
  const fridge = card(page, 'Whole card · steppers, quick modes, buttons', 1);
  await fridge.locator('.ap-modes .fv-chip', { hasText: 'Super freeze' }).click();
  await settle(page, 200);
  const done = await calls(page);
  check(
    'a quick mode switches its own switch',
    done.length === 1 &&
      done[0].s === 'switch.turn_on' &&
      /freezer|gefrier/i.test(done[0].d.entity_id),
    JSON.stringify(done),
  );
  await reset(page);
  const dish = card(page, 'Whole card · steppers, quick modes, buttons', 2);
  await dish.locator('.ap-actions [data-action="pause"]').click();
  await settle(page, 200);
  const paused = await calls(page);
  check(
    'the primary pauses a running dishwasher by its own button',
    paused.length === 1 &&
      paused[0].s === 'button.press' &&
      /pausieren|pause/i.test(paused[0].d.entity_id),
    JSON.stringify(paused),
  );
  await reset(page);
  await dish.locator('.ap-actions [data-action="stop"]').click();
  await settle(page, 200);
  const stopped = await calls(page);
  const asked = await handed();
  check(
    'stop asks first, in Home Assistant’s own dialog: nothing is called before it',
    stopped.length === 0 &&
      asked.some(
        (detail) =>
          detail.config?.tap_action?.perform_action === 'button.press' &&
          detail.config?.tap_action?.confirmation?.text === 'Stop the programme?',
      ),
    JSON.stringify({ stopped, asked }),
  );
}

/* ---------- a start the appliance does not allow from afar ---------- */
{
  const remote = await card(page, 'Whole card · steppers, quick modes, buttons', 3).evaluate(
    (el) => {
      const start = el.shadowRoot.querySelector('.ap-actions [data-action="start"]');
      return { disabled: start?.disabled ?? null, title: start?.getAttribute('title') ?? '' };
    },
  );
  check(
    'a start the appliance does not allow from afar is disabled, and says why',
    remote.disabled === true && /Remote start is off on the appliance/.test(remote.title),
    JSON.stringify(remote),
  );
}

/* ---------- LocalThings' own buttons, pressed by the card's (#97) ---------- */
{
  await reset(page);
  const washer = card(page, 'LocalThings · washer rinsing, its buttons');
  await washer.locator('.ap-actions [data-action="pause"]').click();
  await settle(page, 200);
  const paused = await calls(page);
  check(
    'LocalThings: the primary pauses a rinsing washer by its own Pause button',
    paused.length === 1 &&
      paused[0].s === 'button.press' &&
      paused[0].d.entity_id === 'button.waschmaschine_flur_pause',
    JSON.stringify(paused),
  );
  await reset(page);
  await washer.locator('.ap-actions [data-action="stop"]').click();
  await settle(page, 200);
  const stopped = await calls(page);
  const asked = await handed();
  check(
    'LocalThings: its Stop asks first, in Home Assistant’s own dialog',
    stopped.length === 0 &&
      asked.some(
        (detail) =>
          detail.config?.tap_action?.perform_action === 'button.press' &&
          detail.config?.tap_action?.target?.entity_id === 'button.waschmaschine_flur_stopp',
      ),
    JSON.stringify({ stopped, asked: asked.slice(-1) }),
  );
  const cells = await card(page, 'LocalThings · washer paused, its Smart Control off').evaluate(
    (el) => {
      const cell = (action) => el.shadowRoot.querySelector(`.ap-actions [data-action="${action}"]`);
      return {
        resume: cell('start')?.disabled ?? null,
        title: cell('start')?.getAttribute('title') ?? '',
        stop: cell('stop')?.disabled ?? null,
      };
    },
  );
  check(
    'LocalThings: with its Smart Control off, its resume is disabled and says why, its stop is not',
    cells.resume === true && /Remote start is off/.test(cells.title) && cells.stop === false,
    JSON.stringify(cells),
  );
}

/* ---------- taps that open, a hold that resets ---------- */
{
  await reset(page);
  await card(page, 'Miele · washer rinsing').locator('.ap-item').first().click();
  await card(page, 'Reminders · as rows', 0).locator('.ap-item').first().click();
  await card(page, 'Miele · hob, two plates on').locator('.ap-plate').first().click();
  await card(page, 'Miele · fridge freezer, super cooling').locator('.ap-tile').first().click();
  await settle(page, 150);
  const opened = await moreInfo(page);
  check(
    'a row, a reminder’s row, a zone and a compartment open their entity',
    opened.length === 4 && opened.every(Boolean),
    JSON.stringify(opened),
  );
  await page.evaluate(() => (window.__handed.length = 0));
  const filter = card(page, 'SmartThings · fridge, its filter to reset')
    .locator('.ap-item', { hasText: /water filter/i })
    .first();
  await filter.evaluate((el) => el.fvHold?.());
  await settle(page, 100);
  const reset_ = await handed();
  check(
    'a reminder’s hold resets it, after asking, where its integration lets a card',
    reset_.some(
      (detail) =>
        detail.config?.tap_action?.perform_action === 'button.press' &&
        /zurucksetzen/.test(detail.config?.tap_action?.target?.entity_id ?? '') &&
        Boolean(detail.config?.tap_action?.confirmation),
    ),
    JSON.stringify(reset_),
  );
}

/* ---------- "Unloaded", remembered ---------- */
{
  const dryer = card(page, 'LG · dryer done, switched off');
  const before = await read(dryer);
  await dryer.locator('.fv-card__head .fv-round').click();
  await settle(page, 150);
  const after = await read(dryer);
  await page.reload();
  await page.waitForSelector('html[data-ready="1"]');
  await settle(page, 900);
  const again = await read(card(page, 'LG · dryer done, switched off'));
  check(
    '“Unloaded” takes the reminder and its round away, for that finish, past a reload',
    before.unloaded && before.warning && !after.unloaded && !after.warning && !again.unloaded,
    JSON.stringify({ before, after, again }),
  );
  await page.evaluate(() => window.localStorage.removeItem('fluvy-unloaded'));
}

/* ---------- the power round, a drink, the pictures ---------- */
{
  await reset(page);
  // the page was reloaded: Home Assistant's dialog is listened to again
  await page.evaluate(() => {
    window.__handed = [];
    document.body.addEventListener('hass-action', (event) => window.__handed.push(event.detail));
  });
  // a dishwasher at work: switching it off asks first, in Home Assistant's dialog
  await card(page, 'Home Connect · dishwasher, salt out')
    .locator('.fv-card__head .ap-power')
    .click();
  // a small appliance on its plug, at rest: the round switches it on
  await card(page, 'Small appliances · rows', 1).locator('.ap-power').click();
  await settle(page, 200);
  const switched = await calls(page);
  const asked = await handed();
  check(
    'the power round switches a small appliance on its plug, and asks first before switching off one at work',
    switched.length === 1 &&
      switched[0].s === 'switch.turn_on' &&
      switched[0].d.entity_id === 'switch.standmixer' &&
      asked.some(
        (detail) =>
          detail.config?.tap_action?.perform_action === 'switch.turn_off' &&
          Boolean(detail.config?.tap_action?.confirmation),
      ),
    JSON.stringify({ switched, asked }),
  );
  await reset(page);
  const coffee = card(page, 'Whole card · its own rows, picture and drinks', 1);
  const drinks = await coffee.evaluate((el) =>
    [...el.shadowRoot.querySelectorAll('.ap-drinks__cells .ap-drink')].map((d) =>
      d.getAttribute('aria-label'),
    ),
  );
  await coffee.locator('.ap-drinks__cells .ap-drink').first().click();
  await settle(page, 200);
  const poured = await calls(page);
  const drawn = await card(page, 'Home Connect · oven preheating').evaluate((el) =>
    Boolean(el.shadowRoot.querySelector('.ap-pic svg path')),
  );
  check(
    'a coffee machine offers the drinks its card names, in its order, and a tap starts one; the pictures have landed',
    drinks.join() === 'Coffee,Espresso' &&
      poured.length === 1 &&
      poured[0].s === 'select.select_option' &&
      /coffee$/.test(String(poured[0].d.option)) &&
      drawn,
    JSON.stringify({ drinks, poured, drawn }),
  );
}

/* ---------- a fridge on a plug: in operation, never done; switching it off asks first (#47) ---------- */
{
  await reset(page);
  await page.evaluate(() => (window.__handed.length = 0));
  const fridges = [];
  for (const title of [
    'A fridge on a plug · its compressor resting',
    'A fridge on a plug · its compressor running',
  ])
    for (const n of [0, 1]) {
      const fridge = card(page, title, n);
      const said = await fridge.evaluate((el) => ({
        head: (el.shadowRoot.querySelector('.fv-card__head, .fv-row__text')?.textContent ?? '')
          .replace(/\s+/g, ' ')
          .trim(),
        bell: Boolean(el.shadowRoot.querySelector('.ap-notice')),
        tint: el.shadowRoot.querySelector('.ap-power')?.className ?? '',
      }));
      await fridge.locator('.ap-power').click();
      await settle(page, 150);
      fridges.push({ title, n, ...said });
    }
  const switched = await calls(page);
  const asked = (await handed()).filter(
    (detail) =>
      detail.config?.tap_action?.perform_action === 'switch.turn_off' &&
      detail.config?.tap_action?.target?.entity_id === 'switch.kuhlschrank_keller' &&
      detail.config?.tap_action?.confirmation?.text === 'Switch it off? It stops cooling.',
  );
  check(
    'a fridge on a plug is in operation, its compressor resting or running — never done, no bell — and switching it off always asks first',
    fridges.length === 4 &&
      fridges.every(
        (fridge) =>
          /In operation/.test(fridge.head) &&
          !/Running|Done|Ready/.test(fridge.head) &&
          !fridge.bell &&
          /ap-power--ok/.test(fridge.tint),
      ) &&
      switched.length === 0 &&
      asked.length === 4,
    JSON.stringify({ fridges, switched, asked: asked.length }),
  );
}

/* ---------- out of reach: the same height ---------- */
{
  const live = await card(page, 'Live · its twin out of reach next', 0).evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  const gone = await card(page, 'Out of reach', 0).evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  const liveFridge = await card(page, 'Live · its twin out of reach next', 1).evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  const goneFridge = await card(page, 'Out of reach', 1).evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  check(
    'an appliance out of reach keeps its card’s height (a dishwasher, a fridge compact)',
    Math.abs(live - gone) <= 0.5 && Math.abs(liveFridge - goneFridge) <= 0.5,
    JSON.stringify({ live, gone, liveFridge, goneFridge }),
  );
  // a plug out of reach while its cycle ran: its dial says its state, and neither card what this cycle used
  const plugs = await Promise.all(
    [0, 1].map((n) =>
      card(page, 'Out of reach · a washer on a plug', n).evaluate((el) => {
        const root = el.shadowRoot;
        const said = (root.querySelector('article')?.textContent ?? '').replace(/\s+/g, ' ');
        return { said: said.trim(), dial: root.querySelector('fluvy-dial')?.sub ?? null };
      }),
    ),
  );
  check(
    'a washer on a plug out of reach says no energy for this cycle: its dial its state, its readout a dash',
    plugs[0]?.dial === 'Offline' &&
      plugs.every(({ said }) => !/kWh/.test(said)) &&
      /This cycle —/.test(plugs[1]?.said ?? ''),
    JSON.stringify(plugs),
  );
  // the whole card's parts: the hob's zones, the drinks, the compartments, a small appliance's row
  const anatomy = (title) =>
    frame(page, title)
      .locator('fluvy-appliance-card')
      .evaluateAll((els) =>
        els.map((el) => {
          const root = el.shadowRoot;
          return {
            height: Math.round(el.getBoundingClientRect().height),
            parts: [
              ...root.querySelectorAll(
                '.ap-pic, .ap-power, .ap-plate, .ap-drink, .ap-tile, .ap-item, .ap-progress',
              ),
            ].map((node) => node.className.split(' ')[0]),
          };
        }),
      );
  const before = await anatomy('Live · zones, drinks, compartments, a row');
  const after = await anatomy('Out of reach · zones, drinks, compartments, a row');
  check(
    'out of reach, the hob’s zones, the drinks, the compartments and a small row keep their size and their parts',
    before.length === 4 && JSON.stringify(before) === JSON.stringify(after),
    JSON.stringify({ before, after }),
  );
}

/* ---------- the reporter's design: a row of appliances ends level (#47) ---------- */
{
  const mockup = await suite.sheet('appliances-mockup', { width: 1504, lang: 'de' });
  const heights = await frame(mockup, 'The reporter’s design (#47)')
    .locator('fluvy-appliance-card')
    .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
  const large = heights.slice(0, 8);
  const small = heights.slice(8);
  check(
    'the reporter’s design: eight large appliances of every kind as tall as each other, five small rows as tall',
    large.length === 8 &&
      large.every((h) => h === large[0]) &&
      small.length === 5 &&
      small.every((h) => h === 88),
    JSON.stringify(heights),
  );
  await mockup.close();
}

/* ---------- the automatic dashboard's band: as the reporter drew it (#47) ---------- */
{
  // a window as wide as the reporter's: the band is the view's three columns of 480 and their gaps
  const mockup = await suite.page('sheet=appliances-mockup&width=360&lang=de', {
    viewport: { width: 1600, height: 1000 },
  });
  const band = frame(mockup, 'Home’s appliances · a desktop’s band');
  /** The whole cards of the band, row by row: their widths and heights. */
  const rows = () =>
    band.evaluate((el) => {
      const byRow = {};
      for (const host of el.querySelectorAll('fluvy-appliances-card'))
        for (const card of host.shadowRoot.querySelectorAll('fluvy-appliance-card')) {
          const r = card.getBoundingClientRect();
          (byRow[Math.round(r.y)] ??= []).push([
            Math.round(r.width * 10) / 10,
            Math.round(r.height),
          ]);
        }
      return Object.values(byRow);
    });
  const desktop = await rows();
  const links = await band
    .locator('fluvy-heading-card')
    .evaluateAll((els) =>
      els.map((el) => [el.shadowRoot.querySelector('h2')?.textContent.trim(), el.config.path]),
    );
  /** The band's section titles as drawn: the title's size, whether it is cut, its link's words and its chevron. */
  const titles = () =>
    band.locator('fluvy-heading-card').evaluateAll((els) =>
      els.map((el) => {
        const root = el.shadowRoot;
        const h2 = root.querySelector('h2');
        return [
          getComputedStyle(h2).fontSize,
          h2.scrollWidth > h2.clientWidth + 1 ? 'cut' : 'whole',
          root.querySelector('.hm-section__text')?.textContent ?? '',
          root.querySelector('button.hm-section__meta svg') ? '›' : '',
          Math.round(root.querySelector('.hm-section').getBoundingClientRect().height),
        ];
      }),
    );
  const wide = await titles();
  check(
    'the automatic dashboard’s band: four whole cards across a desktop’s 1488, 360 each and level, five small rows',
    desktop.length === 3 &&
      desktop
        .slice(0, 2)
        .every((row) => row.length === 4 && row.every(([w, h]) => w === 360 && h === 376)) &&
      desktop[2].length === 5 &&
      desktop[2].every(([, h]) => h === 88),
    JSON.stringify(desktop),
  );
  check(
    'each band heads its cards and leads to every appliance',
    JSON.stringify(links) ===
      JSON.stringify([
        ['Großgeräte', '/fluvy-home/appliances'],
        ['Kleingeräte', '/fluvy-home/appliances'],
      ]),
    JSON.stringify(links),
  );
  // a tablet's two columns of the view, then a phone's one: as many as hold, the band filled to its end
  const fill = [];
  for (const width of [976, 380]) {
    await band.evaluate((el, w) => (el.style.width = `${w}px`), width);
    await settle(mockup, 300);
    const narrow = await rows();
    fill.push([width, narrow.map((row) => row.length)]);
    const full = narrow.every((row) =>
      row.every(([w]) => w * row.length + 16 * (row.length - 1) <= width + 0.5),
    );
    if (!full || narrow[0].length !== (width === 976 ? 3 : 1)) fill.push('✗');
  }
  check(
    'on a narrower screen as many as hold: three across a tablet’s band, one on a phone, never past its end',
    !fill.includes('✗'),
    JSON.stringify(fill),
  );
  // a band too narrow for a title and its link: the link's words give way first, then the title's size, and the
  // title stays whole beside its chevron
  await band.evaluate((el) => (el.style.width = '240px'));
  await settle(mockup, 300);
  const narrow = await titles();
  check(
    'the bands’ headings are section titles: 27 with their links across a desktop; where the row is short the link’s words go first, then the title’s size, the title whole beside its chevron',
    JSON.stringify(wide) ===
      JSON.stringify([
        ['27px', 'whole', 'Alle Geräte', '›', 32],
        ['27px', 'whole', 'Alle anzeigen', '›', 32],
      ]) &&
      JSON.stringify(narrow) ===
        JSON.stringify([
          ['27px', 'whole', '', '›', 32],
          ['20px', 'whole', '', '›', 32],
        ]),
    JSON.stringify({ wide, narrow }),
  );
  await mockup.close();
}

/* ---------- "Tell me when it's done" (#47) ---------- */
{
  const p = await suite.sheet('appliances-mockup');
  const cards = frame(p, 'Tell me when it’s done').locator('fluvy-appliance-card');
  const bell = (n) => cards.nth(n).locator('.ap-notice');
  const state = (n) =>
    bell(n).evaluate((el) => ({
      label: el.getAttribute('aria-label'),
      pressed: el.getAttribute('aria-pressed'),
      size: Math.round(el.getBoundingClientRect().width),
    }));
  await reset(p);
  const before = await state(2);
  await bell(2).click();
  await settle(p, 900);
  const written = (await apiCalls(p)).find((call) => call.method === 'POST');
  const after = await state(2);
  check(
    'a tap writes the automation that says the dryer finished, in the person’s words, and the bell is on',
    before.pressed === 'false' &&
      before.size === 44 &&
      written?.path === 'config/automation/config/fluvy_done_mk_dryer' &&
      written?.body?.alias === 'Trockner: tell me when it’s done' &&
      written?.body?.actions?.[0]?.action === 'persistent_notification.create' &&
      after.pressed === 'true',
    JSON.stringify({ before, written, after }),
  );
  await reset(p);
  await bell(0).click();
  await settle(p, 200);
  const toggled = await calls(p);
  const held = bell(0);
  await held.dispatchEvent('pointerdown', { button: 0, pointerType: 'touch' });
  await settle(p, 700);
  await p.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup')));
  const armed = await state(0);
  await bell(0).click();
  await settle(p, 200);
  const removed = (await apiCalls(p)).find((call) => call.method === 'DELETE');
  check(
    'once written, a tap turns it off; a hold readies its removal, which a tap does',
    toggled.length === 1 &&
      toggled[0].s === 'automation.turn_off' &&
      armed.label === 'Tap again to delete' &&
      removed?.path === 'config/automation/config/fluvy_done_mk_dish',
    JSON.stringify({ toggled, armed, removed }),
  );
  // a card that names no device finds the one 1.12 wrote for it, known by that `none`, and acts on it
  const none = frame(p, 'Tell me when it’s done · no device, as 1.12 wrote it')
    .locator('fluvy-appliance-card .ap-notice')
    .first();
  const old = await none.getAttribute('aria-pressed');
  await reset(p);
  await none.click();
  await settle(p, 200);
  const offed = await calls(p);
  check(
    'a card that names no device (`device: none`) finds the notice 1.12 wrote for it, on, and a tap turns that one off',
    old === 'true' &&
      offed.length === 1 &&
      offed[0].s === 'automation.turn_off' &&
      JSON.stringify(offed[0].t ?? offed[0].d).includes('automation.fluvy_done_none'),
    JSON.stringify({ old, offed }),
  );
  await p.close();
}

/* ---------- the list follows what each does ---------- */
{
  const list = card(page, 'Appliances · the busy ones, named');
  const before = (await read(list)).rows;
  await page.evaluate(() => window.fluvyMock.set('sensor.waschmaschine_aktueller_status', 'end'));
  await settle(page, 300);
  const after = (await read(list)).rows;
  check(
    'the list of the house’s appliances follows what each does: a washer that finished leaves the running ones',
    before.indexOf('Waschmaschine') >= 0 &&
      after.indexOf('Waschmaschine') > before.indexOf('Waschmaschine'),
    JSON.stringify({ before, after }),
  );
}
/* ---------- LG · the reporter's house (#47), as he dumped it ---------- */
{
  const at = (title, n) => read(card(page, title, n));
  const texts = (title, n, selector) =>
    card(page, title, n).evaluate(
      (el, sel) =>
        [...el.shadowRoot.querySelectorAll(sel)].map((node) =>
          (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
        ),
      selector,
    );
  /** What a head says the appliance is doing (a due reminder is a row's, never the head's). */
  const sub = (title, n) =>
    card(page, title, n).evaluate((el) =>
      (el.shadowRoot.querySelector('.ap-head__sub')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    );
  const heads = (title) => Promise.all([0, 1, 2, 3].map((n) => sub(title, n)));
  const rest = 'LG · the reporter’s house · SmartThinQ, as dumped';
  const work = 'LG · the reporter’s house · SmartThinQ, at work';
  const core = 'LG · the reporter’s house · ThinQ, as dumped';
  const coreWork = 'LG · the reporter’s house · ThinQ, at work';
  // the older integration's device sensor, as dumped: off, off, off and in operation; its dashes say nothing (the
  // rows' dash); the dishwasher's tub clean at 49 cycles asks for machine care, in the last row's place
  const dumped = await heads(rest);
  const dish = await at(rest, 0);
  const washer = await at(rest, 1);
  check(
    'the reporter’s older integration, as dumped: the dishwasher, washer and oven off, the fridge in operation; its dashes say nothing; the tub clean at 49 cycles due',
    dumped.join('|') === 'Off|Off|Off|In operation' &&
      dish.items.some((item) => /machine care/i.test(item)) &&
      !dish.items.some((item) => /-/.test(item.replace(/—/g, ''))) &&
      !washer.items.some((item) => /-/.test(item.replace(/—/g, ''))),
    JSON.stringify({ dumped, dish: dish.items, washer: washer.items }),
  );
  // at work: its attributes say the cycle — rinsing with 1:12 of 2:45 left, spinning, the upper cavity preheating
  // from 350 °F to 425 °F with the lower one its twin, the fridge's compartments in °C
  const busy = await heads(work);
  const figures = await Promise.all([0, 1, 2].map((n) => at(work, n)));
  const twin = await texts(work, 2, '.ap-item');
  const tiles = await texts(work, 3, '.ap-tile');
  check(
    'at work, the older integration’s attributes: rinsing with 1:12 h of 2:45 h, spinning, preheating 350 °F to a 425 °F target with the lower cavity off, the fridge at 5 °C and −16 °C',
    busy.join('|') === 'Rinsing|Spinning|Preheating|In operation' &&
      /^Remaining 1:12 h of 2:45 h$/.test(figures[0].figures) &&
      figures[0].progress === '56' &&
      /^Remaining 0:09 h of 1:30 h$/.test(figures[1].figures) &&
      /350 °F/.test(figures[2].figures) &&
      /Target 425 °F/.test(figures[2].figures) &&
      twin.some((text) => /^Lower/.test(text) && /Off/.test(text)) &&
      /^Fridge5 °C$/.test(tiles[0] ?? '') &&
      /^Freezer-16 °C$/.test((tiles[1] ?? '').replace(/−/g, '-')),
    JSON.stringify({ busy, figures: figures.map((f) => [f.figures, f.progress]), twin, tiles }),
  );
  // the core integration: its enums in the card's own words where Home Assistant has none, its washer out of reach
  // while its remote start is off, its dishwasher asking for machine care with the rinse aid at 2 of 4
  const enums = await heads(core);
  const enumDish = await at(core, 0);
  const unreachable = await card(page, core, 1).evaluate((el) =>
    Boolean(el.shadowRoot.querySelector('article.is-unavailable')),
  );
  const atWork = await heads(coreWork);
  const coreFigures = await Promise.all([0, 1, 2].map((n) => at(coreWork, n)));
  check(
    'the core integration: as dumped the dishwasher off with machine care due, the washer out of reach, the oven ready; at work rinsing, spinning (0:09 of 1:30 h) and preheating in °F',
    enums[0] === 'Off' &&
      enums[1] === 'Offline' &&
      enums[2] === 'Ready' &&
      enums[3] === 'In operation' &&
      enumDish.items.some((item) => /machine care/i.test(item)) &&
      enumDish.items.some((item) => /Rinse aid/.test(item)) &&
      unreachable &&
      atWork.join('|') === 'Rinsing|Spinning|Preheating|In operation' &&
      /^Remaining 1:12 h of 2:45 h$/.test(coreFigures[0].figures) &&
      /^Remaining 0:09 h of 1:30 h$/.test(coreFigures[1].figures) &&
      /350 °F/.test(coreFigures[2].figures),
    JSON.stringify({
      enums,
      items: enumDish.items,
      unreachable,
      atWork,
      figures: coreFigures.map((f) => f.figures),
    }),
  );
  // the rows say the phase (a due reminder first, as a row says what needs a hand: the dishwasher's machine care);
  // the cooktop as a hob names its five burners by where they sit, the left front on
  const rows = await page
    .locator(
      '[data-frame="appliances/LG · the reporter’s house · rows, at work"] fluvy-appliance-card',
    )
    .evaluateAll((els) =>
      els.map((el) => (el.shadowRoot.querySelector('.fv-row__sub')?.textContent ?? '').trim()),
    );
  const plates = await texts(
    'LG · the reporter’s house · the cooktop as a hob',
    0,
    '.ap-plate__name',
  );
  const lit = await card(page, 'LG · the reporter’s house · the cooktop as a hob', 0).evaluate(
    (el) =>
      [...el.shadowRoot.querySelectorAll('.ap-plate.is-on .ap-plate__name')].map((n) =>
        n.textContent.trim(),
      ),
  );
  const hob = await at('LG · the reporter’s house · the cooktop as a hob', 0);
  check(
    'the rows say the phase (a due reminder first), and the range’s cooktop as a hob names its burners by where they sit, the left front one on',
    /^Run machine care · 56 %$/.test(rows[0] ?? '') &&
      /^Spinning · 90 %/.test(rows[1] ?? '') &&
      /^Preheating · 350° → 425°$/.test(rows[2] ?? '') &&
      plates.join() === 'Left front,Left rear,Centre,Right front,Right rear' &&
      lit.join() === 'Left front' &&
      /Left front on/.test(hob.line),
    JSON.stringify({ rows, plates, lit, line: hob.line }),
  );
}
await page.close();

/* ---------- the clock ---------- */
{
  const live = await suite.page('sheet=appliances&width=360&at=2026-09-17T21:47:12', {
    clock: true,
  });
  const dish = card(live, 'Live clock', 0);
  // a minute's clock runs while the card is on screen
  await dish.scrollIntoViewIfNeeded();
  await settle(live, 200);
  const left = () =>
    dish.evaluate((el) =>
      el.shadowRoot.querySelector('.ap-figures__value')?.textContent.replace(/\s+/g, ''),
    );
  const first = await left();
  await live.clock.runFor(61_000);
  await settle(live, 200);
  const next = await left();
  const fridge = card(live, 'Live clock', 1);
  await fridge.scrollIntoViewIfNeeded();
  await live.evaluate(() =>
    window.fluvyMock.set('binary_sensor.kuhl_gefrier_kombination_kuhlschranktur', 'off'),
  );
  await settle(live, 200);
  const shut = await read(fridge);
  await live.evaluate(() =>
    window.fluvyMock.set('binary_sensor.kuhl_gefrier_kombination_kuhlschranktur', 'on'),
  );
  await settle(live, 200);
  const opened = await read(fridge);
  await live.clock.runFor(61_000);
  await settle(live, 200);
  const minute = await read(fridge);
  check(
    'on the page’s clock the time left ticks, and a door opened now is said after a minute',
    first !== next &&
      !shut.warning &&
      !opened.warning &&
      minute.warning &&
      /Door open/.test(minute.line),
    JSON.stringify({ first, next, shut: shut.line, opened: opened.line, minute: minute.line }),
  );
  await live.close();
}

/* ---------- the row's order, in narrow columns and long words ---------- */
{
  const cut = [];
  for (const lang of ['en', 'de', 'fr']) {
    for (const width of [168, 200]) {
      const p = await suite.sheet('appliances', { width, lang });
      const rows = await p.locator('fluvy-appliance-card').evaluateAll((els) =>
        els
          .map((el) => el.shadowRoot.querySelector('.ap-card--row .fv-row__sub'))
          .filter(Boolean)
          .filter((sub) => sub.scrollWidth > sub.clientWidth + 1)
          .map((sub) => sub.textContent.trim()),
      );
      for (const row of rows) cut.push(`${lang} ${width} "${row}"`);
      await p.close();
    }
  }
  check(
    'a row at half a column (168, 200) never cuts what it must say, in English, German and French',
    cut.length === 0,
    cut.join(' · '),
  );
}

/* ---------- the 3D printer's ring row is the card's button ---------- */
{
  const printer = await suite.sheet('printer');
  await reset(printer);
  const row = frame(printer, 'Rows').locator('fluvy-printer-card').nth(0);
  await row.scrollIntoViewIfNeeded();
  const box = await row.locator('.fv-row__title').boundingBox();
  await printer.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await settle(printer, 150);
  const opened = await moreInfo(printer);
  await reset(printer);
  await frame(printer, 'Rows')
    .locator('fluvy-printer-card')
    .nth(1)
    .locator('.pr-card--row .fv-round')
    .click();
  await settle(printer, 200);
  const pressed = await calls(printer);
  check(
    'the 3D printer’s ring row is the card’s button: its name opens the printer, its round still resumes',
    opened.length === 1 && pressed.length === 1 && pressed[0].s === 'button.press',
    JSON.stringify({ opened, pressed }),
  );
  await printer.close();
}

await suite.finish();
