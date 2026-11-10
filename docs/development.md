# Development

The repository is a pnpm workspace (Node 24, pnpm 11) with a Python integration beside it. `CONTRIBUTING.md` has the
setup and the conventions; this page is the map.

## Layout

```
custom_components/fluvy/   the integration Home Assistant installs (Python) — the build lands in frontend/ and themes/
packages/tokens/           @fluvy/tokens   palettes (OKLCH → hex), scales, contrast gates, every Home Assistant variable the theme sets;
                                           src/runtime.ts = the palette engine as the browser runs it
packages/theme/            @fluvy/theme    the theme file, emitted from the tokens and validated offline
packages/ui/               @fluvy/ui       glyphs, templates, <fluvy-ruler>, <fluvy-dial>, motion; styles/ = the approved CSS
packages/core/             @fluvy/core     Home Assistant types, entity resolution, formatting, actions, i18n (the catalogues), history,
                                           the card base class; src/shell/ = the sheets for Home Assistant's own pages;
                                           src/settings/ = Fluvy's settings; src/look/ = the look engine
packages/cards/            @fluvy/cards    one folder per card, registered in src/index.ts (see packages/cards/README.md);
                                           src/strategy/ = the automatic dashboards (the templates); src/panel/ = the settings panel
packages/bundle/           @fluvy/bundle   the build: the entry, its chunks, the loader and the fonts
packages/fonts/            Inter (OFL), subset
packages/demo-home/        @fluvy/demo-home  the fictional house the tests and the playground share
apps/playground/           the real cards on a simulated hass: screenshots, the measurer, interaction tests
apps/demo/                 the public demo on GitHub Pages: the playground's sheets and pages behind a landing page
apps/design-lab/           the approved design sheets (static HTML on packages/ui/styles)
design/                    the design language and the approved renders
tools/render/              screenshots, the alignment measurer, interaction tests, contact sheets
tools/icons/               the glyph outliner and the Material icon map
tools/brand/               the brand files, derived from brand/mark.svg
tools/release/             version bump, release invariants (with every chunk's budget), the leak scan
tools/docs/                the card reference, generated from the code into docs/cards.md, and the facts guard
tools/dev/                 a throwaway Home Assistant, and the installer for any configuration folder
```

## The build

```
pnpm build
  @fluvy/tokens build     src/build/run.ts → packages/tokens/dist (palettes.json, tokens.json, lab.css, the contrast report)
  @fluvy/theme build      src/build.ts → custom_components/fluvy/themes/fluvy.yaml (validated first)
  @fluvy/ui build:styles  the approved CSS → packages/ui/src/styles/generated/*.ts (Lit css literals; committed)
  @fluvy/bundle build     vite → custom_components/fluvy/frontend/{fluvy.js, chunks/*.js} + finish.mjs (loader, fonts, manifest)
```

The bundle is one ES module, `fluvy.js`, that imports `chunks/core-<hash>.js` (everything a page needs) and fetches
`chunks/{activity,history,panel,pages,strategy,house-heights,wall,weather,calendar,media,chart,chart-card,energy-period,energy,history-bars-readings,devices,cameras-sheet,appliances,appliance-art,automations,automations-sheet,alerts,alerts-sheet,template,web,slider,remote,app-logos,vehicle,items,items-sheet,lights-colour,light-colour,quick-actions,editor,fields,forms,view-icons,glass,quiet,slider-styles,icons,lang-*}-<hash>.js`
on demand — the Activity page, the History page, the settings panel, what they share (the date picker; the pages'
period, sources, layers, CSV and sheet), the automatic dashboards' strategy (when a dashboard asks for it) and the heights it
counts with the house (what an entity's capabilities draw, what a room holds; every page carries the cards' heights
from their configs alone), wall mode (on a device that is a wall), the chart engine (fetched as the bundle starts: the
sensor card in core reaches it through `src/shared/chart-load.ts`, the energy family, the History page and the Chart
card import it from their own chunks), a room's quick actions (fetched as the bundle starts too: the room card in
core reaches them through `loadQuickActions`), the weather, calendar, template, Energy period and usage, web page, Slider, remote, Vehicle, items and
chart cards and the media, energy, devices, appliances, automations and alerts families (fetched as the bundle starts:
their cards are announced in core — `src/energy-family.ts` and its siblings, their names and heights — and defined as
`src/energy-cards.ts` and its siblings land; Home Assistant builds a card again the moment its tag is defined), the
history bars' readings (the first card that reads a counter by them), the appliances' pictures (the first card that
draws one), the schedule sheet, the alerts' sheet, the cameras' sheet and an item's sheet (when one is opened), the
light card's colour controls (the first colour bulb), the cards' visual editor, the fields every editor is built of
(with the families too) and the forms of the cards every page carries (when a card is edited), what a see-through card wears (the first card under 100 %, or a house whose cards
are see-through), the slider styles (the first ruler asked for a bar, a liquid or a tile's fill, or a house that chose
one), the icon set's other part (the first time Home Assistant asks for one of its icons)
and a language's catalogue (English's core part ships in core; a lazy family's English part travels with the family's
chunk, registered as it lands). `packages/bundle/groups.mjs` says which chunk each module goes to; a family's group
names its English part, or core keeps it. Lit is bundled, pinned to Home Assistant's version. `finish.mjs` writes
`manifest.json` with every file's size and hash and a **build stamp**, and fails the build when the initial set goes
over **236 KB gzip** or carries a family's English; `tools/release/check.mjs --release` holds every chunk to its own
budget (`BUDGETS`; the facts guard in `tools/docs` holds this table to it):

| Script | Budget (gzip) | What it is |
| --- | --- | --- |
| `fluvy.js` | 2 KB | the entry |
| `core` | 236 KB | what every page loads |
| `panel` | 40 KB | the settings panel and its English |
| `strategy` | 24 KB | the automatic dashboards |
| `house-heights` | 4 KB | the cards' heights counted with the house, for the automatic dashboards |
| `wall` | 16 KB | wall mode |
| `chart` | 24 KB | the chart engine: the scales, paths, bars, axes, rings and gauges every chart is drawn with, the gauges that move, the styles, their sheet, a house's series colours fitted to each mode |
| `chart-card` | 16 KB | the Chart card: the readers of its series (history, statistics, a list, a forecast), its editor, its English |
| `energy-period` | 16 KB | the Energy period card (the strip, its picker and its sheet) and the Energy usage card, their English |
| `energy` | 80 KB | the energy family and its sheet, the history bars with it |
| `history-bars-readings` | 8 KB | a counter read by its readings, the recorder's history |
| `media` | 16 KB | the player and the now-playing strip |
| `devices` | 36 KB | the lock, the alarm and its keypad, the camera and the cameras, the printer, the job's times |
| `cameras-sheet` | 8 KB | the Cameras card's sheet |
| `appliances` | 67 KB | the appliances family and its English |
| `appliance-art` | 32 KB | the appliances' product drawings |
| `automations` | 20 KB | the automations card, the schedule model and its store |
| `automations-sheet` | 16 KB | the schedule sheet |
| `alerts` | 24 KB | the alerts card, its matcher, engine and memory, its English |
| `alerts-sheet` | 12 KB | the alerts' sheet |
| `template` | 8 KB | the template card, the parsers of its templates' answers, its English |
| `web` | 8 KB | the web page card, its address and rounds rules, its English |
| `slider` | 8 KB | the Slider card on the tile's, its English |
| `remote` | 16 KB | the TV remote card: its keys and the integrations' commands for them, the platforms it knows by name, its English |
| `app-logos` | 24 KB | the platforms' logos (Simple Icons, Material Design Icons, Fluvy's monograms), fetched by the first remote card that draws an app |
| `vehicle` | 24 KB | the Vehicle card: what finds a car's entities and folds its integration's words, its glyphs, its English |
| `items` | 12 KB | the Items card, its fields and presets, its English |
| `items-sheet` | 8 KB | an item's sheet |
| `lights-colour` | 8 KB | the Room lights card's colour sheet and its hue wheel (#137), opened by the card's colour round |
| `light-colour` | 8 KB | the light card's quick colours and hue ruler, and the quick colours' grammar its editor shares |
| `quick-actions` | 4 KB | a room's quick actions: their sets, levels, taps and holds |
| `weather` | 12 KB | the weather card |
| `calendar` | 16 KB | the calendar card: its views, what reads its events, its sheet |
| `editor` | 8 KB | the cards' visual editor |
| `fields` | 8 KB | the fields every card's editor is built of: the schema's helpers, a list's row form, the editors' English |
| `forms` | 14 KB | the editors of the cards every page carries and of the template, Slider and remote cards: their forms, lists and defaults |
| `view-icons` | 4 KB | a view's icon from its name |
| `glass` | 4 KB | what a see-through card wears: its sheet's writer (every fill at its opacity) and its rules (its solid overlays, its blur) |
| `quiet` | 4 KB | what a card quiet out of reach wears: the rules that give the unavailable skin's paint back, one sheet every such card adopts |
| `slider-styles` | 4 KB | the slider styles (1.18, #144): the bar, the liquid and a tile's fill the ruler draws when asked, and their sheet; fetched by the first ruler asked for one, or as the house asks |
| `icons` | 4 KB | the icon set's other part: the appliances, the garage, the gate, the window, the door open, the security camera, the open and reload arrows |
| `pages` | 12 KB | what the pages share: the date picker, the time field, the dropdown, the period, the sources, the layers, the CSV, their chrome's sheet |
| `activity` | 32 KB | the Activity page |
| `history` | 16 KB | the History page |
| `lang` | 32 KB | a language's catalogue (`lang-de`, `lang-fr`, …) |
| `rolldown-runtime` | 2 KB | the bundler's runtime |
| `loader.js` | 4 KB | the loader the integration puts on every page |

These are the bytes a browser is sent (since 1.17, #134): the build writes a `.br` (Brotli's best) and a `.gz` (gzip's
best) beside every text file over 1 KB (`packages/bundle/scripts/sidecars.mjs`), and Home Assistant's static handler
sends one of them in the file's place to a browser that accepts it: gzip on a plain `http://` address, Brotli (about a
fifth smaller again) over HTTPS. `check.mjs --release` holds every sidecar to its file's bytes.

## How it reaches Home Assistant

The integration (`custom_components/fluvy`) serves `frontend/` under `/fluvy-frontend/<version>-<build>/`: one URL per
build, so the month-long cache Home Assistant puts on static files can never serve an old build. It loads
`loader.js` on every page and registers the panel with it; the loader restores the last look before Home Assistant
paints, registers the `fluvy:` icon set, waits for Home Assistant's connection and imports `fluvy.js` from the same
folder — the same URL the dashboard resource names, so the browser evaluates the build once. At every start the
integration keeps the compressed sidecars true to their files (`sweep_sidecars`): what it proved is recorded beside
the folder (`.sidecars`, each file's size and times), so a start that finds every file as recorded only reads the
folder; a sidecar whose file changed since (a deploy that copies files over the old ones) is unpacked and compared, and
made again where it does not hold, and one without its file goes. The theme file is written into
`<config>/themes/fluvy/` and reloaded. `docs/installation.md` lists the Repairs it raises.

## Version

One number: `version` in the root `package.json`, mirrored in every workspace package and in
`custom_components/fluvy/manifest.json`. `pnpm release:version 1.2.0` sets all of them and opens the changelog
entry; `node tools/release/check.mjs` (part of `pnpm check`) fails when they disagree, and `--release` also checks
the built folder. A tag `v1.2.0` makes `release.yml` build, check, zip the integration folder as `fluvy.zip` and
publish the release HACS installs from.

The Home Assistant releases a build was checked against are `CHECKED` in `packages/core/src/shell/patches.ts`
(`2026.9–2026.10`): the shell's report and the console set the page's Home Assistant beside them (a note, never a
stop; `docs/shell.md`). Its floor is held to `hacs.json`'s `homeassistant` by a test; its end moves when a release is
checked against a newer Home Assistant.

## Generated files

Regenerated by their generators, never edited: `packages/ui/src/styles/generated/` (`pnpm --filter @fluvy/ui
build:styles`), `packages/core/src/icons/generated.ts`, `generated-on-demand.ts` and `mdi.ts`
(`tools/icons/README.md`),
`packages/theme/src/__tests__/ha-vars.json` (`packages/theme/scripts/ha-vars.mjs <clone of home-assistant/frontend>`),
the brand files (`tools/brand/README.md`), the strategy's golden snapshot (`vitest -u`, with an explanation).

## The editors

Every card's visual editor is one element, the rows editor (`packages/cards/src/shared/rows-editor.ts`, the `editor`
chunk, fetched the first time a card is edited), built by the base class from what the card declares; a card never
writes an editor of its own. A card of a family fetched on demand declares it on its class (`static lists`,
`getConfigForm()` …); a card every page carries keeps it in a module of its own beside it (`tile/tile-editor.ts`,
exporting `base`, `keys`, `lists`, `defaults`, `choices` and `getConfigForm`), which its `editor()` fetches with the
rows editor — the `forms` chunk, so no dashboard loads what only an editor says (so does the template card, built on
the tile's). Whoever reads a card's editor asks `await Card.editor()`.

- **The form** is the card's `getConfigForm()`: Home Assistant's `ha-form` schema, written with the builders of
  `shared/form.ts`. A list the card declares in `static lists` (`RowsListSpec`) leaves the form and is edited item by
  item below it — each item its own form, a handle to drag it into order, a cross to remove it, a picker to add the
  next — so a list of `{ entity, name, … }` items stays editable where Home Assistant's form could only hold ids.
- **Defaults are shown, never written.** `static defaults` says what the card does for a key the config leaves out;
  the editor shows it in its field, and a value the person leaves as it was stays out of the config. A list's default
  shows as rows and is written only once the list is touched.
- **Choices** (`static choices`): a select's options as the house has them (a thermostat's modes, from its entity),
  swapped in as the form is drawn, so the form itself stays one static schema.
- **Aliases** (`static aliases`): an older name the card still reads shows in its newer field, and is written as the
  newer one with the first change.
- **`when`**: a field, a row of fields (`onlyWhen(test, field)`) or a whole list (`RowsListSpec.when`) may say when
  it can act, from the whole card — the config over the defaults, its lists too (`listed(data, key, alias)`, so a
  camera of the list asked live counts; the form itself holds no list), and a test that reads the house's default for
  lights reads what the card does — and the house. The editor leaves out what cannot act (an option that acts only
  in a style shows in that style) and hands `ha-form` no function. A hidden field keeps its value: the form holds
  the whole config over the defaults and answers every change with all of it, so a value set before the field went
  away is still there when it comes back. `visibleFields(schema, data, hass)` is the form the editor draws; a row
  that loses one field keeps the other on its own line.

`packages/cards/src/shared/editors.test.ts` holds every card to the contract, walking the whole form whatever its
`when`: what the form and the lists show is exactly the card's `base` and `keys`, every field has a word, every switch
and every choice a default (a tone may be left empty: it is the card's own), a field that may hide is never a required
one, and no older name is shown.

## The playground

```sh
pnpm --filter @fluvy/playground dev      # http://127.0.0.1:5183/
```

`?sheet=home` mounts one sheet (default: all; `sheet=measurer` the measurer's fixtures, which no other page shows);
`mode=dark`, `width=392` (a frame is a section: a full card is its width, a half card `(width − 16) / 2`), `lang=es`, `theme=off` (the cards on their
own tokens), `palette=volt`, `shape=round`, `accent=%23ff4a1a&character=vivid&base=cool`, `compare=linen,volt`,
`panel=appearance&state=pending,guest` (`panel=preferences&state=menu` opens the language menu; `nopopover=1` takes
the Popover API away, as an older WebView has none; `panel=dashboard&state=dashboards` has every template's dashboard
created, `recreate` its Recreate row armed; `panel=wall&state=wall` makes this browser a wall panel), `sheet=home&wall=1&moment=awake|asleep|dim|paused|corner|night` (the page as a
wall panel on the real controller: `after=` minutes, `bg=wall` the mesh), `activity=1&moment=burst`, `history=1&moment=week`,
`frames=none` (the house with no frame drawn: a suite mounts its own cards in it, as `interactions-unavailable.mjs` its
live and unavailable twins), `dashboard=home&viewtheme=Fluvy` (the view as Home Assistant themes a view, a section or a
card: the shipped theme file written on it, the look by the bundle's engine and its watch; `viewtheme=Sandstone` the
same file under another name, `lookscope=dashboards` the look on the dashboard alone; without `dashboard` the stage is
the themed wrapper, as a section has no shadow root of its own — `interactions-view-theme.mjs` proves #72 on it). The
playground's `hass` is a small, honest stand-in: a state store, service calls that change it after a delay, and
canned answers for the reads the cards make. Its WebSocket is one table of answers by message type
(`apps/playground/src/ws.ts`): Home Assistant's own reads are answered from the house — history for every entity
asked, statistics by period and over a window (`statistics` seeds: a row an hour), what an item relates to, the
repairs, the person's and the house's stored data with their subscriptions — and a sheet adds its own (`ws`), asked
first and joined with the house's by `mergeWs` (an answer of `undefined` passes). Its registries are made once, as
Home Assistant's are, so a card that caches on them behaves as it would at home. A frame's `cols` is held to the
card's own `getGridOptions()` minimum and maximum, as Home Assistant holds it: a 4 asked of a card whose minimum is 6
draws at 6. A frame may set `gap: 8`, Home Assistant's own gap (Fluvy's theme sets 16).

## The demo

```sh
pnpm --filter @fluvy/demo dev            # http://127.0.0.1:5185/fluvy/  (the playground keeps :5183)
pnpm --filter @fluvy/demo build && pnpm --filter @fluvy/demo preview   # the built site on :4173
DEMO=http://127.0.0.1:4173/fluvy/ node tools/render/demo-smoke.mjs     # what visitors get, checked
```

`apps/demo` is the playground as a visitor sees it: its sheets grouped into families, its pages, and the settings
panel, behind a landing page drawn with the design system's own parts. Its cards draw as the playground's: each sheet
stands in a house of its own and each frame is mounted by the playground's own module (`@fluvy/playground/house`:
`createHouse`, `mountFrame`), so a family's sheets never meet on an entity id and a frame keeps its width (up to the
lane's), its columns, its status colours and its own view of the house. The look runs on Fluvy's own settings
machinery kept in memory (`@fluvy/playground/look-memory`): a palette dot on the landing, the Appearance tab and the
Charts tab change the same settings, live. The URL takes the playground's parameters (`sheet`, `panel` with every tab
of the panel, `history`, `activity`, `mode`, `width`, `lang`, `palette`, `accent`, `charts`…) and
`device=phone|phone-l|tablet|desktop`; what a card cannot do here (a more-info dialog, a page of Home Assistant)
becomes a notice. The Web page card's pages (`apps/playground/public/web`) are served beside the demo's own files.
`pages.yml` builds it on every push to `main`, smoke-tests the built site (every family at a desktop's and a phone's
width, every card of the catalogue, a sentinel for each thing the stand-in holds, the panel's tabs and `charts=`, the
languages) and deploys it to https://acosta290.github.io/fluvy/.

## The tools

```sh
node tools/render/shot.mjs --sheet home --mode dark --width 360 --out apps/playground/out/home-dark.png
node tools/render/measure.mjs --page "http://127.0.0.1:5183/?sheet=home" --frame '[data-frame]' --width 1400
pnpm measure                                             # the measurer on every sheet and panel tab, at every probe (below)
pnpm measure:narrow                                      # the card widths in every language (CI runs it in a job of its own)
node tools/render/measure-fixtures.mjs                   # the measurer's self-test: every rule breaks on its fixture
node tools/render/heights.mjs                            # every card's declared height is what it draws at 360 (the known drifts below)
pnpm visual                                              # every interaction suite
node tools/render/engines.mjs                            # where a label sits in its control, in Chromium and WebKit at 1×, 2× and 3× (below)
pnpm docs:cards                                          # the card tables of docs/cards.md, from the code (pnpm check fails when they drift)
pnpm --filter @fluvy/docs check                          # the tables, and the facts guard: every spelled count and budget in the prose is the code's
node tools/render/render.mjs --page apps/design-lab/sheets/home.html --palette linen --mode all --width 900
```

The measurer is the quality gate: the 4 px grid at every device pixel ratio, control heights, icon boxes, touch
targets, baselines, text inside its box, containment, pill sides, and the text rules — no text over a control or over
another value (`overlap`), no two runs of text laid over each other anywhere else (`collision`: a week strip's
weekdays reading "LUNMARMER"), no word broken across two lines by `overflow-wrap` or `word-break`, nor a figure parted
from its unit (`midword`: "Resta/rt HA"), no pill that cuts its name (`pill-cut`), no text cut by a box with no
ellipsis to say so (`clipped`), no catalogue key on screen (`raw-key`: a dotted word that starts with a catalogue
namespace or has an underscore; "p.m." is a word), a head that keeps a free 44 × 44 to tap (`head-target`) —
**0 violations** or the change is not done. Every tool reads the playground from `PLAYGROUND` (default
`http://127.0.0.1:5183/`): a worktree runs its own on a port of its own.

An ellipsis is a name's, nothing else's (design/language.md, § Narrow columns). The measurer reads every text cut by
one, or by a line clamp, where the cut falls: a figure, a unit or a percentage is `cut-figure` wherever it is ("Schauer
· 6…", "Sunrise 7:3…"); a word in a button, a chip, a badge, a heading, a title, a date or a state is `ellipsis`; any
other word is `cut-word` (a sub, a caption, a label: "2 événe…", "64 %…"). A name may end in one: a box that says so
(`data-name`, a class with `name`, or a `title` holding its words), or a name the house gives — an entity's, a
device's, an area's, a person's, what a player plays — or a card's config (`name`, `title`), wherever a card writes it
("Kitchen sp…", "60 % of Counter so…"). Prose clamped at three lines ends a sentence, not a word. Any other text a
card writes as it is given (a calendar event's place, a `sub` or `subtitle` typed in the config) is no name until the
card says so, with `data-name` and its `title`.

### What the measurer measures at

A probe is a **card's width**, drawn as the interaction suites draw it: the frame's own width (`&width=`) in a
viewport that leaves the page's chrome room and no more (a 32 stage and a 16 frame on each side: 96), so a frame with
a width of its own is squeezed to the probe like any other.

| probe | what it is | the frames it measures, drawn at |
| ----- | ---------- | -------------------------------- |
| 152 | a half-section card: a 320 section with Fluvy's 16 gap (156 under Home Assistant's 8) | the frames holding a half card (`cols: 6`), at 320 |
| 172 | a half-section card at the design's 360 section | the frames holding a half card, at 360 |
| 211 | the full-card floor | the frames whose cards all span the section, at 211 |
| 266 | a full card a little above it | the same, at 266 |
| 360, 412 | a phone of that width: its section is the width less 32 | every frame at 328 (halves 156), at 380 (halves 182) |
| 1400 | a desktop: sections at the design's 360 | every frame at its own width (halves 172) |

The settings panel's tabs are pages: they are measured at 360, 412 and 1400 as viewports. `pnpm measure` runs all
seven (`--widths` takes page widths, `--cards` card widths; `--lang en,de` languages, `--lang all` every one the
catalogue speaks; `--jobs 8` pages at once; `--only climate,home` some pages). CI measures English at all seven and,
in a job of its own beside it, every language at the four card widths (`pnpm measure:narrow`), where a long word is
cut, broken or laid over its neighbour first. A card whose column is off the 4 grid (the 211 floor, a 266 card, a 182 half, a
third of a section) is held to every rule but the grid and the whole pixel, which its own width breaks for every box
it decides; it meets those two at the probes where its column is on the grid. The playground marks every frame with
its narrowest card's columns (`data-span`), which is how a card probe picks its frames.

Until 1.9 the measurer passed viewport widths, and the frame (a flex item with a grid of twelve 16 gaps) shrank to
fit: a viewport of 200 to 266 drew a **176** card, 296 a 200 card, 307 a 211 card, 360 a **264** card, 412 a 316
card and 1400 a 360 card. A "232" in an older report is a 176-px card, and CI never measured a card between 176 and
263.

### The measurer's fixtures

`node tools/render/measure-fixtures.mjs` measures `?sheet=measurer` (`apps/playground/src/fixtures/measurer.ts`): a
frame per rule drawn to break it, and `clean · …` frames drawn to break none. A frame's title starts with its rule
(`midword · a name broken inside a word`): the frame must break that rule (others may break too), and a `clean` frame
nothing at all. A new rule comes with a frame that breaks it and, in a `clean` frame, what it must let pass (a name in
its ellipsis, prose wrapped between words, "p.m."). A fixture is a `card(html, css)`: a `pg-fixture` element that
draws its HTML in a shadow root on a card's skin (16 inside, a 24 line, Inter), with the CSS that breaks the rule —
a box a few pixels too narrow, an `overflow-wrap: anywhere`, a negative margin.

### Known violations

`tools/render/known-violations.json` lists the violations a later block owns: a page, a frame, a rule and a
selector, the widths it is seen at in each language (`at`), and the `owner` that removes it. A run passes when every
violation it sees is listed, and fails when a listed one is no longer seen at a width and language it measured: the
file only shrinks, and it is empty before a release's review. `node tools/render/measure-all.mjs --write-known`
rewrites it to what the run saw within what it measured, keeping the owners; a new entry's owner is `triage`, to be
named by hand. `--known none` measures without it.

### Known heights

`node tools/render/heights.mjs` reads every card's declared height (`static layoutHeight`, from its config alone) as
the automatic dashboard lays its columns out with it — counted with the house each frame shows
(`packages/cards/src/house-heights.ts`, a chunk of its own the strategy imports: a thermostat counts its presets, a
fan its oscillation row, a cover its tilt) — against what the card draws in the playground at a 360 column. A drift
over 8 px fails the run unless `tools/render/known-heights.json` lists it: the frame, the card, the height declared,
the height drawn and the reason — the few cards whose drawing depends on live content the config cannot know (a
printer's job, a calendar's events, the house's appliances), which declare their documented default. A known drift no
longer seen as listed fails too: the file only shrinks. `--write-known` rewrites it from what the run saw, keeping the
reasons (a new entry's is `triage`, to be written by hand); `--only climate,home` measures some sheets, `--json
out.json` keeps every sample with its config. A frame whose spec says its heights hold under the full-card floor too
(`heights: [152, 172]`, the Energy period strip's half a section) is drawn again at those card widths in every
language, and there no drift is known.

### Two engines

`node tools/render/engines.mjs` shows where a one-line label sits in its control in Chromium and in WebKit (Safari's
engine, and the one Home Assistant's iPhone app draws with) at 1×, 2× and 3×: the middle of its capitals (half a cap
height over its baseline) less the middle of its box, in CSS px, + low. Each control is shot with its words and again
with them transparent, so the ink it reads is the words' alone. `--only tabs-pills,chips` reads some of its controls
(a playground page and the selector of a box each), `--page 'sheet=climate' --box '.fv-chip__pill'` any box, and
`--lang ja --metric ink` a script without capitals by its ink. A label `fluvy/labels.css` trims (the rule a label in a
control follows, #122) has its baseline on a whole pixel and reads the same in both engines; a new control's words
are checked here. It is not a gate: CI has no WebKit.

WebKit runs without root: install it (`pnpm --dir tools/render exec playwright install webkit`), list the libraries
it misses, download the packages that hold them (`playwright install-deps --dry-run webkit` names most; a library of
an older release, from that release's package archive) and unpack them into the bundle's `sys/lib`, which its
launcher puts on the library path:

```sh
cd ~/.cache/ms-playwright/webkit-*/minibrowser-wpe
LD_LIBRARY_PATH=lib:sys/lib ldd bin/* lib/*.so* | grep 'not found' | sort -u   # what is missing
cd "$(mktemp -d)" && apt-get download libavif16 libsoup-3.0-0 …                 # the packages that hold it
for deb in *.deb; do dpkg -x "$deb" .; done
cp -a usr/lib/x86_64-linux-gnu/. ~/.cache/ms-playwright/webkit-*/minibrowser-wpe/sys/lib/
```

### The facts guard

`tools/docs/src/facts.ts` (part of `pnpm check`) reads every count the prose spells — "sixty-five cards", "fifteen
palettes", "five automatic dashboards", "fourteen languages", "six tabs", in any case, in words or in digits — in the
README, `CONTRIBUTING.md`, the package description, `docs/*.md`, `packages/cards/README.md` and the design language,
and holds it to the catalogue, `PALETTE_NAMES`, the strategy's templates, `LANGUAGE_CODES` and the panel's `TABS`;
a source comment's count of cards too. It holds the every-page budget above to `finish.mjs` and the table of scripts
to `check.mjs`'s `BUDGETS`, name for name. The CHANGELOG is history and is never read. A count that changes with a
release (a new card) fails `pnpm check` until every page that spells it says the new one.

### A fresh worktree

`pnpm check` builds `@fluvy/tokens` first when `packages/tokens/dist/tokens.json` is missing (`precheck`): the
design lab's test reads the built tokens.

## Motion clips

```sh
pnpm clips                                        # every clip → docs/media/*.gif and *.mp4 (the playground on :5183, ffmpeg on the PATH)
node tools/render/clip.mjs --clip dimmer --keep-frames 1
```

`tools/render/clip.mjs` plays the gestures the interaction suites prove (`tools/render/lib/gestures.mjs` is one
module for both) on the playground with a drawn touch indicator, records every paint through Chromium's screencast
as lossless PNG frames with their timestamps, and encodes them with the system's ffmpeg: an H.264 mp4 and a GIF
whose palette is computed from what changes. Frames are the screencast's, at CSS pixels; a GIF over 600 KB fails
the run. The clips are the README's: the dimmer and the flow are recorded on one plate (412 × 496, a 360 card on the
page's colour) so they sit side by side at one height, History at the Activity still's 600 × 750, and the screens
(the palette, History) wear the stills' hairline. Re-record after a change to what a clip shows, and commit the
media.

The gauges that move are loops, not gestures (`gauge-liquid`, `-thermo`, `-air`, `-battery`, `-pulse`, `-sun`): a
gauge card of the `animated` sheet alone on the page's colour, at a row of three's width (274 shown, shot at 2×), each
frame shot on the animations' own clock (`lib/capture.mjs` `loop`: every animation held and set to that moment) and
read back as the sequence it is. An animation that runs for ever is retimed by the least that brings it round in the
loop (the run prints the most, 5 % at most for these), so the GIF comes round with no jump; the thermo goes through
its four weathers on the frame's four sensors and is not retimed, the loop cutting from the dunes to the snow as each
scene cuts to the next.

## README images

```sh
pnpm readme:images                                # every README still → docs/images/readme/*.webp (the playground on :5183, ffmpeg on the PATH)
node tools/render/readme.mjs --only hero,app-desktop
```

`tools/render/readme.mjs` draws every still the README shows from the playground, never a real home: a frame alone
on its palette's page colour, a sheet's frames in one row (the hero), or a screen (the `showcase-desktop` sheet as
the whole app on a desktop, in Fluvy's floating frame beside Home Assistant's sidebar; the `showcase` sheet as a
dashboard on a tablet and a phone; the settings panel, a page). One picture is not drawn: `app-floating.webp`, the
design's mockup of the whole app, is kept as it is. The README lays them in rows of one, two or three on one edge
of 822 px, GitHub's README column: each row is one `<p align="center">` whose images are joined without a space,
each image linked to the demo sheet it shows. A picture is 822 over its row's count wide, saved at twice that as
WebP (libwebp, quality 90) and padded at the bottom in its page's colour to its row's tallest, so a row has one
height; on a phone a row stacks. A frame is drawn at the picture's width less 25.5 px a side, so a pair's cards are
the design's 360 and nothing is resampled; a screen wears a hairline, so a white header still ends where GitHub's
page begins (the app in its floating frame has the page round it instead); a screen's `whole` cards are never cut
by its bottom edge. A picture over its budget (150 KB alone in a row, 70 KB in a pair, 50 KB in three) fails the
run. The pictures live in `docs/images/readme/` without a version (the README follows `main`; a release's notes keep
theirs in `docs/images/<version>/`). Re-draw them when a card they show changes, check the README as GitHub renders
it at a desktop's and a phone's width, and commit them.

## The integration

Python 3.13+, checked with `ruff check custom_components` and `ruff format custom_components` (`pyproject.toml`).
`tools/dev/README.md` runs it in a throwaway Home Assistant; `pnpm ha:install --config <folder>` puts a build into
any configuration folder.
