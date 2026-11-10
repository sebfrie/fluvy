#!/usr/bin/env node
/**
 * The release invariants, as a check that fails loudly:
 *
 *   node tools/release/check.mjs                 what `pnpm check` runs: the versions and the metadata agree
 *   node tools/release/check.mjs --release       before a release is built: the integration folder is complete too
 *   node tools/release/check.mjs --tag v1.2.0    in CI, on a tag: the tag names the same version
 *
 * - one version: the root package.json, every workspace package.json and custom_components/fluvy/manifest.json;
 * - one set of metadata (license, author, homepage, repository, bugs, engines) on every workspace package;
 * - with --release: the build the integration ships is present (frontend/manifest.json with its build stamp,
 *   fluvy.js, loader.js, the theme, the icons), and every text file over 1 KB has its compressed sidecars, each
 *   holding exactly its file's bytes (`packages/bundle/scripts/sidecars.mjs`).
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { holds, SIDECARS, travelsCompressed } from '../../packages/bundle/scripts/sidecars.mjs';
import { readJson, workspaceManifests } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const release = args.includes('--release') || args.includes('--tag');

/** Each chunk's gzip budget in bytes (`core` is what every page loads; the rest come on demand). */
const BUDGETS = {
  'fluvy.js': 2048,
  // 236 KB since 1.9 (the head as the card's button, the grey ladder, the value row, empty lists, the room's contents,
  // the appliances' announcement and icons, heights read from the house, the judges' fixes; the lazy families'
  // English left core first, about 9 KB): 224 in 1.8, 222 in 1.7, 220 before
  core: 241_664,
  // the settings panel and its English
  panel: 40_960,
  strategy: 24_576,
  // the heights the strategy counts with the house: what an entity's capabilities draw, what a room holds
  'house-heights': 4096,
  wall: 16_384,
  // the chart engine (1.11): the scales, paths, bars, axes, rings and gauges every chart card draws with, the styles,
  // their sheet, the gauges that move (7 KB of it) — what the sensor's chart waits on, so the Chart card keeps a
  // chunk of its own. Planned at 19–20 KB before the moving gauges
  chart: 24_576,
  // the Chart card (1.11, #68): the card, the readers of its series (history, statistics, a list, a forecast), its
  // editor and its English
  'chart-card': 16_384,
  // the energy family: every energy card, the flow's drawing and motion, the model they share, its sheet. 80 KB since
  // 1.10 (its sheet left core, 2.4 KB); 76 since 1.9 (the family's English, the history bars' live day and resets, the
  // power chart's axes); 64 before
  energy: 81_920,
  // the Energy period card: the strip, its picker and its sheet (1.11, #62); the Energy usage card joins it
  'energy-period': 16_384,
  // the history bars' readings: the resets and the steps, the recorder's history, fetched by the first card needing them
  'history-bars-readings': 8192,
  // the media family: the player and the now-playing strip
  media: 16_384,
  // the devices family: the lock, the alarm and its keypad, the camera and the cameras, the printer, the job's times.
  // 36 KB since 2026-10-22 (the Cameras card, #60: its tiles, its feeds, its lines and its editor): 32 before
  devices: 36_864,
  // the cameras' sheet: fetched when a Cameras card's round opens it
  'cameras-sheet': 8192,
  // the appliances family: the washer, the dryer, the dishwasher and their kin, plug mode, the pet devices, their
  // English. 67 KB since 2026-11-10 (1.1 KB: the card's editor in sections, each setting offered where it acts — by the
  // appliance's kind, its hero and its layout — and the buttons offered those the appliance can do); 66 KB since 2026-11-06 (1.15, #120, 0.9 KB: which commands ask first and their words, the DE1's call for a
  // hand and its failure in the house's words, its plugin's prefix, its tank and its drinks out of reach, each card's
  // own opacity); 64 KB since 2026-11-04 (1.14, #115, 0.7 KB: a device of any integration read by its own words, a DE1's
  // camel-cased states, counters and tank, hcpy's keys run together; the editor's roles by kind, its lists offering
  // the device's own entities); 63 KB since 2026-11-04 (1.13.1: a cycle's energy from SmartThings' meters, PetKit's
  // states and their words, device: none read as before, the compact and ring heights from what the house draws); 62 KB
  // since 2026-11-04 (#112, 6.5 KB: the feeder, the fountain and the litter box — their PetKit and
  // PETLIBRO keys, consumables and commands, their meals read from a plan, their tiles, their names in every language);
  // 55 KB since 2026-11-04 (Hungarian's naming words, #110; the integration's own entities before a helper on its
  // device and Off while the power switch is, #91; Home Connect's programmes Home Assistant has no words for); 54 since 2026-10-20 (the
  // Japanese naming words, in kanji, kana and romaji, #54); 53 since 2026-10-19 (the #47 judge's
  // fixes: rows that never repeat the hero, the head's picture chosen by the whole name, a fridge on a plug that never
  // finishes and asks before it is switched off, the compact line's shorter forms); 51 since the reporter's LG house
  // (#47: LG's older integration read by its device sensor's attributes, both LG integrations known by their
  // signatures, LG's states and cycles worded in eight languages); 48 before
  appliances: 68_608,
  // the appliances' pictures: one product drawing a kind, fetched by the first card that draws one
  'appliance-art': 32_768,
  // the automations family: the card, the schedule model and its store. 20 KB since 1.9 (the family's English, the
  // targets of a schedule): 16 before
  automations: 20_480,
  // the schedule sheet: targets, verbs, days, moments and the name, fetched when one is opened
  'automations-sheet': 16_384,
  // the alerts family: the card (five variants and its editor), what it watches (the matcher, the engine, the memory,
  // the repairs) and its English. 24 KB, measured at 19.6 KB with the card (planned at 16 before it was built)
  alerts: 24_576,
  // the alerts' sheet: fetched when it is opened
  'alerts-sheet': 12_288,
  // the template card: its card on the tile's, the parsers of its templates' answers, its English (1.10, #59)
  template: 8192,
  // the web page card: its card, its address and rounds rules, its English (1.11, #61)
  web: 8192,
  // the Slider card: its card on the tile's and its English, its editor with the forms (1.11.1, #77)
  slider: 8192,
  // the TV remote card (1.18, #143): the card, its keys and the integrations' commands for them, the platforms it
  // knows by name, its English; its editor goes with the forms. Measured at 11.2 KB
  remote: 16_384,
  // the platforms' logos (1.18, #143): Simple Icons' and Material Design Icons' marks on the grid and Fluvy's
  // monograms, fetched by the first remote card that draws an app
  'app-logos': 24_576,
  // the Vehicle card: the card (three layouts, its editor), what finds a car's entities on thirteen integrations and
  // folds their words, its glyphs and its English (1.13, #84); measured at 20.2 KB
  vehicle: 24_576,
  // the items family: the card, its fields and presets, its English (1.11, #66)
  items: 12_288,
  // the items' sheet: fetched when an item is tapped
  'items-sheet': 8192,
  // the light card's colour controls: the quick colours' table and row, fetched by the first colour bulb, and their
  // grammar, which the light's editor shares. 8 KB since 1.15 (the grammar left core, 0.4 KB): 4 before
  'light-colour': 8192,
  // the room lights' colour sheet (1.18, #137): the room as one bulb, its switch, the hue wheel; fetched when a
  // card's colour round is tapped (its controls are the light card's, in `light-colour`)
  'lights-colour': 8192,
  // a room's quick actions (1.13, #113): their sets, levels, taps and holds, fetched as the bundle starts
  'quick-actions': 4096,
  // the weather card
  weather: 12_288,
  // the calendar card: its views, what reads its events, its sheet (1.18: it left core, 9.7 KB of what every page
  // loads, for the release's new card and styles); measured at 11.5 KB
  calendar: 16_384,
  editor: 8192,
  // the fields every card's editor is built of: the schema's helpers, a list's row form, and the editors' English
  // (1.15: they left core, 4.3 KB)
  fields: 8192,
  // the editors of the cards every page carries: their forms, lists and defaults, fetched with the visual editor
  // (1.11: they left core, 6.3 KB). 14 KB since 1.18 (the TV remote's editor, #143, and the room's colour round, #137,
  // with the sliders' style on every editor that draws one): measured at 12.7 KB; 12 before
  forms: 14_336,
  'view-icons': 4096,
  // what a see-through card wears (1.15): its sheet and what writes its fills at its opacity
  glass: 4096,
  // what a card quiet out of reach wears (1.16): its sheet
  quiet: 4096,
  // the slider styles (1.18, #144): the bar, the liquid and a tile's fill the ruler draws when asked, and their sheet
  'slider-styles': 4096,
  // the icon set's other part: the appliances, the garage, the gate, the window and the door open (13 outlines)
  icons: 4096,
  // what the pages share: the date picker, the time field, the dropdown; the Activity and History pages' period,
  // sources, layers, CSV and chrome's sheet. 12 KB since 1.10 (those left core, 2.3 KB; the sources in 1.13): 8 before
  pages: 12_288,
  activity: 32_768,
  history: 16_384,
  // 32 KB since 2026-11-06 (1.16: a card's look when unavailable and its brightness while on, #126 #124, the names'
  // and roles' editor words, #125 #127, which commands ask first, unknown names said: Hungarian and Slovak, the longest,
  // went 64 B over 30); 30 KB since 2026-11-04 (the pet devices' words, #112, and the Vehicle card's, #84: its states, its line, its
  // controls and rows, its editor and the parts a car's entities play, 1.2 KB a language; Hungarian, the longest, went
  // over 28); 28 since 1.11 (the date picker's, the units', a row's real last change's, the web page's and the Items
  // card's words, the flights preset's among them: Japanese, the longest, went 320 B over 24); 24 since 1.9 (the
  // appliances' and the alerts' words), 20 in 1.8, 16 before
  lang: 32_768,
  'rolldown-runtime': 2048,
  'loader.js': 4096,
};
const tag = args[args.indexOf('--tag') + 1];
const problems = [];
const problem = (text) => problems.push(text);

const rootManifest = await readJson(join(root, 'package.json'));
const { version } = rootManifest;
const META = ['license', 'author', 'homepage', 'repository', 'bugs', 'engines'];

for (const file of await workspaceManifests(root)) {
  const manifest = await readJson(file);
  const name = relative(root, file).replace(/\\/g, '/');
  if (manifest.version !== version) problem(`${name}: version ${manifest.version} ≠ ${version}`);
  for (const key of META) {
    const expected =
      key === 'repository' && file !== join(root, 'package.json')
        ? {
            ...rootManifest.repository,
            directory: relative(root, dirname(file)).replace(/\\/g, '/'),
          }
        : rootManifest[key];
    if (JSON.stringify(manifest[key]) !== JSON.stringify(expected))
      problem(`${name}: "${key}" differs from the root package.json`);
  }
}

const integration = join(root, 'custom_components', 'fluvy');
const haManifest = await readJson(join(integration, 'manifest.json'));
if (haManifest.version !== version)
  problem(`custom_components/fluvy/manifest.json: version ${haManifest.version} ≠ ${version}`);
if (args.includes('--tag') && tag !== `v${version}`) problem(`tag ${tag} ≠ v${version}`);

if (release) {
  const exists = async (path) =>
    stat(join(integration, path))
      .then(() => true)
      .catch(() => false);
  for (const path of [
    'frontend/fluvy.js',
    'frontend/loader.js',
    'frontend/manifest.json',
    'frontend/fonts/inter-variable.woff2',
    'themes/fluvy.yaml',
    'brand/icon.png',
    'brand/icon@2x.png',
  ])
    if (!(await exists(path)))
      problem(`custom_components/fluvy/${path} is missing (run pnpm build)`);
  if (await exists('frontend/manifest.json')) {
    const built = await readJson(join(integration, 'frontend', 'manifest.json'));
    if (built.version !== version)
      problem(`frontend/manifest.json: version ${built.version} ≠ ${version}`);
    if (!/^[0-9a-f]{8}$/.test(built.build ?? '')) problem('frontend/manifest.json: no build stamp');
    // every script under its budget (gzip): what a page pays for what it opens. A chunk is named before its
    // eight-character hash (`chunks/strategy-6-wdQvpS.js` → `strategy`; a language's catalogue is `lang`); the
    // fonts are not scripts and have no budget here
    for (const [file, { gzip }] of Object.entries(built.files ?? {})) {
      if (!/^(fluvy\.js|loader\.js|chunks\/.+\.js)$/.test(file)) continue;
      const name = file.replace(/^chunks\//, '').replace(/-[\w-]{8}\.js$/, '');
      const budget = BUDGETS[name.startsWith('lang-') ? 'lang' : name];
      if (budget === undefined)
        problem(`${file}: no budget for this chunk (tools/release/check.mjs)`);
      else if (gzip > budget) problem(`${file}: ${gzip} B gzip over its budget of ${budget} B`);
    }
  }
  // what Home Assistant sends in a file's place: every text file over 1 KB has its sidecars, and each holds exactly its
  // file's bytes (a stale one would be served for it)
  const frontend = join(integration, 'frontend');
  const shipped = (
    await readdir(frontend, { recursive: true, withFileTypes: true }).catch(() => [])
  )
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
  const present = new Set(shipped);
  for (const path of shipped) {
    const file = relative(root, path);
    const suffix = SIDECARS.find((ending) => path.endsWith(ending));
    if (suffix) {
      const source = path.slice(0, -suffix.length);
      if (!present.has(source) || !travelsCompressed(source, (await stat(source)).size))
        problem(`${file}: a compressed sidecar of nothing the build compresses`);
      else if (!holds(suffix, await readFile(path), await readFile(source)))
        problem(`${file}: does not hold its file's bytes (it would be served in their place)`);
    } else if (travelsCompressed(path, (await stat(path)).size))
      for (const ending of SIDECARS)
        if (!present.has(`${path}${ending}`))
          problem(`${file}: no ${ending} beside it (run pnpm build)`);
  }
}

if (problems.length > 0) {
  for (const text of problems) console.error(`✗ ${text}`);
  process.exit(1);
}
console.log(
  `✓ Fluvy ${version}: versions and metadata agree${release ? ', the integration folder is complete' : ''}`,
);
