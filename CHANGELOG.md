# Changelog

All notable changes to Fluvy are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Visible on upgrade

- German reads as German and in Home Assistant's own words: an unavailable entity says "Nicht verfügbar", a lock's
  buttons "Verriegeln" and "Entriegeln", tap and hold "Verhalten bei Antippen" and "Verhalten bei Festhalten", idle
  energy "Leerlauf", phones "Smartphones", and the settings' tabs "Erscheinungsbild" and "Anwendungsbereich"; editor
  switches say "… anzeigen", and phrases translated word for word read as a German speaker says them.

## [1.18.0] — 2026-11-09

### Visible on upgrade

- The Thermostat card's fan speeds and presets, the Fan card's presets and the Vacuum card's suction speak a page in
  another language than English in Home Assistant's own words for them, as its own cards do ("Niedrig", "Ventilation
  naturelle", "Équilibré"), where they said the word the integration sent ("Low", "Natural wind", "Balanced").
- Every chart of the past shows the last 12 hours where its card names no window of its own, where it showed 24: the
  Sensor card's chart, its several sensors and its tile, the Energy card's line and the Chart card. The house's window
  is Fluvy's settings › Charts › Time shown (4 h, 12 h, 24 h, 48 h or 7 d); `hours: 24` on one card (`span: 24h` on a
  Chart card) brings its 24 hours back, the Energy card's day on its 00:00 to 24:00 axis.
- The Sensor card's line, the Energy card's and a Chart card's line of a sensor's history are drawn calmly, a point on
  each of the house's round times (12:00, 12:30) as far apart as the card's width holds them, each the mean of the
  readings around it, where they were the sensor's readings at 48 moments of the window; read with a finger, each says
  Home Assistant's own reading at that time, so a cloudy noon reads 2.61 kW at 12:00 as in Home Assistant's history.
- The Sensor card's Min and Max are the window's own extremes, where both were the sensor's readings at 48 moments of
  the day.
- A house whose Energy dashboard names several arrays or batteries finds every one on the automatic dashboards: in
  the flow, the balance and the Batteries card, and a gauge and a solar curve for each array.

### Added

- The Room card's arrows can be hidden (`show_arrow: false`, #151): the name and its line have their room, and a tap
  still opens the room. A switch in its editor, on by default.
- The Room lights card can carry a colour round (`show_color: true`, Discussion #137): a palette round in the head,
  before the lights' rounds or the room's switch, whose one tap opens the room's colours for every light at once,
  while the room's icon keeps switching the lights and the brightness ruler keeps setting the room. It opens Fluvy's
  colour sheet, the light card's own hue ruler and quick colours (`colors`) for the whole room, or the hue wheel
  (`color_control: wheel`), with the room's switch in its head; a colour chosen goes to every light of the room in
  one call, wakes a room that is off, and the sheet says which lights take none. Where the card is one light or a
  light group, `color_action: more-info` opens Home Assistant's details instead. The round shows only where a light
  of the room takes a colour; in half a column it steps to a "Colour" row under the body. Off unless asked: a card
  that does not name it draws exactly as it did.
- A TV remote card (`fluvy-remote-card`, #143), for televisions, receivers, consoles and players: the head with the
  power round, the player's sources as chips, a D-pad (a ring of four arrows round OK between its four keys, or a
  grid), rewind · play/pause · forward, the volume (the ruler where the device reports a level, keys or a stepper
  where not) routed to a receiver if asked, the channel, the apps with their logos (the player's sources that name a
  platform get theirs without configuring anything; Netflix, Disney+, Prime Video, YouTube, Spotify and fifty more;
  a picture of your own in place of any logo) and keys of your own; full, compact, pad and row; every key going to the player's own service where it has one,
  else to the remote as Android TV Remote, Apple TV, Roku, LG webOS, Samsung and Fire TV take it, else to a command
  of your own. Off, the power round takes the primary fill and every key stays alive (or power alone); out of reach
  the card keeps its size and anatomy.
- An automatic dashboard leaves out the entities it is told to (`exclude`, or Fluvy's settings › Dashboards ›
  Entities left out, in Home Assistant's entity picker), as if the house had none of them, without hiding them
  anywhere else in Home Assistant: no view shows one, no room counts one and the energy roles never take one for a
  meter, so a water heater's thermostat leaves the Climate view to the air conditioners and an inverter's MPPT
  readings leave the solar power to its total. An entry may be a pattern of ids (`sensor.debug_*`), a device or a
  domain, as a room's `exclude` takes them (#141).
- Fluvy's settings › Charts › Time chooses how much of the past every chart shows and how far apart a line's points
  stand (Automatic, or a point every 5, 15 or 30 minutes or every hour, each then Home Assistant's reading at that
  time, so the line passes through what Home Assistant says at 12:00); a card's own `hours` (a Chart card's `span`)
  and `points` win, and both travel with a backup and with Export and Import.
- The Weather card can hide the name of its weather (`show_name: false`, or Show the name in its editor): the condition
  says what the card is, in either variant, with no name and no separator beside it (#145).
- The Weather card's hourly forecast can step over hours (`hourly_step`, or Hours between columns in its editor, from
  1 to 6): "Now, 9, 11" at a step of 2, each column the forecast's own entry at its hour (#146).
- The sliders can be drawn in a style of the house's choice, Fluvy's settings › Appearance › Sliders, as the charts are:
  the Ruler (as before, and still the default: nothing changes on upgrade), a Bar in the same slot (Home Assistant's
  idea: the track, a fill in the tone's ink, a handle of the card's colour; a colour temperature's is the gradient
  itself), a Liquid (the fill as water, two slow waves at its edge that rest when motion is off) and, on a tile, the
  Fill (the whole tile is the slider: its lit wash reaches the level and stops on a 2 px edge, the figure in its line,
  the foot free for its readouts). Every surface with a slider follows it: the Light card's brightness and colour
  temperature, the Slider card, a large tile's and a group's, the Lights card's brightness, the media card's volume,
  the fan's speed, the cover's position and a helper's number; each card may name its own (`slider_style`, with
  the fill offered only where the card draws a tile) and the words under a bar or a liquid (`slider_words`: the ends
  and the middle, or none; the row stays, so no height moves). Every style keeps the relative drag, the slowing away
  from the axis, the bubble and the keys; the fine scale on a hold stays the Ruler's. The setting travels with a
  backup and with Export and Import (#144).

### Fixed

- A card editor's boxes on one row stand level whatever hint is under each, where a longer hint, as a translation often is, lifted its box above its neighbour's. A row that paired an entity picker with another kind of field now stacks them, each on its line, as their labels cannot line up (#150).
- The History bars card draws a statistic an integration imports, one with no entity behind it (`entity: linky:…`), in its own name and colour, where it drew the bars grey under "Entity not found" (#149).
- The Thermostat card says its fan speeds and presets in the page's language: Home Assistant's own word for each, the
  standard speeds and an integration's own, then Fluvy's for low, mid and high, then the word as sent, where every
  language read them as the integration sent them; the Fan card's presets and the Vacuum card's suction say Home
  Assistant's words too. Where a person chose a language of their own for Fluvy, Fluvy's words come first, Home
  Assistant's being the page's language. Thanks to @waphbs, who brought the standard speeds to every language (#142).
- The Energy card drew one in six of its sensor's five-minute means, each half an hour late, so on a cloudy day it
  read 1.27 kW at 12:00 on a smooth hill where Home Assistant's history read 2.61 kW: read with a finger it says Home
  Assistant's own five minutes now, and its line is the mean of each half hour on a phone, or every bucket with
  `points: 5m` (#138).
- The Chart card cut a rolling window into slots counted back from now, so bars, columns, a band and a stepped line
  stood at minutes past the hour, each slot blended two of Home Assistant's hours, a week's bars read the mean of their
  hours where they should add up, and a band over a rolling window never drew: each slot is now a whole round period of
  the house's clock and reads what Home Assistant says of it, added up, its lowest or highest as its statistic asks,
  the axis on the same round times, and the slot still running reads so far, paler (as #138 on the Energy card).
- The Energy card following a date picker on today squeezed the whole day into the hours so far, and drew nothing new
  until the range changed.
- The Sensor, Readouts, Humidity and Gauge cards read a sensor's history at one moment of each step, so a peak between
  two steps was lost and a short one taken for the whole step: each point is the step's mean now.
- The automatic dashboards' flow, Solar card and gauge read only the first array the Energy dashboard names, so a
  house whose first inverter was offline showed 0 W of sun while the second made 942 W: every array and battery
  counts, each with its own sign (#140).
- The Energy flow and Energy balance cards, and the Energy card's chart by source, said nothing of the house while one
  of two arrays or batteries could not be read: one that cannot counts as nothing while another of its kind reads.
- The Readouts card just appeared when a dashboard loaded: it enters as the other cards do now (#148).
- The media browser showed every photo and video in grey where Fluvy's look applies: only brands' logos and Home
  Assistant's own icons wear the neutral ink, and a photo, a video, an album's or a folder's cover keeps its colours
  (#147).
- The People card in a narrow column lost its faces where the word for away did not hold (Polish's "Poza domem" at
  211), and cut the count in its head at 152 in Slovak and Turkish ("Doma…"): the faces stay, saying the place or the
  time, or a dash, the full word in the label, and the count reads "2/3" where its words would be cut.
- A wall left in its screensaver waited for a first touch before it reloaded for an update: its screensaver is nothing
  to lose, so it comes back on the new build by itself; and a change of the panels arriving while the page was asking
  which build the server serves is asked about again, where it waited for the next trigger.
- Fluvy could fail to start on a read-only `custom_components`, or where a file went away while its compressed copies
  were checked: each one that cannot be kept true is logged and tried again at the next start.
- The Energy card's line, and a Chart card's line of statistics, held the last reading across a gap in the recorder,
  where Home Assistant's line breaks: they break there now, the figures read nothing inside the gap, and a page left
  open for weeks no longer keeps the energy cards' five-minute answers it will not ask for again.

## [1.17.0] — 2026-11-07

### Visible on upgrade

- From this version on, a page left open through a Fluvy update says "Fluvy was updated" in Home Assistant's own toast
  with Reload as Home Assistant comes back from the restart, and a dashboard nobody touches for a minute, with no
  editor, dialog or unsaved change open, reloads by itself once (a wall tablet, a tab in the background).
- Polish, Slovak, Hungarian and Turkish letters with marks (ł, ń, č, ő, ş…) are drawn in Fluvy's own font, where they
  dropped to another face mid-word.
- The Light card's editor names "With the brightness" "Soft, with the brightness", beside the new "Full colour, with the
  brightness".

### Added

- The Light card can wear its light's whole colour as bright as the lamp is (`tint_strength: full_brightness`, Full
  colour, with the brightness): a soft wash for a dim lamp, at 100 % the very card Full colour draws, following the
  finger as it drags. Its words are the fill's own wherever they read on it, else the card's: on Volt, Mint and Noir in
  dark they change once, at one level, the same up and down. The wash that follows the lamp is now worded Soft, with
  the brightness (#131).
- Polish, thanks to @paproh (#130): every card, page, dialog and editor form, the settings panel's language list and
  the integration's own texts, with the naming words the automatic dashboards and the appliance cards read a Polish
  house by, as written or as an entity id writes them (a name's ł is read as l). It says Home Assistant's own words
  where Home Assistant names the same thing (Włączono, Wyłączono), and greets "Dzień dobry" through the day and
  "Dobry wieczór" from 18:00; "Dobranoc" is a farewell and never shows.
- Simplified Chinese, thanks to @waphbs (#133): every card, page, dialog and editor form, the settings panel's language
  list and the integration's own texts, in Home Assistant's register (您) and words. Home Assistant's `zh-Hans`, and a
  browser's `zh`, `zh-CN` and `zh-SG`, read it; its Han is drawn in a Simplified face (PingFang SC, Microsoft YaHei,
  Noto Sans SC) and wraps between any two characters. The automatic dashboards and the appliance cards read a house
  named in Chinese, its words found anywhere in a name since Chinese writes no spaces (客厅温度传感器 is the living
  room's reading, 洗碗机插座 the dishwasher). Three greetings: 早上好, 下午好, and 晚上好 from 18:00; 晚安 is a farewell
  and never shows. Traditional Chinese (`zh-Hant`, `zh-TW`, `zh-HK`) is not Simplified: a Traditional house reads
  Fluvy in English, and Home Assistant's own words in Traditional, unless a person chooses Simplified Chinese in the
  panel.
- A view's icon in a tab row reads Polish and Chinese names (Światła, Łazienka, 客厅, 光伏发电).

### Fixed

- The letters of Polish, Slovak, Hungarian and Turkish (ł, ń, ś, č, ľ, ő, ű, ş, ğ) are drawn in Inter, where each fell
  back to another face in the middle of a word: the Inter Fluvy ships covers Latin Extended-A, as its notes said.
- The Room card with nothing on says so in figures ("0/3") where its language's word for off would be cut, as it
  already does with something on.
- The Energy period card measures its chips' words again once Inter is in use, where a word measured before the font
  arrived could leave four chips on one line with a label cut.
- A card's editor, a sheet or the settings panel opened in a page left open through an update say "Fluvy was updated ·
  Reload" where they failed without a word ("Failed to fetch dynamically imported module"), and opening the settings
  panel in a page still running a build from before 1.17 says it too (#132).
- The Energy flow card quiet out of reach (`unavailable: quiet`) draws a source it cannot read with its lanes at rest,
  as a source at 0 W, where its lane stayed the dashed hairline.
- The People card and the Map card quiet out of reach keep the dashed ring of a person whose presence is unknown, and
  take it off only a person out of reach, where an unknown person lost it too.
- The automatic dashboards keep a letter that ends a place's name or follows it ("Sensor Kid E" is "Kid E", "Hall I
  Sensor" is "Hall I", where they read "Kid" and "Hall"), keep the "O" of "O’Brien", and capitalise a place left in
  lower case by the words cut before it where its name was capitalised ("Termostat V obývačke" is "Obývačke").
- The Appliances card's editor no longer shows a list of commands to ask before that leaves out an oven's start:
  left empty, it says that each appliance asks as on its own card, where editing the list it showed silently stopped
  ovens, microwaves and air fryers asking before they start.
- Fluvy's files reach the browser compressed, where every one was sent whole: what every dashboard loads is 235 KB
  with gzip (192 KB with Brotli, over HTTPS) instead of 770 KB, and all of Fluvy's scripts 1,099 KB instead of 3,335
  KB; at every start the integration keeps each compressed copy true to its file, so one changed in place by a deploy
  is never sent as it was (#134).
- Fluvy's settings draw a preview card again only when an entity it shows changes, where every preview card was drawn
  again on every state change in the house while the settings were open (a house of 914 states changes some twenty a
  second): six redraws a tick on the Appearance tab are none, and the page's work while the house ticks falls by about
  60 % (#135).
- Every card on a dashboard whose cards speak a language of the person's own (Fluvy's settings › Preferences) is drawn
  again only for what it shows, where each one was drawn again on every state change in the house (#135).

## [1.16.0] — 2026-11-06

### Visible on upgrade

- The Appliance card of an oven whose integration can start it (LocalThings, Home Connect, Miele, SmartThings) shows a
  Start button first among its buttons, and as a row at rest its round is that Start, where it was its power; an
  oven's, a microwave's or an air fryer's start asks first ("Start Oven?") unless the home's own `confirm` says
  otherwise (#128).
- An appliance row's round is the one that can act now: while an oven, a kettle or a washer runs and its Start cannot
  act, the round is its power round (switching off, asked first), else a Stop that can, where it was a greyed Start.
- A card's name field in its editor, and a list item's, is Home Assistant's own name picker wherever an entity is
  beside it, as in Home Assistant's own cards; a name you wrote in words stays your words.
- The chips card's tabs stay solid on a see-through house, as the greeting and the headings do, where they turned
  see-through and blurred with the cards in 1.15.

### Added

- The Appliance card leaves out a role it found that a home names `none` (`roles: [{role: remote, entity: none}]`), or
  None in the editor, everything else as found: a dishwasher whose remote start says off at rest, and starts all the
  same, gets its Start back; a wrong door or a water meter of the machine's whole life goes the same way (#127).
- Every card reads a name as Home Assistant's own editor writes it: the entity's own name, its device's, its area's
  or its floor's, alone or in a list, so a light of the device "EG_GA_L_Baum" named "Baum" reads "Baum" with
  `name: { type: entity }`, where such a name read "[object Object]"; left out, a card says the friendly name as
  before (#125).
- The Light card shows its brightness always, never or only while the light is on (`show_brightness`: `true`, `false`,
  `when_on`): never, the card is its head alone; while on, it is its head alone while the light is off and eases open
  to its brightness, its rulers and its colours as it turns on (#124).
- A card out of reach can look as it does while off (#126): in Fluvy's settings (Appearance › Cards › When
  unavailable) every card says Dashed (the default, as before) or As when off, and each card may say its own
  (`unavailable: quiet`), a tile of the tiles card too. As when off, a tile, a light card, a row, a room or any other
  card keeps its own surface, its own glyph and its controls at full strength, still says "Unavailable", writes "—"
  for what it cannot know and takes no tap where it cannot act, at the same size.

### Fixed

- The Appliance card reads the commands it asks before (`confirm`) in any case and `power` as switching off, where
  `Start` and `power` were dropped without a word, and a list of only names it does not know asks as by default, a stop
  included, where it asked nothing; its editor, and the Appliances card's, say which names they do not know.
- The Appliance card's editor offers to ask before every command its appliance can send, by the entities it found,
  where an LG or SmartThings washer's Start and Stop through its operation select left the list while the select listed
  nothing (the washer asleep or out of reach).
- The Appliance card's alarm row that says "Error" on a narrow card, where its line does not hold a failure's own words,
  keeps them as the row's title and in what it says to a screen reader, and a tap on any alarm row opens what says it
  (what failed, the door left open, the state that asks for a hand), where at 211 px the reason showed nowhere on the
  card and a door left open opened the appliance's error sensor where it has one.
- The Appliance card's readouts keep a word all of a device's entities share after its name, "Total coffees" and "Rinse
  aid level", where they read "Coffees" and "Aid level"; only a mark in capitals goes, as the DE1's "DE1+".
- The automatic dashboards, the Appliances card and the Appliance card in the card picker load in a house where an
  integration writes a device's model, maker or name, or an area's name, as a number, where the Home dashboard said
  "Error loading the dashboard strategy: TypeError: (e.model ?? "").trim is not a function" for a fuel station whose
  model is 76380002 (#129).
- A part of an automatic dashboard that cannot be read (its appliances, its printers, the names it reads off its
  devices) is left out with a warning in the browser's console, where it took the whole dashboard down (#129).
- The automatic dashboards name a reading by its device's place as it is written: "Sala de estar", "Fürdő és Konyha",
  "Quarto Nº 2" and "Là-haut" keep their small words, "Capteur d'humidité Salon" is "Salon" and "Snímač teploty
  Obývačka" is "Obývačka", where they read "Sala estar", "Fürdő Konyha", "Quarto 2", "haut", "d' Salon" and "teploty
  Obývačka"; a sensor's "and" goes with its words in every language ("Temperature and Humidity Sensor Kitchen" is
  "Kitchen").
- The Openings and Automations cards' editors take as many rows as the cards fold after, where they stopped at 20 and
  30.
- The Printer card puts an AMS's trays in their slots' order once the AMS says them, where trays first read while it
  was out of reach (after a restart) kept their ids' order until the page was reloaded.
- The Room card's picture pill fits its glyph and its name whole when the card's width changes after it is drawn (a
  phone turned, a column resized, a slow first layout), where a pill first drawn without its glyph kept that width
  and squeezed the glyph and cut the name once the glyph came; its glyph never shrinks.
- A see-through card on a dashboard opened cold draws its first frame see-through, where it drew solid for a moment
  until what it wears arrived.

## [1.15.0] — 2026-11-06

### Visible on upgrade

- The Appliance card of an espresso machine over MQTT says "Needs attention" or "Error" in its head, its own word in
  its alarm row, where the DE1 said "Refill" or "Fatal error" in English.
- A wall shows a view's own background where the view has one, where the wall's mesh or page colour covered it.
- Labels in buttons, chips, badges, pills, dropdowns and the view tabs move up by half a pixel to a pixel in Safari
  and Home Assistant's iPhone app, to the middle of their control as in Chrome (#122).

### Added

- The Appliance card asks first before the commands a home names (`confirm: [start, stop]`): a start, a resume, a
  pause, a stop, switching off, a meal, a clean or a levelling, in Home Assistant's dialog and in words that name the
  appliance ("Start Oven?"), wherever they are tapped (its buttons, its power button, the row's round), and the
  Appliances card's whole cards ask as its own `confirm` says; unset, the card asks as before, and `confirm: []` asks
  for nothing. Its editor offers the commands the appliance can send (#120).
- Cards can be see-through, so a view's background shows through them: an opacity for every card in Fluvy's settings
  (Appearance › Cards, solid until you choose), what shows through blurred unless you turn it off, and each card's own
  `card_opacity` beside its card colour in the editor (#121).

### Fixed

- The Appliance card says an espresso machine's call for a hand and its failure in the house's language, "Needs
  attention" and "Error" with its own word as its alarm row's value, where the DE1 over MQTT said "Refill" and "Fatal
  error" in English in every language; where a row or a line cannot hold those words, the Appliance and Appliances
  cards say "Check" and "Error", and an alarm row no longer takes a second line.
- The Appliance card's compact readouts of a device whose plugin puts its own word before each of its entities' names
  read "Espresso Count", where the DE1's read "DE1+ Espresso Count" and ended in an ellipsis on half a section.
- The Appliance card's water row says "Refill" while an espresso machine says it wants water, where the DE1's read
  "60 mL" in a fine tone under a head that said Refill.
- The Appliance card out of reach draws a coffee machine's drinks as it draws them live, as many and as wide, each a
  dash, where the DE1 out of reach drew three where it draws two and "…".
- The 3D printer card shows a Bambu Lab printer's AMS trays again, AMS by AMS and slot by slot whatever their ids, the
  spools outside last, where since the integration's 2.2 it showed only the external spool (#119).
- The automatic dashboards place a reading in no area by its device's name without the sensor words written with
  accents (Snímač, Čidlo, érzékelő, sensörü, humidité), where they kept them, and never cut a word beside an accented
  letter, where a Slovak "Spálňa" read "Spálň", a Portuguese "Salão" "Salã" and a German "Großes" "Groß".
- A Room card's quick action asked about first (`confirmation`) moves its set at Home Assistant's yes even where the
  dashboard drew the card anew while the dialog was open, where that yes did nothing.
- The automatic dashboards in full (`caps: none`) show every sensor of their Openings cards and every automation of a
  room's Automations card, where those still folded after four and six, and `caps` names their lists (`openings`,
  `automations`) as it names any other.
- The Openings card shows as many rows as its `max_rows` asks past twenty, and the Automations card past thirty, where
  they folded there and the Openings card stood taller than it drew.
- A wall drew its own background over a view's: the background set in a view's settings showed on a dashboard but
  never on a wall, which now shows it, and the wall's mesh or plain page only where the view has none.
- Labels in buttons, chips, badges, pills, dropdowns and view tabs sit in the middle of their control in Safari and
  Home Assistant's iPhone app as they do in Chrome, where they sat half a pixel to a pixel low (#122).

### Development

- The quick colours' grammar (`light/swatches.ts`), which the light card names only the types of, travels in its
  colour controls' chunk, which the light's editor fetches with its forms: 0.5 KB less on every page.
- The fields every card's editor is built of (`shared/form.ts`, with a list's row form, `rowItems`, which lived
  beside the rows' drawing in `lock/rows.ts`) are a chunk of their own, fetched with the first editor and with the
  families as the bundle starts: 2.7 KB less on every page.
- The editors' English is a part of its own (`en/editor.json`, in the fields' chunk, which registers it); the light
  card's colour ruler says its word in the `light` namespace (`light.color`, in every catalogue, each word as the
  editor's): 1.6 KB less on every page.
- `tools/render/engines.mjs` shows where a label sits in its control in Chromium and in WebKit at 1×, 2× and 3×, and
  docs/development.md says how to run WebKit without root.

## [1.14.2] — 2026-11-04

### Visible on upgrade

- A room's page on the automatic dashboards shows the room's automations on an Automations card of their own, each
  with its switch and when it last ran (#118), where they were rows among the room's devices.

## [1.14.1] — 2026-11-04

### Visible on upgrade

- Slovak says the words its translator asked for (#116): "Snímač" for a sensor, "Panel" for a dashboard,
  "Vykurovanie a chladenie" for heating and cooling (a car's climate stays "Klimatizácia"), and the evening's "Dobrý
  večer" from 18:00 until the morning, where it said "Dobrú noc" late in the evening.

### Fixed

- The dashboard editor's card picker ("Add card", "By card") no longer draws every Fluvy card's preview as it opens
  (#117): a preview keeps its height and draws, and reads the house, only as it comes near the list's view, so the
  picker opens without waiting for them and the previews still show as you scroll to them.

## [1.14.0] — 2026-11-04

### Visible on upgrade

- The Appliance card's device picker, and the Appliances card's, lists every device of the house with a sensor, a
  binary sensor or a switch, whatever its integration (#115), where it listed only the integrations the cards read
  and said "No devices available" for an espresso machine over MQTT or a washer of another integration.
- The Appliance card's editor offers the roles that make sense for what the appliance is, in the order a person thinks
  of them (its state, its power, its programme and times first), where it offered every role of every kind; its
  lists of roles, rows, readouts and compartments offer the appliance's own entities, and a switch over each offers
  every entity of the house again. A role the card names already stays offered.
- In dark mode the lit ticks of every ruler and dial glow as the design draws them (the light card's, the
  thermostat's, a tile's, the Slider's), a colour temperature's ruler wears its dark ends and the thermostat's disc is
  lifted off the card, where the dark mode's rules never reached inside the ruler and the dial.
- A button, a scene or an event is never on: its state is the moment it was last pressed, applied or fired, and a
  tile, a row and the entities card's count took it for on, filled and counted it (as #75 left them to decide).

### Added

- Slovak (`sk`) translation for the Fluvy interface, panel and cards, appliance naming words, the demo and Home
  Assistant integration messages.
- The Appliance card reads a device of an integration it does not know as the kind it is (#115): an espresso machine
  over MQTT (the Decent DE1's plugin) says what it is doing in its own words, offers its profiles as its drinks and says
  its last shot by its counters and its tank in millilitres, and a Bosch or Siemens washer or dryer on hcpy says its
  state, time left, progress, programme and door and takes its pause and stop; a device whose name says nothing is
  known by its maker's ("Decent Espresso").
- The Appliance card's editor says what its roles are for: "Name the entities the card did not find."

### Changed

- A dashboard view of many cards (a wall's forty) is styled and laid out once for all of them as it opens, where
  every card had the page styled and laid out again as it was attached, as its first frame was scheduled and as it
  asked whether the fonts had loaded: on a tablet's slower processor the view draws sooner.

### Fixed

- The Appliance card's device picker offers PetKit's and PETLIBRO's feeders, fountains and litter boxes, which the
  card reads since 1.13.0 but its editor left out.
- The Appliance card says an appliance's failure, or its call for a hand, in its alarm row where only its state says
  it ("Fatal error"), where the row said "No alarm" under a head that said the error.
- The calendar card's upcoming list of a single day (`days: 1`) says Tomorrow under its title, where it said "Next 1
  days".
- An appliance card on a SmartThings or LocalThings machine, or on a plug, asks Home Assistant's recorder for its
  energy meter's history only where it says what this cycle used (its energy row or readout, a plug's hero), where
  every such card asked for it, and for its power's too, while its machine ran; the appliances card reads a plug's
  power alone.
- A ring appliance card on a plug out of reach says so under its dash, where it could say what this cycle had used.
- An appliance card that names `device: none` finds the "Tell me when it's done" automation 1.12 wrote for it again,
  its bell on while it is and turning it off, on and away, where since 1.13.0 the card did not see it and a tap wrote a
  second one beside it; as in 1.12, every such card reads that one until it is removed, then each writes its own.
- A room card's quick action with a `confirmation` asks once for all its round moves, then moves every member, where it
  asked about and moved only those that took the set's own service: blinds that only tilt beside blinds that close,
  or a player that can only stop beside one that pauses, were left to a tap that did not ask. Where the tap gives the
  dialog no words, such a set's dialog names the round ("Blinds").
- A card, the sheets it opens, Fluvy's settings panel, its Activity and History pages and a wall's own buttons say they
  speak the language chosen for Fluvy (`lang`) where it is not Home Assistant's, so the browser draws Japanese kanji
  in their Japanese forms and hyphenates by that language's rules, where it drew them as the page's language.
- The stat tiles card's highlighted tile firms its hairline in its own colour under the pointer, as a lit tile does,
  where it took the neutral one.
- Under reduced motion nothing on a card or the settings panel eases any more, where every property of every element
  eased for a millisecond, so a change of layout showed its old value for a frame.
- An item's colour in the editor's lists shows none chosen and says what the item wears then, on the appliances,
  appliance, distribution, stat tiles, balance, alerts, cameras, energy flow, batteries, bars, energy devices,
  calendar, people, openings, sensor and history bars cards, where it showed Primary chosen while the item wore its
  kind's, its source's, its severity's or a neutral colour.
- The tile card's tile of a muted player says "Muted · 30 %", as the Slider card's tile does, where it said
  "On · 30 %"; a number's compact or mini tile writes its figure as its large tile does ("−1.0 °C", with a minus),
  where it wrote a hyphen.
- The gauge card lays a sensor out for what it reaches where its unit takes no prefix and its readings pass a
  thousand (daylight in lx, the air's pressure in hPa, carbon dioxide in ppm), and the card names no `max`, where its
  Min / Max / Average ran past their columns at 211 to 266 px.
- A room's page on the automatic dashboards names its readings by what they measure ("Temperature", "Humidity"), as
  the room card does, where both said the room's own name, and the openings card counts the rooms only where there
  are several, where it said "· 1 room" on the room's own page.
- A dishwasher's steps say a dishwasher's words where its language says dishes apart from laundry (Vorspülen, Reinigen,
  Klarspülen in German; Hungarian, Dutch, Japanese and Slovak too), where they said a washer's (Vorwäsche, Waschen,
  Spülen).
- The Chart card's editor names a series drawn as an area by the chart's word for it (Fläche, Aire, Plocha), where it
  said the house's area (Bereich, Zone, Oblasť).
- A ruler, a dial and the time controls keep still when reduced motion is chosen in Fluvy's settings, as they do when
  the system asks for it, where their knob, ticks and bubble still eased.

### Development

- A count is a key in its forms by number (`devices_one`, `devices`, Slovak's `devices_few`), said by `plural()`
  alone, its key typed as a count; `pnpm i18n` fails a catalogue without a form its language gives a whole number up
  to 1000, and English with a form it never says.
- `heights.mjs` reads the playground under reduced motion, as the measurer does: under load it could read a card
  mid-entrance, at its 0.985 scale, which its width check then left out.

## [1.13.1] — 2026-11-04

### Visible on upgrade

- The Vehicle card lays its row of rounds out for Home Assistant's word for each state its lock can be in (Locking,
  Unlocking, Jammed), where it measured Fluvy's Locked and Unlocked, which a lock's round never says: in a language
  whose words for them differ in length, the car's own row can hold one round more, or one fewer, at the same width.
- A select's row on the entities card, and among the rows of the lock, alarm and camera cards, ends in its value,
  which opens Fluvy's own dropdown as the helpers card's does, where it opened Home Assistant's dialog: the keys, a
  letter to find a name, the option chosen at once. A row with a `tap_action` of its own keeps it, and one out of reach
  says "—" and opens its details from the row, as before.
- A SmartThings washer or dishwasher has no water row any more, where it said the water of all the machine's years as
  its programme's ("Water 1,642 L"); its energy, and a dryer's, says what this cycle added to the machine's meter,
  where it said its report's power energy (0 kWh on Samsung's machines) or the meter's count of years. Its readouts
  say the same.

### Added

- A select's row on the entities, lock, alarm and camera cards offers a part of its options in its own order
  (`options`) and names an option in its own words (`labels`), as the helpers card's does, in YAML and in the
  editor; the editor offers those rows' `since` the house's timestamp sensors, as it does the entities card's.

### Fixed

- A room card's quick action written without its dash (`quick_actions: lights`) is a list of one, where the card
  drew the room's lights and blinds instead, or broke on one written as an object; a number says what is wrong.
- A room card's quick action sends each blind and player the service it takes, one call a service: a blind that only
  tilts moves its slats, a player that cannot pause stops or goes off, one that can do neither is left out, where Home
  Assistant refused the whole call and nothing moved; a round none of whose members can act takes no tap.
- A room card's quick action for a set asks first where its tap has a `confirmation` and then moves the members that
  take the set's own service (a blind that only tilts, beside blinds that close, is left to a tap that does not ask),
  and opens its details where its tap or hold is `more-info` (its one member's, else where the room opens), where
  either did nothing. A round none of whose members can take its call (a playing speaker that only sets its volume) is
  drawn as it reads and takes no tap.
- A room card whose tiles are an empty list (as the editor leaves it once the last is removed) declares the height of
  the controls it draws as its tiles, where it declared none and a column laid out by its height left it short.
- A room's `include` or `exclude` pattern with many stars (`*`) is read at once on any id, where one that did not
  match a long id could hold the page for seconds or more (#95). The alerts card reads its id and device patterns
  (`sensor.*_battery`, `hall ?`) the same way.
- The Vehicle card takes a charge port's latch or a charge cable's lock for the car's lock on no integration: a car on
  tesla_custom whose latch came first in its registry had its lock round say and unlock the latch, which opens the
  charge port's door, where the doors' lock was meant.
- The Vehicle card counts a door, a window or a tyre's warning only of what can say it is open or on: a button or a
  switch named for the windows (one that vents them) gave the card a Windows round that read shut whatever they did.
- The Vehicle card's charging round turns a charge switch by the switch's own state: a switch still on while the charge
  read complete was turned on again by a tap, where it should have turned off (asking first, as stopping a charge
  does), and one off while the car still charged asked to stop it.
- The Vehicle card lays its row of rounds out for every word each round can say, whatever the car does now: a lock
  saying Unlocking, a cabin's temperature or a setpoint of half a degree could take a round from the row (or push the
  card's own list onto another row), and a car out of reach, its rounds all dashes, showed one round more than while it
  read.
- An appliance card with `device: none` reads no device again, as before 1.13.0: it is named after its entity and is
  what its `kind` or its entity's name says, where 1.13.0 took the name and the kind of its entity's device, and one
  that names only its roles shows them, where it showed nothing (#98).
- An appliance card whose `controls` names one it does not know (a typo written by hand) draws the others, and one
  written without its dash (`controls: start`) is a list of one, where the card failed to draw.
- A compact or ring appliance card is as tall as the rows it draws: its buttons where asked for (`show_controls:
  true`) and one of them can act, its readouts where one has something to read, where a compact card's height left
  its buttons out, and counted a row of readouts or of buttons that a machine without them never drew.
- A LocalThings washer's or dishwasher's energy readout (the compact card's) says what this cycle used, as its row
  does, where it said the machine's count of years.
- A PetKit litter box whose light is on is at rest and says "Light on", where it said "light" and ran with a Pause
  that had nothing to pause; one calibrating, resetting itself, levelling or deodorizing offers no Pause either: only a
  clean, a dump and its maintenance pause.
- A PetKit litter box removing odours or resetting its deodorant says so (Removing odours, Resetting deodorant),
  where it said the integration's raw words.
- A picture of your own on the thermostat, appliance or Vehicle card that would not load once (while Home Assistant
  restarted) comes back by itself once it loads again, where the card kept its circle, its drawing or its glyph until
  the picture's address changed.
- The thermostat, media and appliance cards draw the new picture of the entity their `image` names (an image
  entity's, a camera's still) as it changes, and the Vehicle card the picture of its car's own image entity with
  `image: auto`, where they kept the one they had drawn until something else on the card changed.
- The openings card says a row's own words for on and off (`states: {on: Tilted, off: Closed}`) in a dashboard in YAML
  mode, where Home Assistant reads an unquoted `on:` and `off:` as true and false and the row said its class's words.
- The calendar card's editor shows a month's first day as "As the language does" where the week rolls
  (`first_weekday: today`), what a month does then, where its select kept the week's choices, and a week reached from
  a month offers Today again.
- A card editor's select whose choices follow another field (a chart's style, by the sensor picked) offers the choices
  that apply as that field changes, where it kept the first ones.

### Development

- The leak scan counts the hits of every batch of files it reads, where one batch without a hit let the others'
  through: on a developer's tree, larger than CI's, it could pass with hits printed.
- What an entity's id is is core's one rule (`isEntityId`, as Home Assistant writes one), where the pictures, the
  energy cards, the automations, the alerts and the car charger each had a pattern of their own: the energy, alerts
  and automations chunks are 0.2 KB lighter, every page the same.

## [1.13.0] — 2026-11-04

### Visible on upgrade

- The helpers card opens a select of more than six options in Fluvy's own dropdown, from the value at the end of its
  row (a chevron beside it says so), where it opened Home Assistant's dialog: the keys, a letter to find a name, the
  haptics' tick as one is chosen. An option too long to hold beside the name in a narrow column goes under it, as a
  date does, where it ended in an ellipsis. Thanks to @rammium (#96).
- An appliance's picture steps down to 32 before it gives way to a letter of its name, in the appliance card's head
  and row and in the appliances card's tiles (whose pictures gave way at once under 64): two appliance rows side by
  side on a phone keep their pictures, a long name cut to its 96 beside them. Thanks to @rammium (#103).
- An appliance whose machine runs while its cycle waits for its delayed start, preheats or has finished says
  Scheduled, Preheating or Done, where it said Running: a Samsung washer counting down to its start on SmartThings, an
  oven on SmartThings preheating. Thanks to @rammium (#97).
- A dishwasher that drains before its wash begins (a Samsung's pre-drain, on SmartThings and LocalThings) is at the
  first of its steps, Prewash, where its steps had it at Rinse.
- A television on a media card that is on and plays nothing Home Assistant can name, a tuner's channel or an app its
  integration does not report as playing, is titled by its app or its input (else its name) where it read "Nothing
  playing", and its line no longer says the title again. Thanks to @rammium (#101).
- A room card ends in quick actions: a round for the room's lights and one for its blinds, where it has them, at the
  end of its head, its row or its picture. Each is a switch for all of them (a tap turns every light off while one is
  on, else on; blinds open, close, or stop while they move) with a ring of how much of them is on, and a hold opens
  where the room opens; as many show as the width holds once the name has its room. `quick_actions` orders the room's
  `lights`, `covers`, `fans` and `media` and any entity, each with its own name, icon, colour and actions, and
  `show_quick_actions: false` hides them. Thanks to @xoatrash (#113).
- A room of sensors alone shows its readings and no "All devices" row, which said nothing under its title.

### Added

- A select's row on the helpers card may offer a part of its options in its own order (`options`), name an option
  in its own words (`labels`, for an option its integration left raw) and be chips or a dropdown whatever its length
  (`display`), in YAML and in the editor. Thanks to @rammium (#96).
- The openings card reads a row's sensor as a class of its own (`device_class`: its words, its icon and whether it
  counts as open), and says a state in the row's own words (`states: {on: Tilted, off: Closed}`), for a sensor of no
  class or the wrong one: a tilt sensor that read "On" reads "Tilted", and counts as an open window only where the row
  says it is one. Thanks to @rammium (#102).
- The calendar card's week view rolls from today with `first_weekday: today`: today and the six days after it, named
  "Next 7 days", turning over at midnight without a reload, so a wall dashboard shows the days ahead on a Sunday too.
  Its editor shows each option with the view it acts on. Thanks to @theowneryaro (#111).
- A compact or mini tile's long name in two lines where one would end it in an ellipsis (`name_lines: 2`), on the
  tile and tiles cards, the template card, the room lights' tiles and the room card's tiles and row: the tile is a
  line taller whatever its name says, so a row of tiles stays level. Thanks to @rammium (#100).
- Chips whose words are Home Assistant templates, rendered and kept live, such as who is home or how many rooms have
  a light on, and whose icon and colour may be templates too; a chip whose words render nothing keeps its icon, or
  steps out of the row when it has none. Thanks to @Gnomi2 (#87).
- A line of your own on the media card in place of the player's, in every style and the compact row's too
  (`secondary`): words, a template rendered by Home Assistant (the player is `entity` in it), or an entity said as its
  state with its unit, such as a television's status sensor. Thanks to @rammium (#101).
- A picture of your own on the thermostat card, in the circle's place beside its name, and on the media card, where
  the player has no artwork or always (`image`, `image_mode`): an address, or an entity whose picture it is (an
  integration's image entity, a camera, a person), as the appliance card takes one, loaded only from the web, a path in
  Home Assistant or a `data:image` address. A picture that would not load gives way to the circle (to the drawing of
  its kind on the appliance card, to the car's glyph on the Vehicle card), never a broken image. Thanks to @rammium
  (#99).
- `include` and `exclude` on the room card, in its editor too: entity ids, patterns of ids (`switch.dishwasher_*`),
  device ids or domains, to count what the room's rule leaves out or leave out what it shows. The automatic dashboards
  take them per room (`rooms`), for the room's card and its page. Thanks to @rammium (#95).
- Pet devices on the appliance card: a feeder, a water fountain and a litter box, found on PetKit's and PETLIBRO's
  integrations or by their names. Two tiles say what matters (a feeder's food and its next meal, a fountain's water and
  its filter, a litter box's litter and its waste bin), ringed by what is left and in the warning's or the danger's ink
  as it runs low; the rows say the last meal and what was given today, what the pets drank, who used the box last and
  how often, and the days a filter, a desiccant or a deodorant has left. A feeder counts down to its next meal; the
  round gives a meal now, cleans the box or resumes a clean a cat paused, each asked first; the automatic dashboards
  give the pets a band of their own. Thanks to @eduardoribeiro (#112).
- A Vehicle card for an electric car: its battery on the car charger's ruler (or as a ring) with its range and its
  charge limit marked; when it will be at its limit while it charges, as a clock time and as how long from now; a range
  running low, a window or a boot left open, its limit reached, plugged in and not charging, a cabin too cold or too hot
  to get into, and "Updated 2 h ago" when the car has said nothing for a while; where it is and how far it has gone;
  its lock, climate, charging, boot, windows, front boot and sentry as one row of rounds that act on the car and ask
  first where it matters; its tyres from above. It finds the car's entities by what its integration calls them —
  Tesla Fleet, Teslemetry, Tessie, Renault, Volvo and Škoda, and from HACS Kia and Hyundai, MySkoda, Polestar, MG,
  Volkswagen's two and BMW's CarData — never taking a horn, a wake button or a charge cable's latch for a control; full,
  compact and as a strip, a picture of the car over the battery or in the head, every part switched off or reordered,
  each control and row named, coloured and given its own actions. Thanks to @DailytheNoob (#84).
- The appliance card reads LocalThings (Samsung's washers, dryers, dishwashers, ovens and microwaves on the house's own
  network) by its own words: its machine state and the cycle's step, the time left and the finish, its progress, its
  programme, its power, an oven's heat, door and lamp, a washer's detergent and softener running low. Its Start, Pause
  and Stop are the card's own buttons (stopping asks first; Start, Pause and Resume disabled while its Smart Control is
  off), its programmes can be chosen at rest, and it is listed among the house's appliances. Thanks to @rammium (#97).
- The appliance card presses the Start, Pause, Resume and Stop its `roles` name, for any integration: a device's
  button (found by itself where the integration names it so), a helper's button or a script. Stopping asks first.
  Thanks to @rammium (#97).
- `scan: false` makes an appliance card read only the entities it names (`entity` and `roles`), nothing else of its
  device, which still names the appliance; a switch in the editor's roles section says so. `device: none`, the way
  until now, reads the same, the card named after its entity's device. The appliances card's rows and tiles read an
  item's `roles` and `scan` as its whole card does. Thanks to @rammium (#98).
- `picture_min: 32`, `44` or `64` keeps an appliance's picture at least that large, in the appliance card's head
  and row and in the appliances card's tiles and whole cards, a long name ending in its ellipsis beside it. Thanks to
  @rammium (#103).

### Fixed

- A picture address holding a line break or another control character is never loaded: on the media card it could
  end the artwork's style and add declarations of its own to it (no script could run).
- A row of modes, presets or sources whose longest word would not hold beside its glyph even on a line of its own (an
  air conditioner's Dry mode in Portuguese or Italian, in half a section) shows its words without their glyphs, where
  the word was cut.
- A plug whose integration files its countdown or its power-on behaviour as no setting (some Tuya and Zigbee2MQTT
  plugs) counts on its room card again: its one switch beside a power or energy reading, where 1.12 took it for an
  appliance's option.

### Development

- Dev dependencies: eslint 10.14.0 (#114).
- The bundle finds its Lit `css` literals with the parser, where a pattern took a `.css` named in a comment for the
  start of one and left the calendar card's rules and the Activity page's layers as written: they are carried compact,
  0.8 KB less on every page.
- The bundle carries its Lit `html` literals without their indentation (each line break stays): 2.1 KB less on every
  page, and every chunk lighter. Every page of the playground draws the same box for box with them so.
- The sources the Activity and History pages narrow to are `@fluvy/core/sources`, in the pages' chunk: 0.5 KB less
  on every page.
- Copying a text (the wall's address) is the settings panel's own (`panel/clipboard.ts`), its only reader: 0.2 KB
  less on every page.
- Lit's `guard` directive, which only the Activity page's rows keep, travels in the Activity page's chunk: 0.1 KB less
  on every page.
- The automatic dashboards' English is a part of its own (`en/strategy.json`, in the strategy's chunk); the groups a
  room card and its quick actions name (lights, climate, media, blinds, fans) are the `room` namespace's, in every
  catalogue, each word as it was: 0.3 KB less on every page.

## [1.12.0] — 2026-11-04

### Visible on upgrade

- The alerts card tells apart the rows that share a name by their areas, else their devices, and says how many share
  a name they still share: four open windows each called "Window" read "Kitchen, Bathroom, Office" or "Window ×4",
  where they read "Window" as if one were open. Thanks to @rammium (#89).
- A room card counts what a person calls the room's devices, and fills while one of them is on: its lights, the
  switches that power something, its fans and covers, its media players, its thermostats, water heaters and
  humidifiers, its vacuums and mowers. It counted every entity of its area, so a kitchen with five connected
  appliances read "17 of 111 on" and stayed lit while an appliance's option switch was on. An appliance's own controls
  (its programme, its options, its delay, its start: the switches of a device that also has a select, a number or a
  button), its sensors, a reading, a helper, a scene, an automation, a lock or a camera no longer count, and its tiles
  and its rows say the same. The room's page on the automatic dashboards still reaches everything the room holds, and
  the plug tiles of Home and of a room's page leave an appliance's options out. Thanks to @rammium (#95).
- An appliance card whose appliance's power switch is off, and whose state says no more than that it is at rest, says
  Off where it said Ready: a Samsung washer or dishwasher on SmartThings, a Matter appliance or one on LocalThings
  switched off (#91).
- The bars card warns under 20 % by default only for a battery and a soil's moisture: a row in % of any other kind (a
  processor's use, a disk's, a room's humidity) turns warning and counts in the head's badge only under a `low` of its
  own, where every share did under 20 %. Thanks to @rammium (#94).

- The openings card counts an open cover in its head ("3 open") and lights its circle and its state as it does an open
  window, whatever the cover's class (a curtain, a blind, a shade, an awning), where only a garage door or a gate
  counted; a cover is open while it is not closed, on its way, or partly open by its position. Thanks to @Gnomi2
  (#105).

### Added

- Hungarian, the eleventh language: every card, page, dialog and the integration's own texts, with Hungarian's naming
  words for the automatic dashboards and the appliances. Thanks to @wickdj (#110).
- Lines in the sidebar: *Appearance → Lines in the sidebar* (with *Scope → Everywhere*) draws a line after each item
  the house switches on, the hairline under the sidebar's name, to set a group apart (the dashboards from the tools).
  The line follows its item wherever a person's own order puts it; a person's own look keeps its own lines. Thanks to
  @DennyWeinberg (#106, #107).

### Fixed

- The alerts card's chips (`variant: chips`) rise in on their card's turn with the rest of the dashboard, where they
  appeared at once. Thanks to @rammium (#90).
- A media player that is on and plays nothing Home Assistant can name, such as a television on a tuner's channel or in
  an app, says what it shows, its input or else its app ("On · HDMI 1"), where it said "On · last played 1 h ago"; a
  player that is idle, in standby or off still says when it last played. Thanks to @rammium (#101).
- The appliance card says Off while the appliance's power switch is off and its state only says it is at rest
  (LocalThings' "idle", a stopped machine on SmartThings or Matter), and still says a cycle, a finish or a fault the
  appliance reports while its switch lags. Thanks to @rammium (#91).
- The appliance card takes a helper attached to the appliance's device (a template, a utility meter, a threshold) for
  a role only where neither the appliance's own integration nor the entity the card names plays it, so a template
  summing the appliance up no longer replaces the integration's state. Thanks to @rammium (#91).
- A template card whose entity is `unknown` (a button never pressed, its normal state) shows its `secondary`, where it
  said "Unknown"; only an entity that is unavailable or gone says its state in place of the line, and a template line
  of an entities row reads an unknown state the same way. Thanks to @rammium (#92).
- The energy flow card over a period says every total as it is, rounded only by its decimals, where a figure under
  50 Wh read 0: a cloudy day's 0.05 kWh of sun reads 0.05 kWh, as on Home Assistant's Energy dashboard, its lane still
  resting and its figure dimmed. Thanks to @v1rusnl (#109).
- A tile whose reading does not fit beside its circle (a compact tile at half a phone) says it shorter where it showed
  nothing: a large count in the language's short words ("5.1M queries", then "5.1M"), a figure without its unit, a
  moment as long ago as it was ("12 days ago", "12 d ago"); a figure keeps the decimals its display precision asks
  for. Thanks to @rammium (#93).
- Home Assistant's back arrow returns to the view a Fluvy card navigated from, as after a stock card, where it went to
  the dashboard's first view: a navigation records the page it left the way Home Assistant does, and the back buttons
  of the Activity and History pages and the wall go back the same way. Thanks to @rammium (#88).
- The count on the sidebar's Settings and Notifications shows its figures again in the collapsed sidebar, on the
  accent, where Fluvy's icon for the item was painted a second time in its place. Thanks to @evertwoud (#86).
- On a phone the automatic dashboard no longer scrolls sideways to an empty strip: a card was drawn 360 wide for its
  first frame, wherever it stood, until it had measured its column, and a half-width card reached past the screen
  meanwhile. Every card now draws to its own width from its first frame. Thanks to @JavierSegoviaCordoba (#104).
- The Energy period card's date keeps a 44 px target when its word is short (Hungarian's "Ma" for today), where it
  drew 40 px wide.
- A Home Connect programme or setting Home Assistant has no words for reads by its own name ("Espresso", "Eco 50"),
  where the card said the whole raw key, and a programme's name longer than its room (a drink's tile, a row's value)
  ends in its ellipsis inside the appliance card, where it reached past the card and a phone's page scrolled sideways.
- The initials of a person without a picture (the sidebar's account, a person's badge) read on their circle in dark
  mode, in every palette, where Home Assistant's near black sat on the theme's dark fill; in light mode they take the
  same fill's own ink.

## [1.11.3] — 2026-10-28

### Added

- The Energy usage card draws metered flows with `mode: flows`: the sun's whole production, the battery's discharge
  and the grid's import above the line, as their meters measured them, and its head says the sum of the series it
  draws, so a solar-only card says the sun's total. Thanks to @v1rusnl (#81).
- `plot_height` sets the Energy usage card's chart height (48 to 480 px) in the full and compact layouts, its bars,
  scale and axis with it. Thanks to @v1rusnl (#81).
- The gauge card hides its Min / Max / Average row with `show_stats: false`, or shows the figures `stats` lists, in
  their order (`stats: [max, average]`); without the row the card is 60 px shorter. Thanks to @evertwoud (#83).

### Changed

- The Energy usage card's head says the sum of the sources it draws: a card with a `sources` subset, or a source
  with `show: false`, says that subset's total where it said the whole house's.

## [1.11.2] — 2026-10-28

### Fixed

- The integration loads on Home Assistant 2026.11, where it stopped with an `ImportError`: it took the themes
  event and the themes' key from the frontend's package, which no longer carries them. It now takes the event from
  Home Assistant's own constants and reads the themes by their key, the same from 2026.9 on. A daily check imports
  the integration on Home Assistant's stable and beta releases, so the next such change shows before it ships. Thanks
  to @epenet and @evertwoud (#82).

## [1.11.1] — 2026-10-28

### Visible on upgrade

- A room's page on the automatic dashboards shows everything its card counts, by the card's own rule: besides its
  thermostat, lights, blinds, media, plugs, readings and camera, its garage doors and gates as covers, its fans, every
  thermostat, player and camera it holds, its doors, windows, motion, leak, smoke and gas sensors on one Openings card,
  and the rest of it as rows under Devices. A garage with a temperature and humidity sensor, a smoke detector, a leak
  sensor and a garage door counted five devices and drew two readings; its page now holds all five. Thanks to
  @DennyWeinberg (#76).
- A list the automatic dashboards cap ends with a "N more" row where it goes past its cap (Climate's humidity and
  temperatures, Home's lights, the batteries…), which opens a page of every one, back to its view; a room's page does
  the same for its own lists. A list of rows or tiles one past its cap shows that one instead (a seventh light, a
  ninth battery), and a fourth reading shares its card, two by two. The Security dashboard's Openings view gives a room
  every opening, where it stopped at twelve, and the Media view leads with what plays wherever it is in the list.
  Thanks to @DennyWeinberg (#78).
- An energy card with no tone or colour of its own wears the tone of what its line shows, where it wore the sun's
  whatever it drew (a brownish amber under a green palette): the grid's for the Energy dashboard's grid power or meter,
  the sun's for an array's, a battery's, a generator's or a car's for theirs, the house's for an individual device's,
  and the accent for any other sensor. A card that names a `tone` or a `color` is as it was; the stacked charts
  (`sources`, `overview`) are as they were.
- A large tile of a media player sets its volume on the ruler at its foot, and one of a `number` or an `input_number`
  its value, where both showed only their state; a tile of a playing player says its volume on its line as a lit
  light says its level ("Playing · 30 %"), a number's large tile its room and its figure ("Living room · −1.0 °C"),
  or its figure alone where both do not hold (two tiles a row on a phone or a desktop: "−1.0 °C"), where its figure
  stood in its head (#77).

### Added

- A **Slider** card (`custom:fluvy-slider-card`, #77): any value on the light card's anatomy — its head, its figure
  with the − and +, Fluvy's ruler with its relative drag, its fine scale on a hold and its keys — for a media player's
  volume (its mute in the head; the line says what plays, else its source), a `number` or an `input_number` in its
  own range, step and unit (`min` and `max` narrow it, `label` names it), and a fan's speed in its own speeds. A tick
  a step where it has twenty or fewer, a range across zero lit from zero, its figures with a true minus and a plus.
  `toggle_entity` puts another entity's switch in the head (a soundbar whose volume is a `number` and whose power is a
  switch), `control` asks for the mute, a switch or nothing, and `live_update` sends the value while dragging. Full,
  compact (the figure on its line, two on a line in half a section) or the house's large tile; `tone`, `color` and
  `tint` as the light card's. Asked for in discussion #77.
- The tile card and the tiles group learn the same ruler: a player's volume and a number's value at a large tile's
  foot (#77).
- `caps`, an option of every automatic dashboard: a list's own cap (`caps: { lights: 12 }`), a list whole
  (`humidity: none`), or every list whole (`caps: none`); the panel's Dashboards tab offers Long lists: Shortened or
  In full. Thanks to @DennyWeinberg (#78).
- The entities card's `more` and `more_path`: a last row, "{count} more", that opens where the rest of a list is.
- `invert` on the energy card: a meter that reads negative while it imports reads "Right now 1.4 kW", its curve above
  the line, where it read −1.4 kW.
- `period: today` on an energy card's legend item: a meter that keeps counting (a lifetime total) reads its change
  since midnight from its statistics, as the cards that read the Energy dashboard do, where it read all it ever counted
  ("12.5 MWh" under today's curve). The editor offers it on each item, and says so under a total that reads its state.

### Fixed

- The alerts card's `updates` preset shows the updates waiting to be installed: Home Assistant files every update as a
  configuration entity (one it can install) or a diagnostic one, and the preset left the configuration ones out — every
  update with an Install. A clause of your own on the update domain (`domain: update`, `entity_id: update.*`) keeps
  both as well, and Home's card of what needs a look on the automatic dashboards shows them to an administrator (#79).
  Thanks to @sriramsv.

### Development

- The energy card's and the energy flow card's editors are modules of their own (`energy/energy-editor.ts`,
  `energy-flow/energy-flow-editor.ts`), fetched with the visual editor: the energy chunk is 79.7 of its 80 KB, where
  the new keys took it half a kilobyte over. A list's helper in the rows editor is told its item and the house.
- The light card's level (its hold until the lamp reports it, its stepper's burst, its live drag, its fine scale's
  words) and its value row are shared modules (`shared/level.ts`, `levelRow`), and so are the fan card's speeds and its
  words' fitting (`speedScale`, `heldLabels`), which the Slider card draws with; a value set on a ruler is read in one
  place (`shared/scale.ts`). The ruler takes an `origin` its lit ticks start from. The Slider card is a chunk of its own
  (`slider`, 8 KB; its editor goes with the forms), its name and height in core; the playground has a `slider-card`
  sheet and `interactions-slider.mjs` drives it.

## [1.11.0] — 2026-10-28

### Visible on upgrade

- A Home Assistant in `pt` (Portugal's code) reads Portugal's catalogue, where it read Brazil's. The language menu
  names the two Portugueses by their country, "Português (Brasil)" and "Português (Portugal)", and holds eleven rows:
  eight and the top of the ninth show, the rest scrolls (#64).
- The automatic Energy dashboard's Today view opens with the Energy period strip across the view, and its day's flow,
  sankey, score and balance follow it: their Day · Week · Month chips are gone (each card 60 px shorter) and their
  subtitle says the span. The strip's arrows and its sheet move them together, to yesterday, a week, a month or a
  year. The Now view, the Home dashboard's energy view and every card a person placed are as they were (#62).
- A light card of a light that only switches on and off is its head alone — the circle, the name, the state line and
  the switch, 84 px — where its head stood in a dimmer's 256 px box with nothing under it; a compact one declares the
  84 it draws (it declared 188). Its editor offers only what the bulb does: an on/off light's no layout, stepper or
  live update, no temperature, colours or whites; a dimmer's no longer the temperature and the colours, a white's no
  longer the colours (#65).
- Every energy figure is written by one rule, the gauge's (#69): no decimal from 100, one from 1, up to two under it,
  a scaled figure keeping its one decimal. On the energy family's cards a power between 10 and 100 W takes its decimal
  ("45.3 W" where it read "45 W"), one under a watt two ("0.25 W" where it read "0.3 W"), a kilowatt figure under
  1 kW up to two ("0.25 kW" where it read "0.3 kW"; "0.4 kW" stays); the energy card's legend writes a day's energy
  in the row's unit ("500 Wh" where it read "0.5 kWh", "0.04 kWh" where it read "0.0 kWh"); and a readout in the
  sensor's own unit takes the precision set for the sensor in Home Assistant. The history bars' editor offers its
  unit as a choice of the sensor's class, and shows none for a sensor whose unit converts to nothing (a rain gauge: it
  had no effect).
- A helpers card's date at a narrow column reads as figures ("10/11") where its month's name was cut at the pill's
  end ("10 de nov."), and a value's pill stacked under its name (a date, a long select option) is as wide as its words,
  where it was cut at the row's cap.
- A stat tile answers a tap with its entity's details (Home Assistant's dialog, with the history), and takes the
  pointer's hairline and the finger's press as a tile does; it was a still figure. `tap_action: none` on a tile keeps
  it still (#71). A tile is never laid narrower than a finger's 44: three asked in a narrow column (single digits at
  172) go two a row where they were 36 wide.
- The editor of a sensor card or an energy card holding 1.10's `show_grid: true` or `false` shows Automatic or None,
  where it showed nothing chosen; the card draws as it did.
- A gauge card is one height whatever its sensor reads and while it is out of reach: from 211 up its min · max ·
  average row is laid out by the widest figure the card can write (three figures and a separator in its unit, five
  in watts it is asked not to scale, the range's whole figures where its `max` has more, a temperature's minus), where
  it followed today's figures, and the signed ring by the range its config names, else the widest a day can give
  ("888 kW out"). A gauge whose figures were short now keeps the room of long ones: at a tablet's 266 a wind or a
  temperature gauge shows two and one where it showed three (60 px taller), a signed meter's row at 211 may stand one
  a line, and a signed ring at 266 to 328 may be a little smaller. At a section's 360 a ring and a bar are as they
  were. In a half column (152, 172) the row stands one a line, so a tile is 420 tall where a live one with
  short figures stood 352 to 360, and a signed meter there writes its direction with a sign ("−1.8 kW", the scale
  "−5 kW · 5 kW") where its short figures left room for the words ("1.8 kW out").
- The automatic dashboards hand every opening to their Sensors card (the Home dashboard's Security and Sensors views,
  the Security dashboard's overview): from the ninth on, a leak, smoke, window or motion sensor was in no list there;
  it is now under "All sensors". Thanks to @DennyWeinberg (#74).
- A weather entity is never "on": a room card in an area with the weather counts one device fewer on ("1 of 8" all
  day, whatever the weather), and a tile of the weather keeps its resting surface. Thanks to @DennyWeinberg (#75).
- The history bars read the keyboard with the chart engine: Shift with ← → moves five bars (it moved one).
- The settings panel has a sixth tab, Charts, between Appearance and Scope (a link to `/fluvy/scope` still opens
  Scope). Nothing drawn changes: the house's charts stay `classic`, 1.10's charts path for path, until it chooses
  another style.
- The editor's colour field of a lock, camera or alarm row, a scene or a chip shows none chosen where it said Primary;
  what the item draws is unchanged.
- Dutch: the energy score's self-powered ring reads "Zelfvoorzienend", and "Zelfstandig" where the long word would lay
  the rings fewer a row (three in a row in a section's column, as "Autarkie" kept them) or not hold half a column
  (#70). Japanese: a calendar's selected-day label reads 「17日（木）・イベント4件」. Portuguese (Portugal): the
  calendar's upcoming list writes "qui 29" where it wrote "quinta 29", and the energy score's low-carbon ring "Baixo
  CO₂" where "Baixo carbono" would break its row of three.

### Added

- **Chart styles.** Every chart can be drawn in a style of its own — `classic` (the chart you know, the factory
  default), `soft`, `glow`, `minimal`, `step`, `bars`, `columns` and `band` — chosen once for the house in fluvy's
  settings or per card with `chart`, with fine keys for the curve, the fill, the line, the soft shadow, the points,
  the gridlines, the scale, now and the highlight, and `animate`. Every card that draws a chart takes them, each
  offered only what it draws: the sensor (`classic`, `soft`, `glow`, `minimal`, `step`, and `bars` or `columns` where
  its readings add up; its tile's spark classic or minimal), the energy card's line (`classic`, `soft`, `glow`,
  `minimal`, `step`) and its stacked charts by source and of the whole house (`classic`, `soft`, `step`;
  `line_width: bold`), the history bars (`classic`, `bars` with a `highlight`, `columns`; the mini row `classic` or
  `minimal`), production (`classic`, `soft` for one meter, `columns`), the distribution's stack and the bars card
  (`classic`, `soft`). A card that names none draws the house's style where it can, else its classic. The History
  page follows the house's style.
- **Gauge styles**: `ticks`, `dial` (the thermostat's dial, read), `ring` and `ruler` — Fluvy's own controls, read,
  every knob the thermostat's whole ball — on the gauge card's ring (`gauge`: `ticks`, `dial`, `ring`) and the
  humidity's ruler (`ticks`, `ruler`).
- **Gauges that move with what they read**: `gauge: liquid` (a percentage), `thermo` (a temperature: a sky over the
  ground — snow, a mild sun and a cloud, heat haze, a desert with saguaros from 35 °C), `tank` (water stored: bubbles
  while it fills), `battery` (bubbles and the bolt while it charges), `pulse` (power: rings that beat faster with more
  of it), `air` (wind: streamlines as fast as the wind) and `sun` (the sun's power: rays that grow and turn with it),
  on the gauge card's ring wherever its sensor is of their kind, and `liquid` on the humidity card's band. Each card's
  editor offers the ones that read its sensor, and `animate: false` (or the house's motion off, or the system's
  reduced motion) rests them on their first frame.
- **The Charts tab** in fluvy's settings, after Appearance: how every chart and gauge of the house is drawn where a
  card says nothing of its own, chosen once like the look — the style and the gauge (the controls and the seven that
  move) as tiles drawn in the settings chosen, the fine settings the style draws with (the line, the soft shadow, the
  fill, the gridlines, the line's end, now, the bars' ends, the bubble; the waves of a moving gauge), motion, and the
  series colours: the palette's six or a set of six of the house's own — each colour picked from the palette's
  swatches (its twelve series colours, its accent and statuses, the energy states), which follows the palette and the
  mode, or a hex of the house's own, kept fixed at its hue and fitted to each mode's card (a navy lifted to read on a
  dark card, a cream deepened on a light one) — a new set starting on the palette's six, so choosing a green palette
  gives the same green in the charts; only two colours too close to tell apart are named — kept with a name (twelve
  at most), renamed, let go. A preview draws a chart, its bars and a gauge in both modes side by side, and every card
  on the page that names no style redraws as the choices move; everything is saved from the bar, kept in the house's
  settings (version 3) and so in Home Assistant's backups and Fluvy's settings file. Someone who is not an
  administrator reads it.
- The **`ok` tone** (the success role): what is good or cheap.
- **The Chart card** (`custom:fluvy-chart-card`, #68): any time series on one chart — a sensor's history or its
  long-term statistics, a list in its attributes or a weather's forecast — from what has happened to what is to come,
  now marked and what is to come dashed, in the house's chart style or its own. It reads Nordpool's prices today and
  tomorrow (`raw_today` and `raw_tomorrow`, hours or quarters, and the plain `today`/`tomorrow`; today alone until
  tomorrow is published), Tibber's map of hours to prices, ENTSO-E's and Frank Energie's prices, Solcast's forecast
  and its percentiles, and any list of moments and values — keys found by their usual names or named (`time_key`,
  `value_key`), quarters kept, negative prices kept. Its window (`span`) rolls to now — 24 hours, any hours or days —
  or is the house's day, alone or with tomorrow. Each of six series a line, an area, columns or a band, with its
  own colour (one of the palette's by its name — `graph-3`, `accent`, `ok`, `solar` … — which follows the palette, a
  colour name or a hex), unit and decimals; `thresholds` colour the line where it crosses them; `highlight` marks and
  names the cheapest and dearest stretch of what is to come (`highlight_hours` long, an hour by default);
  `show_head` writes the value now with its change on the period before; `show_legend`; `variant` full, compact or a
  tile; read by pointer, finger or keys.
- **`collection_key` on nine energy cards (#62).** Energy flow, Energy balance, Where it went, Energy score, Energy
  devices, Grid, Energy, Production and Water & gas take the key of an Energy date picker on the dashboard (Home
  Assistant's `energy-date-selection` card, or Fluvy's Energy period card — any key starting with `energy_`) and
  follow its range with Home Assistant's own figures: the statistics Home Assistant fetched once for the whole view,
  allocated the way the Energy dashboard allocates them, so a Fluvy card and Home Assistant's beside it say the same
  numbers and move together, and no follower asks the recorder again. A follower's Day · Week · Month chips go and its
  subtitle says the range ("Today", "Yesterday", "24 Oct", "17 – 23 Sep", "September", "2026"); a week is Home
  Assistant's calendar week. The period cards total the range (the balance's money too); the Grid card's totals and
  the devices card follow it; the Energy card draws the range in place of `hours` (a day on the day's axis, a longer
  range on its dates, the house's power from the sensors Home Assistant names or the meters); Production and Water &
  gas draw the range's last day. A picker's card that loads after ours is found on the next update: until then the
  card draws its own period (today by default), without chips, at the same height. The editor offers the keys found on the dashboard ("Follow a
  date picker"), hides the chips' switch and the Energy card's `hours` while a key is set, and a key without the
  `energy_` prefix is refused with a message, as Home Assistant's cards refuse it.
- **Energy period** (`custom:fluvy-energy-period-card`, #62): the Energy dashboard's date picker as a strip — ‹ the
  span ›, Today (away from today) and, asked for, Compare. The span's words ("Today", "17 – 23 Sep", "September",
  "2026") open a sheet with the presets — today, yesterday, this week, this month, this year — and a date grid for a
  span of one's own, in whole days; ‹ › walk the span by its own grain (a day, a week from the house's first weekday,
  a month, a year), as Home Assistant's picker walks it, and never past today. It drives an Energy date picker's
  collection — the dashboard's own (`energy_<its url>`) unless `collection_key` names another — so Home Assistant's
  energy cards on the dashboard follow it as Fluvy's do: where a picker already holds the key it drives that one, and
  where none does it has Home Assistant make its own date card, hidden inside the strip, so the collection is made and
  fed by Home Assistant's code (the Energy preferences, the hourly refresh, yesterday until today's first hour). Home
  Assistant's date card on the same view moves it, and it moves that one. A preset is remembered where Home Assistant
  remembers its own, so the dashboard reopens on it in both. Three layouts on the 4 grid: `row` (84), `compact` (60:
  the span between its arrows) and `stacked` (136: the row over Day · Week · Month · Year chips); `periods` (an
  ordered subset of day, week, month, year, custom), `show_today`, `show_compare`, tone and colours. In a narrow
  column Compare and Today give their words for their glyphs, the span takes its short words ("24 Oct", "Sep"), then
  Today and Compare go and, in half a section, the arrows — the sheet has them all; the stacked periods keep their one
  line and scroll where the four do not hold it, so the strip is as tall at every width. Across a wide band the
  capsule and the periods run 360 at most, on the strip's start. On a page that is no dashboard it says "Only on a
  dashboard", at its size, its buttons off.
- **Energy usage** (`custom:fluvy-energy-usage-card`, #62): Home Assistant's energy usage graph as a Fluvy card — a
  column for each hour of a day, each day of a week or a month, each month of a year, stacked from the line up by
  where the house took its energy from (the sun, the battery, the grid) and down by what went into the battery and out
  to the grid, each in its source's colour, from the Energy dashboard's statistics allocated bucket by bucket (an
  hour, a day, a month) as the dashboard allocates them (so its figures are Home Assistant's). What the house used over the range in the head, each
  series' total in the legend, a slot's whole stack in a bubble under a finger (the keys walk the slots). `period`
  (`day`, `week`, `month`, `year`, with Day · Week · Month · Year chips), `compare` (the period before as ghost
  columns behind the bars), `collection_key` (it follows an Energy date picker — Home Assistant's or the Energy period
  card — with Home Assistant's own figures for its range, the picker's Compare drawing the ghosts), `sources` (the
  sources drawn, in the order they stack, each with its `name`, `color` — a colour of the palette's, which follows the
  palette, a colour name or a hex — and `show`), `max_sources` (the rest fold into "Other"), `show_period` (the
  chips), `show_returns`, `show_legend`, `variant` (`full`, `compact`, `mini`), `chart` (`classic`, `soft`),
  `show_axis`, `show_grid`, `animate`, `unit` and `decimals`. With no Energy dashboard it says so.
- **`unit` and `decimals`** on every card that writes an energy figure — the energy flow, energy, balance, grid,
  devices, where-it-went, score, production, meters, batteries and car charger cards, the gauge, the sensor, stat tiles
  and readouts cards — and on their lists' items (a flow's and a grid's readouts, an energy card's legend, a device
  row, a meter, a tile, a readout): the figures read in the unit asked (W, kW, MW; Wh, kWh, MWh; L, m³, gal, ft³ for
  a meter) at the decimals asked, where the sensor's unit converts to it; the energy card's power scale and the
  sensor's chart follow its `unit`. The editor offers both on one row, the units of the sensor's own class; the
  history bars' unit is chosen the same way (#69).
- A **Web page** card (`custom:fluvy-web-card`, #61): a page on a plate — under a head with the page's host on its
  line, alone on the card or bare — in the shape or at the height you choose, drawn smaller with `scale`, asked for
  again every so many minutes, with open-in-a-new-tab, full-screen and reload rounds; a dark look that inverts the page
  and an automatic one that follows the card; Home Assistant's own sandbox by default, a strict one or none; no
  referrer. On an https dashboard an http page says it needs https instead of failing silently. Home Assistant's
  `type: iframe` card pastes in.
- An **Items** card (`custom:fluvy-items-card`, #66) that lists the items of a sensor's list attribute — flights
  overhead, departures, parcels — as rows, compact rows or tiles, each named, lined and valued by the fields you map
  (a field of the item, or words with `{field}` in them) or by a preset: FlightRadar24's flights are recognised on
  their own, with the route and the aircraft, the altitude with a climbing or descending arrow, the aircraft's photo
  and the nearest first. A template can give the list instead, so any sensor becomes one. `max_rows` is the card's
  height, sorting by any field, the count under the title, and a tap opens the item's sheet with all its details and
  its link.
- A row's **real last change** (`since`, #67): where Home Assistant's `last_changed` is a restart's, a row reads its
  time from a timestamp sensor or an attribute of its own (the sensor's id, or `attribute:<name>`, as an ISO date or
  an epoch in seconds or milliseconds) — on the openings card, on an entities, lock, camera or alarm row, a tile, a
  tiles group's or a room's tile, a template card, a person and a helper row. The openings card names one for every
  row at once (`since_pattern: sensor.{id}_real_last_changed`, `{id}` the row's object id, `{entity}` its whole id; a
  row's own `since` wins). What does not read — empty, unknown, unavailable, not a moment — leaves the row on Home
  Assistant's own time. The editors offer the house's timestamp sensors and take any other typed.
- **Stat tiles take a tap (#71)**: each tile opens its entity's details — Home Assistant's dialog, with the history —
  on a tap, or runs a `tap_action` and a `hold_action` of its own (nothing on a hold by default), both set per tile in
  the editor's tiles list; with a keyboard, Tab to a tile and Enter or Space opens it, Shift+F10 or the menu key holds.
  A tile that cannot be read is no button.
- **Portuguese (Portugal)** (`pt-PT`), the tenth language, translated and read in context by @andrefilipegsilva (#64):
  the catalogue, the naming words the automatic dashboards read a house by, the integration's texts and the demo's
  strings, read once more on top of his catalogue — meanings, one gender, AO90 spellings ("detetado"), the gerunds and
  other Brazilian leftovers, and the labels too long for tiles, buttons and readouts; the greeting says "boa tarde"
  until 20:00. Its naming words know "máquina de lavar louça" (a dishwasher), "Placa solar" (no hob) and "casa de
  banho" (a bathroom, never the house's power).
- Two glyphs, `fluvy:external` (an arrow leaving its box) and `fluvy:refresh` (a circular arrow), in Home Assistant's
  icon pickers too.

### Changed

- Dutch: the energy score's self-powered ring reads "Zelfvoorzienend", and "Zelfstandig" where half a column cannot
  hold the long word — a short form, `energy-score.self_powered_short`, in every catalogue, which the card takes by
  measure. Thanks to @evertwoud (#70).
- A Home Assistant in `pt` (Portugal's code) reads Portugal's catalogue; it read Brazil's. Home Assistant files
  European Portuguese under `pt` and Brazil's under `pt-BR`: Fluvy's registry now carries the code Home Assistant files
  a language under where it differs from ours (`ha: 'pt'`) and resolves a tag through it — `pt` → `pt-PT`, `pt-AO`
  and `pt-MZ` (Portugal's norm) → `pt-PT`, `pt_BR` → `pt-BR`. The integration's Portuguese texts (its setup dialog,
  the Repairs it raises) are in `translations/pt.json`, the file Home Assistant reads for `pt` (#64).
- The automatic Energy dashboard's Today view opens with the Energy period strip, and its day's flow, sankey, score and
  balance follow it, without their chips (#62).
- Every energy figure follows one rule for its decimals, the gauge's: no decimal from 100, one from 1, up to two
  under it, a scaled figure keeping its one decimal. On the energy family's cards a power between 10 and 100 W now
  takes its decimal ("45.3 W" where it read "45 W"), one under a watt two, and a kilowatt figure under 1 kW up to two
  ("0.25 kW" where it read "0.3 kW"); the energy card's legend writes a day's energy in the row's unit, Wh where
  every figure is under a kilowatt-hour; a readout in the sensor's own unit takes the precision set for the sensor in
  Home Assistant, as the gauge's does (#69).
- A select in a card's editor shows a number the YAML holds as its word (`decimals: 2`, `columns: 2`), where it showed
  nothing chosen.
- The calendar's upcoming list and week head write a short weekday short in every language: where a locale writes the
  whole word for its short form (Portugal's "quinta", never "qui."), the first three letters are taken, as the locales
  that abbreviate write it.
- The history bars read the keyboard with the chart engine's controller: Shift with ← → moves five bars.
- A chart's dot, while the chart is read, stands on the drawn curve where 1.10 put it on the straight line between two
  readings (under a pixel; at rest it is where it was).
- The settings panel has six tabs: Charts comes after Appearance.

### Fixed

- A light that only switches on and off (`supported_color_modes: ['onoff']`) draws the light card as its head alone —
  the circle, the name, the state line and the switch, 84 px — in every style, where its head stood in a dimmer's
  256 px box with nothing under it (and declared 268, or 188 compact); its editor offers only what the bulb does
  (#65).
- A date in a helper's row at a narrow column takes its numeric form ("10/11") where its month's name would be cut —
  seen in Portuguese on 25 October ("10 de nov." at a third of a section); under its name, a stacked value's pill now
  has the whole row (its 100 % used to lose the cascade to the row's cap), so it is never cut there either.
- An item's colour on a lock, camera or alarm row, a scene or a chip no longer says "Primary" in the editor where the
  item wears the card's colour: none is chosen by default, nothing is written, and the word under the field says what
  the item wears then ("Empty: the card's colour"; a light's on a card that shows bulbs' colours says its bulb's, as
  before).
- An item's unit or decimals written as a number in YAML (`decimals: 2` on a legend entry, a readout, a row, a meter,
  a tile) is shown chosen in the item's select in the visual editor, as the card's own fields already were.
- Inter is registered on a page only once Fluvy is in use on it (a card of ours, the theme on, the look covering the
  app, a wall, a dashboard that wears the look, one of our pages or the settings panel): a page on another theme with
  none of our cards fetches no font of ours.
- A camera feed leaving the page no longer asks its card to draw again.
- Japanese: the calendar's day label joins its parts with 「・」 ("17日（木）・イベント4件"), no doubled space after the
  full-width bracket; the joiner is the language's, in its registry entry.
- "Casa de banho" (Portugal's bathroom) is never the house's power: the guard is on the `casa` stem of Spanish,
  Italian and Brazilian Portuguese too.
- Home Assistant's Create automation (and Create script) chooser opens again under Fluvy's theme: it opened empty, the
  page dimmed with no dialog on it, because Home Assistant takes the dialog's maximum height from its minimum, which
  Fluvy set to 0. It is as tall as what it lists, up to the screen's height (#73).
- A view, a section or a card set to Home Assistant's Fluvy theme (its *Theme*, or a card's `theme:`) wears the palette
  you chose, in your mode, as the page around it does; it wore Linen's colours there, the theme file's own, over the
  palette (#72). A view in another theme keeps that theme.

### Development

- **The chart engine**, `packages/cards/src/chart/engine/`, in its own chunk `chart` (budget 24 KB): one Catmull-Rom,
  one bar path, one time-axis labeller, one nice scale, the styles and their resolution, the series colours and their
  check, the gauges and the moving gauges' scenes, the sheet; `drawChart`, `drawRead`, `readAt`, `plotOf`,
  `resolveStyle`, `resolveGauge`, `drawGauge`, `previewChart` for the panel. `ui/src/chart.ts` and the scrub
  controller left core for it; a core card loads it with `ChartLoader` (`shared/chart-load.ts`) behind its skeleton,
  the lazy families import it. A card names the styles it draws and the keys its chart acts on (`ChartCaps.styles`,
  `ChartCaps.keys`), the Chart section of its editor is the engine's (`engine/fields.ts`: `chartSection`, one select
  per variant a config may leave, `chartKeysFor`, `chartDefaultsFor`, `gaugeField`, `seriesColourField`), and
  reading a card's chart keys (`CHART_KEYS`, `chartKeysOf`, `styleOf`) is the engine's too; core keeps their types in
  `shared/chart-config.ts`. `readingsOf(deviceClass, stateClass, unit)` says what a sensor's readings are (bars or
  not, a scale that holds zero or not, a mean or a gain); the unit a set of figures is written in is
  `shared/units.ts`'s. `ChartSpec` takes `thresholds`, `stretches`, `reach` (ghost columns a card draws under its
  bars) and `ticks` (a nice scale a card lays itself), a `ChartSeries` its own `curve` and `fill`; a bar below the
  zero line says so in its class (`fc-bar--hanging`). `<fluvy-dial readonly>`: the thermostat's dial with its disc
  and knob, nothing to drag and no stepper; `dialLabelTop` (ui) is the dial's own height rule. The engine's English is
  a part of its own (`en/chart.json`, namespace `chart`).
- Classic held to 1.10: `classic.test.ts` holds the engine to 1.10's paths byte for byte
  (`__fixtures__/classic-1.10.json`: the sensor's curve and area, the energy card's line, extent and cursor, the
  tile's spark, the History page), the history bars' and production's bars as snapshots recorded on the 1.10 cards.
  `interactions-chart.mjs` proves classic unchanged in the browser, nothing leaving the plot and text placed by rule in
  every style in both modes, no flash with the engine's chunk late, the cards' own sheets and the History page under
  the house's soft, and the moving gauges on the `animated` sheet in both modes — running on transform, opacity and
  the dash offset alone, unfiltered, nothing out of its box, the reading never across the water or the weather, still
  under the house's motion off, the card's `animate: false`, out of reach and under reduced motion. `scenes.test`
  holds the reading clear of the waves and of every sweep of the weather at the five rooms the gauge card gives (152
  to 360) and every share. The `chart-styles` sheet draws every card that takes the styles in a style of its own, with
  its sheet's house, for the measurer.
- The house's chart settings (`CHART_PRESETS`, `GAUGE_PRESETS`, `ChartSettings`, `SavedSeries`, `CHART_DEFAULTS`,
  `parseChartSettings`, `parseSavedSeries`, `setChartDefaults` in core; house settings version 3): a saved set's colour
  is a hex or a colour of the palette's (core's `isPaletteRef`), and a colour the settings cannot read becomes the
  palette's series colour in its place instead of dropping the set. The engine's `HOUSE_ACTS` (which of the house's
  settings each style draws with; a test holds it to `resolveStyle`), `preview.ts` (the panel's drawings),
  `PALETTE_REFS`, `refInk`, `refHex`, `setInks` and `fitSet(colours, choice, statuses?)`; the tokens' `fitSeries`
  (`@fluvy/tokens/series`, in the `chart` chunk through `groups.mjs` so core carries none of it) fits a set's hexes to
  a palette's mode, the palette's colours kept and the hexes set apart from them; a contrast fit is the tokens' one
  walk (`ensureContrast` walks by the ratio; `fitLightness` and `FitOptions` are gone), every palette's output byte for
  byte as before. `SeriesPaint` is `{ className, style }` (`seriesInk` is gone; a legend wears `seriesPaint`'s paint).
  `palette.test.ts` holds every reference to the token the look writes, in all fifteen palettes, both modes and with
  the house's statuses. The panel's `swatches()`, the set editor's `slots()` and `picker()`.
- The playground's panel: `?panel=charts` with `&state=styled` (the soft style and the liquid), `sets` (three sets of
  the house's, one worn) and `editor` (a set being made, mixing hexes and the palette's colours, two too close);
  `&sheet=` keeps a sheet's house beside the panel (`&frames=none` for a suite's own cards); its memory look applies
  the house's charts as Home Assistant does. `interactions-panel.mjs` proves the tab, a card on the page redrawn in the
  style chosen, the rows by style, motion off, the eleven gauge tiles and the Waves row, a set's whole life — its
  picker, its marks, a swatch stored by name and a hex under Custom fixed, a navy lifted on the dark card and a cream
  deepened on the light one — and a palette chosen recolouring a set that follows it while a set of hexes stays;
  `panel.test.ts` proves the settings file carries the charts and their sets. `measure-all.mjs` reads
  `panel-charts`, `panel-charts-styled` and `panel-charts-editor`.
- The Chart card's chunk, `chart-card` (budget 16 KB), beside the engine's, its English a part of its own
  (`en/chart-card.json`, namespace `chart-card`): `chart/chart-card.ts`, `chart/config.ts`, `chart/data/` —
  `attribute.ts` (the lists), `statistics.ts` (one cache for every chart card's reads, history's too), `sources.ts`
  (history, statistics, forecasts), `span.ts` (the window and its slots). `interactions-chart-card.mjs` and the
  playground's `chart` sheet.
- The energy collection: `energy-model/collection.ts` (`isCollectionKey`, `collectionKeyOf`, `findCollection`, the
  `CollectionFollower` reactive controller, `followPeriod`, `followedMoment`), `energy-model/period.ts` (`Range`,
  `Step`, `stepFor` — Home Assistant's `getSuggestedPeriod` —, `rangeOf`, `fetchRange` with `fetchPeriod` as its
  wrapper, `allocateFollowed`), `costs.ts` (`fetchMoneyRange`, `moneyFromStats`), `fossil.ts` (`fetchFossilRange`,
  `fossilOf`), `power-day.ts` (`fetchMeanSeries`, `bucketMinutes`), `range-words.ts`, `energy/collection-field.ts`.
  The Energy period card's chunk, `energy-period` (budget 16 KB), holds the strip, `energy-period/picker.ts` (the
  presets, `shiftSpan` — Home Assistant's `shiftDateRange` —, `grainOf`, `midnightOf`, `storageKey`) and the Energy
  usage card (`energy-usage/series.ts`: `slotsOf`, `slotEnergy`, `usageSeries`, `foldAt`, `usedOf`, `returnedOf`),
  each with its English in a part of its own (`energy-period-card`, `energy-usage`). The pages' date grid
  (`FluvyDates`) takes `whole-days` and `no-presets`; `StrategyContext.panelUrl`; the automatic dashboards' frame keeps
  a band that leads a view before its columns. Playground: a mock collection as Home Assistant keeps one
  (`SheetSpec.collections`, `?period=today|yesterday|week|month`), `window.loadCardHelpers` making Home Assistant's
  date card, the `period` and `usage` sheets; the `interactions-period` and `interactions-usage` suites.
  `heights.mjs` holds a frame whose spec says `heights: [152, 172]` at half a section too, in every language; the
  measurer reads a control where it is drawn (what a scrolling row clips of it is not there).
- `packages/cards/src/shared/units.ts` is the one module for units and figures (the old `gauge/units.ts` and
  `energy/power.ts` maps fold into it; `history-bars/units.ts` is the energy family's part of it); `figuresOf`,
  `writeFigure`, `scaleNamed`, `askedParts`; `numberFields()` in `shared/form.ts` for the editors, and a list may ask
  its items for their selects' options.
- `shared/since.ts` (`changedAt(hass, view, since)`), `sinceField` and `sinceChoices` in `shared/form.ts`; the rows
  editor applies a card's `choices` to its lists' item forms too (`itemSchema`, cached by the item's form and the
  choices). `listRow` takes a value's glyph (`valueGlyph`) and an icon that is a picture (a `TemplateResult`);
  `choiceField` moved from the alerts chunk into `shared/form.ts`. The Web page card's chunk `web` (budget 8 KB), the
  Items card's `items` (12) and `items-sheet` (8); `web/fixtures.ts` lets happy-dom load frames in the tests.
- A card every page carries keeps its editor — its base fields, keys, lists, defaults, choices and form — in a module
  of its own beside it (`tile/tile-editor.ts`), which its `editor()` fetches with the visual editor (the new `forms`
  chunk, budget 12 KB); a card of a family fetched on demand still declares it on its class. Home Assistant asks
  `getConfigElement()` alone, so nothing it shows changes; whoever reads a card's editor (the tests, the docs
  generator, the unavailable suite) asks `await Card.editor()`; `editors.test.ts` fails a card of `CATALOGUE` that
  declares its editor on its class. Core is 6.3 KB lighter for it.
- Budgets: every page and core 236 KB, as in 1.10 (every page 229.1 KB with the five new cards announced); a
  language's catalogue 28 KB (24 before: the 1.11 cards' words took Japanese, the longest, 320 B over); new chunks of
  their own: `chart` (24 KB), `chart-card` (16), `energy-period` (16), `web` (8), `items` (12), `items-sheet` (8) and
  `forms` (12).
- `tools/render/lib.mjs` exports `everyLanguage()` (the catalogue's languages, English first); the cameras, security,
  rooms and panel suites and `measure-all` derive their language lists and counts from it, so a new language is
  measured everywhere without a list to update. `tools/i18n` names the integration's translation file through Home
  Assistant's code for the language (`integrationFile('pt-PT')` → `translations/pt.json`).
- Every package keeps vitest's module cache in its own `node_modules/.vitest-cache` (`fsModuleCachePath`): the
  workspace's shared cache was emptied by whichever package first saw the lockfile changed, and two packages running
  at once raced over it (ENOTEMPTY).
- The cards' table in `docs/cards.md` says a key the form shows in turns once, with every value.
- Dev dependencies: typescript-eslint 8.72.0, vite 8.3.5, happy-dom 21.0.4, @happy-dom/global-registrator 21.0.4
  (#63).
- The gates run faster: `visual.mjs --jobs N` runs that many suites at once (each one's lines printed together when
  it ends; CI keeps one at a time), as `measure-all.mjs --jobs N` already did.
- The measurer no longer excuses an ellipsis because a `title` carries the cut words: only a person's own text
  (`data-name`, a name's class) may end in one.
- New and stronger checks: the heights gate holds the Chart card's four and six rooms and every gauge, moving or not,
  to one height at 152, 172, 211 and 266 in every language; the chart suite reads the gridlines a card asks for and
  the classic fills' paint (28 % alone, 16 % shared); the panel suite fails on any console error on the Charts tab,
  with and without reduced motion; the web sheet draws a page kept back and a page still loading; the items suite
  holds three aircraft, one, none and out of reach to one height, measured at rest; the settings' export test
  round-trips every chart setting off its default; a view themed Fluvy as Home Assistant themes it
  (`?viewtheme=`, `interactions-view-theme`).

## [1.10.0] — 2026-10-22

### Visible on upgrade

- A light drawn in its bulb's colour shows a white by its warmth: a lit white or colour-temperature bulb takes its
  step on one scale — a candle's the warmest, 2,700 K warm, 5,000 K nearly neutral, daylight neutral, a cool white
  cool — where it was the palette's lit light, on the room lights card (its default), on tiles, a tiles group, a room
  and an entities card where "In their bulb's colour" is on (the card's or the house's), and on the light card.
  `light_whites: palette` gives the old look back (#58).
- On a card with both "in its bulb's colour" and a `color` or `tone` of its own, a lit colour bulb shows its bulb's
  colour, not the card's; an entities card's or a room's `tone` draws its lit lights that show no colour of their own
  (they took the palette's light), and a room lights card's `tone` and `color` reach its tiles (#58).
- A light group on a tile, a row or the room lights card wears its members' colours weighed by their brightness, not
  Home Assistant's own mean of them (#58).
- The room lights card's tiles drop their level where the card says `show_level: false`, and a tile with `tint:
  always` and no colour of its own shows its tone's quiet wash when off — never a status's: a shut door, a clear smoke
  alarm, a dry leak sensor keep the card's surface, and with a colour (their own, or their group's) wash in it as in
  1.9.1 (#58).
- What opens and shuts is drawn as it stands: a garage cover is a garage, shut or open, where the cover card drew a
  car and the other cards the blinds; a gate cover a gate where the cover card drew a door; a window cover a window,
  where it was the blinds; a window on the openings card a window where it drew the blinds; a garage-door sensor a
  garage; and an open door, gate, garage or window — a cover, or a door, opening, garage-door or window sensor — wears
  its open glyph.
- The icon you set for an entity in Home Assistant shows on every card that draws the entity with no icon of its own:
  a list's rows, a camera's, a lock's and an alarm's rows, the heads of the single-entity cards, bars, stat tiles,
  openings, the sensor card and the schedule sheet's targets too. Where Fluvy has a glyph for an entity's kind, an
  integration's icon no longer replaces it on the room lights, scenes, actions, helpers and updates cards, the alerts'
  rows and the Activity page (a button shows the bolt, an update the update glyph); a helper's, a scene's or a
  script's own icon still shows. A sensor or a binary sensor of a class Fluvy does not draw (pm2.5, pressure,
  vibration …) and an entity of a kind Fluvy does not know (a zone, an event …) show Home Assistant's icon for it
  where they showed the trend arrow, the check or the three dots — on the Activity page, its icon for the state it
  changed to; a lawn mower is a leaf (#57).
- Camera rows with a `secondary` say it (the state, the area …) where they said the time of day, and a camera row's
  own `tone` or `color` colours its circle. A camera, lock, alarm or entities row with no `tap_action` of its own
  opens its entity's details where it ran the card's `tap_action`: a card with a `navigate` tap no longer navigates
  from its rows (#57).
- The Security dashboard shows its cameras on one Cameras card: the first four on its overview (two camera cards
  before) and every camera, up to twelve, across its Cameras view (up to nine camera cards before); the home
  dashboard's Security view shows its first four on one Cameras card (up to four camera cards before). The Home view
  and the rooms keep the camera card (#60).
- The card editors show an option only where it acts, and keep its value while it is hidden: the light card's *How
  much colour* only while it shows its colour, how whites show only beside "In its bulb's colour" while that is on (on
  the light card, while no colour or tone of its own stands in for its bulb's), a tile's light colours only for a
  light, a tiles group's and an entities card's only while they hold one, a tile's readouts not under a large tile's
  ruler, a tile's colour at rest only where something shows then (not for a door or a smoke alarm with no colour), the
  room lights card's colour at rest only in tiles, a room's controls, tiles and lights' colours not in a row and its
  picture for the photo alone, the appliances card's picture only for tiles and whole cards, and no rows on a compact
  lock; the room card no longer offers `size` and `readouts`, which it never read (#58).
- On a page that wears another theme than Fluvy (outside the dashboards that wear the look), Home Assistant's own
  elements stay as Home Assistant draws them: its charts (history, statistics, energy, hardware) keep its font and its
  own colour for a series, where they took the theme's body font and primary; HACS's frame keeps its font, with no
  Inter and no shell, until the page wears Fluvy; the settings lists, the more-info title and the dashboards' headers
  carry no attribute of Fluvy's. Pages that wear Fluvy look and behave as in 1.9. `__fluvy.shell.report()` gains Home
  Assistant's version and the patches that stepped aside, with what they threw.
- A lone mini tile declares the 108 px it draws (it declared 76), so the automatic dashboard counts it whole when it
  cuts its columns; a compact or mini tile whose tap and hold are both `none` no longer takes a keyboard stop or a
  press, and looks the same.
- Rows with a template that reads a name that is not defined (entities, lock, alarm, camera, bars, stat tiles,
  actions, helpers) no longer flash an empty line before their words.
- The 3D printer's camera stills pause in a hidden tab, as the camera card's always have, and a fresh one is fetched
  as soon as the tab is back in front (the next one came at the printer's next 5 s or 30 s tick).
- The automations card's count ("1 of 2 on") has words of its own, so a language may count automations apart from
  lights and devices. English, German, Dutch and Turkish say what they said; Spanish, French, Italian and Portuguese
  now agree with their word for automations (2 de 3 encendidas, 2 sur 3 allumées, 2 su 3 accese, 2 de 3 ligadas,
  where they said encendidos, allumés, accesi, ligados). The Preferences tab's language menu has ten rows: eight and
  the top of the ninth show, the rest scrolls.

### Added

- Japanese (`ja`): the ninth language, in every card, page, dialog and editor form, the settings panel's language
  list and the integration's own texts, with three greetings (おはようございます, こんにちは, こんばんは from 18:00;
  おやすみなさい is a farewell and never shows). The automatic dashboard and the appliance cards read a house named
  in Japanese: the naming words take kanji and kana, matched as substrings since Japanese writes no spaces, beside the
  romaji an entity id carries (`shoumei`, `raito`, `sentakuki`, `reizouko`); a full-width name ("ＬＥＤ") reads as its
  letters. The calendar labels a day as a Japanese calendar prints it, 17日（木）, and the measurer lets Japanese wrap
  at any character; where the browser knows Japanese phrases (Chromium 119 and later) a line breaks between them,
  never inside a word (スケジュールを / 追加, where 追 / 加 split the verb), and no other language wraps otherwise.
  The catalogue and the naming words were read end to end by @vinjex, its maintainer, who chose
  where Japanese departs from Home Assistant's words, as the translating guide lists (#54, #56).
- The Template card (`custom:fluvy-template-card`, #59): a tile — compact, mini or large — whose name, line, icon,
  colour and fill are Home Assistant templates, rendered live, with an entity or with none. With an entity it is that
  entity's tile (its icon, tone and state, a large tile's switch, ruler and readouts) and a template reads it as
  `entity`; `active` says when it shows as on (as its entity is, always, never, or as a template answers). Without one
  it is your words alone, and a button for a navigation, a URL, an action or Assist. Until Home Assistant answers, the
  tile shows its entity's own icon, colour and state and keeps a blank line where the words will land; a template that
  fails shows nothing of itself. A Mushroom template card pastes in: `primary`, `icon_color`, `layout: vertical` and
  `vertical: true` are read as Fluvy's (its actions do nothing unless given one, where Fluvy's tile toggles on a tap:
  `tap_action: { action: none }` keeps a pasted card still).
- The Cameras card (`custom:fluvy-cameras-card`, #60): several cameras at a glance, as the reader drew it — each a
  tile of its picture ("Live", a full-screen round) over its circle, its name and what it sees: "Motion detected" or
  "No motion" from the motion sensor on the camera's device (or the one you name), else "Online", "Recording",
  "Streaming", "Offline". Two a row from a 320 column, up to four across a wide band, or the count you ask for;
  `variant: list` (a row a camera) and `compact` (the pictures alone). Its cameras are those you list or every camera
  of an `area`; each picture refreshes itself only while it is on screen, or streams with `camera_view: live` — the
  first `max_live` (four) of them. The head's round opens a sheet of every camera, with a switch that shows them all
  live for now. Show or hide the line, "Live" and the full-screen round; a name, an icon, a motion sensor, a line, a
  fit, a refresh, a colour and actions a camera.
- Eight glyphs: a gate, a garage and a window, each shut and open, a door open, and a security camera on its wall arm
  (the Cameras card's head) — in Home Assistant's icon pickers too, as `fluvy:gate`, `fluvy:gate-open`,
  `fluvy:garage`, `fluvy:garage-open`, `fluvy:window`, `fluvy:window-open`, `fluvy:door-open` and `fluvy:cctv`.

### Changed

- Automations count in their own words: the automations card's "1 of 2 on" has keys of its own, so a language counts
  automations apart from lights and devices (Japanese 2件中1件がオン, where a room's devices read 2台中1台がオン);
  Spanish, French, Italian and Portuguese agree with their word for automations (encendidas, allumées, accese,
  ligadas), the other languages say what they said.
- A white shows its warmth by default wherever a light is drawn in its bulb's colour — the light card, the room lights
  card, tiles, a room, an entities card's rows: `light_whites: temperature` is the default; `light_whites: palette`
  keeps the palette's lit light (#58).
- One rule for every light a card draws: its own colour, else its own tone, else its bulb's, else the card's colour,
  else the card's tone, else the palette's lit light. On tiles, a tiles group, a room and an entities card a lit bulb's
  colour now comes before the card's `color` and `tone` (it came after) (#58).
- A light group wears its lit members' colours, weighed by their brightness, on every card — tiles, rows and the room
  lights card too, as the light card did — and draws again when a member changes (#58).
- Every card draws an entity's icon in one order (#57): the icon the card gives it; else the one you set for the
  entity in Home Assistant — in its settings, or in a helper's, a scene's, a script's or a template's own; else
  Fluvy's glyph for its kind, drawn as it stands; else its integration's; else Home Assistant's own for it. Tiles,
  rows, heads, a camera's and a lock's rows, lists, bars, stat tiles, charts' legends, the schedule sheet's targets,
  the alerts' rows and the Activity page alike. A sensor or a binary sensor of a class Fluvy has no glyph for (pm2.5,
  pressure, vibration …) and a kind of entity it does not know show Home Assistant's icon for it where they showed a
  generic one; one of no class keeps Fluvy's trend arrow or check unless its integration has an icon for it. A lawn
  mower is drawn as a leaf, as the vacuum card drew it.
- What opens and shuts is drawn as it stands, on every card: a door, a gate, a garage or a window — a cover of that
  class, or a door, opening, garage-door or window sensor — wears its open glyph while it is open (or opening) and its
  shut one otherwise. A damper is a fan, every other cover the blinds. A garage cover is no longer drawn as a car, nor
  a window on the openings card as blinds: each is drawn as what it is.
- A row with no tap of its own opens its entity's details — on the camera, lock, alarm and entities cards — where it
  ran the card's own `tap_action` (#57).
- The Security dashboard shows its cameras on the Cameras card: its overview the first four on one card (it showed
  two camera cards), its Cameras view every camera (up to twelve) on one card across the view (it showed up to nine
  camera cards); the home dashboard's Security view its first four on one Cameras card (it showed up to four camera
  cards). The Home view and the rooms keep the camera card (#60).
- The card editors show only what can act (#58): an option that has no effect in the chosen style, or with the card's
  other options as they are, is not shown, and keeps its value for when it does. The light card offers the strength of
  its colour only while it shows one (its own setting, else the house's); how whites show, beside "in its bulb's
  colour", while it is on (the light card's not while its own colour or tone stands in for its bulb's); a tile its
  light colours only for a light, a tiles group and an entities card theirs only while their list holds one, a tile
  its readouts except under a large tile's ruler and its colour at rest only where something shows then (a colour, or
  a tone that washes); the room lights card its colour at rest in tiles alone; a room its controls, tiles and lights'
  colours not in a row, its picture for the photo alone, its colour at rest with tiles alone; the appliances card its
  picture for tiles and whole cards, its rows limit not for whole cards, and the list's head, colours and actions not
  where whole cards hide an empty list; the compact lock card no rows, which it never draws. An editor asks what can
  act of the whole card, its lists too.
- After the HACS review: the patches Fluvy puts on Home Assistant's own elements — the charts' font and series
  colour, the icons Home Assistant draws by path, HACS's frame, the settings lists' glyphs, the more-info title, the
  dashboards' headers, the Activity and History pages — act only where Fluvy is in use (the page wears the Fluvy
  theme or the look covers it, the dashboard on screen wears the look, or the device is a wall), after Home
  Assistant's own code but for two, which are caught the same way: the Activity and History pages draw Fluvy's page
  in place of the panel's render (its state, routes and subscriptions untouched; Home Assistant's page back at once
  on another theme or by the house's choice, and for the session if Fluvy's throws), and a dashboard with its actions
  in one menu lends its root `narrow` for the one call that draws them, before Home Assistant's render. On a page
  that wears another theme, Home Assistant's charts keep its font and colours, its icons their Material paths, HACS's
  frame its own font, the page its background and theme colour — written once more from its theme when the page
  stops wearing Fluvy, since Home Assistant wrote them while Fluvy's sheet was still on — and nothing of Fluvy's is
  written on Home Assistant's elements, the frame's mark on `<home-assistant>` included. A patch whose part throws (a
  Home Assistant release reshaped what it reads) steps aside for the session, in its own document (one that fails in
  HACS's frame stays on the page, and the other way round): Home Assistant's code goes on alone, the console says so
  once, and `__fluvy.shell.report()` lists it with what it threw, beside Home Assistant's version and the releases
  this build was checked against (2026.9–2026.10) — a note, never a stop.

### Fixed

- The Activity page's line runs through the middle of every circle on a 12-hour clock too: on a desktop, where the
  time column widens for "9:50 PM", the line ran 20 px left of the circles (the phone's layout, with no time column,
  was right). The playground takes `?clock=12` to draw Home Assistant's 12-hour clock.
- A dropdown of ten rows or more (the Preferences tab's language menu, with Japanese) shows eight rows and 24 px of
  the ninth, not eight and a half: the menu stays on the 4 grid, and the cut row still says there is more.
- A sheet draws for the width it was laid out at: the alerts sheet and the schedule sheet read their content width
  while they render, which before their first layout is the design's 360 — on a slow device nothing had laid them out
  by the time their fonts settled either, so in a 266 column their rows kept their circles and their long lines and
  ran past their rows, and the snooze chips were cut. Each now watches its own width and draws again when the one it
  drew for is not the one it was given (the measurer caught it on a loaded CI runner).
- A reading named by its device, in no area, keeps no separator the sensor words leave at its ends: 「寝室：温度」 is
  寝室, 「キッチン温度・湿度」 キッチン and "Hall · Temperature" Hall (it read "Hall ·"); an entity's own name, with its
  device's name taken off its front, sheds one at either end.
- An appliance's name with a word of what is never an appliance is none, even where a longer kind's word overlaps
  that word: 全自動洗濯物たたみ機 folds the laundry (洗濯物) and is no washer, though 全自動洗濯 is a washer's word.
- Where one of a list's naming words begins a longer one, a name is read by the longer ("secadora de roupas",
  "frigorifero", "Hausverbrauch", not "secadora", "frigo", "Haus"), so the word weighs its whole length against
  another list's word that overlaps it: a shorter stem listed first no longer hides the longer from the matcher.
- A camera card's rows say the line they are asked for (`secondary`: the state, the area, an attribute, a template, or
  none) where they always said the time of day; a row's own `tone` or `color` shows on its circle (#57).
- "Each light in its bulb's colour" shows white and colour-temperature bulbs too: a Hue (or any bulb) in colour
  temperature was drawn as the palette's lit light — in some palettes close to an off tile — and now shows its warmth,
  a step of one scale from a candle's to a neutral daylight and a cool white (2,700 K and 4,000 K no longer one
  amber), on the room lights card's rounds, chips and tiles, tiles, a room's tiles and lights row and an entities
  card's rows (#58). In the card editor's preview too: the lit fill was there all along, only the colour was not.
- The room lights card's tiles take the card's tone and colour where a lamp shows none of its own, and say no level
  where the card shows none (`show_level: false`), as its rounds and line do (#58).
- A light's own colour in the room lights card's editor shows none chosen where it said Primary, which it never drew:
  left empty, a light wears its bulb's colour, else the card's, and the line under the field says so. The same for a
  tile's colour in a tiles group or a room and a row's on an entities card (#58).
- Two cards of one lamp that show whites differently (`light_whites`) no longer borrow each other's white for the
  moment a tap waits for Home Assistant: each remembers the colour it drew (#58).
- A room's lights row counts each lamp once: a light group in the room with its members was counted twice in its
  colour, once itself and once through them (#58).
- A tile asked to show its colour at rest (`tint: always`) without a colour of its own shows its tone's rest wash, as
  a light card at rest does, where it showed nothing — never a status's: what says a warning when it is on (a door, a
  window, a garage door, smoke, gas, a leak, a problem) keeps the card's surface at rest (#58).
- A lone mini tile declares the 108 px it draws, as a group of mini tiles does; it declared a compact tile's 76, so
  whatever reads a card's height before drawing it (the automatic dashboard cutting its columns) counted it short.
- A compact or mini tile whose tap and hold both do nothing is no longer a button that does nothing: the keyboard no
  longer stops on it.
- A row's template that reads a name that is not defined no longer blanks its line for a moment before its result:
  Home Assistant says such a name as a warning before the result, and Fluvy took the warning for a failure.
- Home Assistant's icons in a smaller circle (a compact row's, a narrow head's) are drawn at the 16 Fluvy's glyphs are
  there, not at 20.
- The 3D printer's camera stills pause while the tab is hidden, as the camera card's do, and a fresh one is fetched as
  soon as the tab is back in front: the printer's interval kept ticking unseen, and the next still waited for its next
  5 s or 30 s tick.

### Removed

- The room card's `size` and `readouts` options, which it never read: gone from its editor; a dashboard's YAML that
  has them still loads, and they still do nothing.

### Development

- One matcher reads a name among the naming words' lists (`packages/cards/src/shared/words.ts`): where lists compete
  — a switch's light words against the appliances' kinds and what is never an appliance, the kinds against each
  other, a reading's energy roles, a place against the house's words — every list is run and of two words that
  overlap in the name the longer wins, whatever the lists' order (電気ケトル is a kettle, not the light 電気; ガスレンジ
  a hob, not the microwave レンジ; オーブントースター a toaster; "hair dryer" no dryer), so a stem needs no lookaround
  against a longer word another list carries; words that stand apart keep the lists' order ("wine fridge" stays a
  wine cooler). An appliance card asks what is never an appliance first, alone. The generated regexes capture the
  stem they find, as the first group that takes part in the match (#55).
- The naming words' build orders each alternation (`ordered` in `tools/i18n/src/build.ts`): a stem is tried after
  every longer stem that begins with it, the listed order kept otherwise and a stem of its own regex never taken for
  the shorter, so stems that nest need no care in the words (94 such pairs across the nine languages were reordered).
- Every page loads 5.2 KB less for the same cards: a card declares its height from its config alone (`static
  layoutHeight(config)`), and what the house adds — an entity's capabilities, options and names, a room's contents —
  the automatic dashboard reads in a chunk of its own (`house-heights`, which the strategy imports: `houseHeightOf`),
  the heights it plans unchanged to the pixel; the Activity and History pages' period, layers, CSV and chrome's sheet
  travel in the pages chunk, the player's sheet with the media family, the energy sheet with the energy family; the
  gauge's signed ring is drawn by the solar sheet the gauge adopts, which leaves every rule on every element where it
  was. The render tools read a card's height as the dashboard plans it (`HOUSE_HEIGHTS` in
  `tools/render/lib/suite.mjs`). With the Template and Cameras cards announced, every page is 232.1 KB of its 236.
- Budgets: every page and core 236 KB, as in 1.9; the energy family 80 KB (76: its sheet), the pages chunk 12 (8: the
  pages' period, layers, CSV and sheet), the devices family 36 (32: the Cameras card); new chunks of their own: the
  house's heights (`house-heights`, 4 KB), the cameras' sheet (`cameras-sheet`, 8), the Template card (`template`, 8)
  and the icon set's other part (`icons`, 4).
- Dev dependencies: happy-dom 21.0.3, Vitest 5.0.5, Playwright 1.64.1, eslint 10.13.0, Prettier 3.9.10,
  typescript-eslint 8.71.2, @types/node 24.19.2 (#51, #52, #53).
- The leak scan runs in CI, in a job of its own, on every pull request and every push to `main`: a red scan is seen
  the day it turns red, not at release.
- `when` on an editor field, a row of fields (`onlyWhen`) or a rows-editor list; `visibleFields(schema, data, hass)`;
  `pickFields` asks its test of the item (`byName` for a test by name); the editors' contract holds hidden fields to
  every rule and never lets one be required; `lightColourFields()` in `shared/form.ts`. `docs/development.md` gains
  "The editors". A `when` is asked of the whole card, its lists too (`ha-form` still holds none of them): `listed(data,
  key, alias)` and `holdsLight(key, alias)` read a list; `tintsAtRest` (a card of one tile) and `washesAtRest(tone)`
  (`shared/colour.ts`, the tile's rest wash too) say what shows at rest; `accentField(…, { bulb })` has no default, and
  the shared item helpers say what the item wears while none is chosen; `lampsOf` (`shared/light.ts`) counts each
  lamp of some lights once.
- The camera's picture is one feed and one plate (`camera/feed.ts`, `camera/plate.ts`): the camera card, the 3D
  printer and each tile of the Cameras card are built on them; the stream holder watches the part of a card its
  stream plays in (`watch`), so each tile of a card counts as on screen on its own. `renderPlate` draws a plate
  without its own button, its "Live" or its round where its card has no use for them (a tile's button covers its
  whole tile); `plateLayout` holds "Live" alone on a plate with no round. `onItsDevice` (`shared/battery.ts`) finds
  an entity's sibling on its device — the battery, and now `motionOf` (`shared/motion.ts`, in the devices chunk).
  `camera/status.ts`: a camera's line, its words and how it fits.
- `interactions-cameras.mjs` (tiles' stills per tile on screen, streams per tile kept across a scroll and released,
  `max_live`, full screen per tile, the sheet's switch, "Live" folding by tile width and in nine languages, a
  `native` row levelled at its tallest camera, a failed stream said on its tile's line); the unavailable twins hold the
  Cameras card; the security suite counts the live card's sessions after every camera has been seen. The playground's
  `ha-icon` and `ha-state-icon` draw the Material icons the sheets, the houses and the demo name, and Home
  Assistant's icons for the classes the sheets draw that Fluvy has no glyph for, from `@mdi/js` (a disc for anything
  else), drawn again when a card hands them another icon.
- One order for an entity's icon: `iconOf(view, own)` and `glyphKnown(view)` in `shared/domain.ts`, at every call
  site (the helpers card's own `iconOf(view, row)` is gone, and the lights', scenes', actions', updates', alerts' and
  Activity's hand-made orders with it); `EntityView.registryIcon` (the person's, and the icon a helper's, a scene's,
  a script's, a zone's, an old group's or a template's own settings hold: `OWN_SETTINGS` in `core/src/entity.ts`),
  `ownIcon` (the integration's `attributes.icon`) and `translationKey` (the registry's `translation_key`);
  `glyphKnown` keeps the stand-ins for an entity of no class unless it has an integration's icon or a translation
  key. `stateIcon(entityId, state)` in `@fluvy/ui` (`ha-state:<entity id>=<state>`), which `icon()` draws as
  `<ha-state-icon>` with the state as its `stateValue` and the rest read off the `hass` of the element that renders
  the circle (Home Assistant 2026.9's element reads the rest of the house from its contexts): an Activity entry
  draws Home Assistant's icon for the state it had.
- The outlined icon set in two parts: the six appliance icons left core for an `icons` chunk (2.1 KB), the new
  garage, gate, window and open door with them, that `getIcon` and `getIconList` fetch, a failed fetch drawing
  nothing; `iconNames()` is async;
  `tools/icons/outline.py` writes both modules, and the extractor runs on `node` (no `tsx`).
- `cards/src/shared/light.ts`: `lightLook(item, card, glow)` (the one rule, a colour and a tone), `litColour(view, on,
  whites, hass)` (was `glowOf`; a group's members found in the house), `memberIds`, `withMembers` (what a card of
  lights watches); a tile's `showsLevel()`; `.fv-tile--inner[data-surface]` keeps a tone's hairline. Tests:
  `shared/light.test.ts`, `light/tint.test.ts` (the rule flipped, whites, groups, a tile at rest),
  `lights/lights-card.test.ts` (new), the tile's, the room's and the appliances' editors; the playground's lights
  sheet (whites by their warmth, a cool white, a group, a dimmer, the theme's light, tiles in the card's tone) and the
  lights and colours suites.
- A lit white is marked as one (`WHITE` in `@fluvy/core`: `white #rrggbb`, Home Assistant's own colour for its
  temperature) and derived on the whites' scale, `accentFamily(seed, colors, pick, white)`: its hue, its chroma its
  share of a candle's. Tests over a ladder of 2,200 to 8,000 K (`tokens/__tests__/accent.test.ts`: the gates on every
  palette, the order and every step a step in Linen and Dusk, light and dark); the playground's whites as Home
  Assistant reports them (`whiteRgb`), from a candle to a cool one in a frame of their own.
- One `wrap()` for every patch on Home Assistant's elements (`packages/core/src/shell/patches.ts`, with `inUse()`,
  `guard()` and `CHECKED`, whose floor a test holds to `hacs.json`); tests per wrap (not in use, in use, a part that
  throws, a patch aside in one document and on in another) and a new `shell-patches.test.ts`; the built-bundle suite
  (`interactions-built.mjs`) loads the real build on a page that wears another theme, with stand-ins for the wrapped
  elements, and checks that nothing of Fluvy's reaches them until the Fluvy theme is applied; and, with the look on
  every page, replays Home Assistant's `_applyTheme` from the Fluvy theme to another and to its default: the page's
  background, its theme colour and the frame's mark end as that theme leaves them.
- The tile says what it shows through two hooks, `look()` (its name, what a reader hears, its icon, its skin, its fill,
  whether its line is the person's words) and `tileLine()`; its switch, ruler and flip follow the entity (`lit`), its
  fill the look. A card built on the tile (the Template card) changes only those.
- `TemplateTexts` ignores `level: 'WARNING'` events (Home Assistant's `handle_render_template` hands its `log_fn` the
  logging level's name; under `strict: false` an undefined name is a warning and the result follows).
- The playground's Jinja learns `{% if %}`/`{% elif %}`/`{% else %}`, arithmetic (`+ - * / //`, a sign and parentheses,
  bound as Jinja binds them: Mushroom's `(state_attr(entity, 'brightness') / 2.55) | round(0)`), comparisons,
  `and`/`or`/`not`, the inline `if`, `upper`/`lower`/`title`/`capitalize`, works out only the branch it takes, strips
  its result as Home Assistant does, and says an undefined name as a warning before the result; a `template` sheet
  (eleven frames) and its interaction suite (`interactions-template-card.mjs`); the unavailable suite draws the Template
  card's twins. The public demo shows the Template and Cameras cards' sheets, and draws the Material icons the
  playground does.

## [1.9.1] — 2026-10-20

### Fixed

- The integration no longer touches the disk on the event loop: when Home Assistant reloads its themes and Fluvy's
  is not loaded, the look for its file (and the write that puts it back) runs in an executor, so a slow SD card or a
  network mount never stalls Home Assistant (HACS review, hacs/default#11332).

## [1.9.0] — 2026-10-19

### Fixed

- A room card no longer says "Nothing in this room yet" while the room has a reading: the temperature and humidity
  sensors chosen in the area's settings are read even when they are hidden or diagnostic, the card's own
  `temperature_entity` and `humidity_entity` (and tiles asked for with `controls: tiles`) are always drawn, a sensor
  whose state arrives after the dashboard opened (Home Assistant restarting) shows up without a reload, the working
  sensor is read when another of its kind is unavailable, and a room with only a thermostat shows its temperature (and
  its humidity where the thermostat measures one); an empty room keeps its photo or its head, its chevron, its tap and
  its hold, and an administrator sees why it is empty ("2 hidden or diagnostic entities · choose its sensors in the
  area's settings", three lines at most, the way to the settings leaving first in a narrow column) (#39).
- A room counts what is on once: its "Devices on" readout counts what its "All devices" row counts (a heating thermostat
  is on), so a room with only a thermostat no longer reads "0 of 1" above "1 of 1 on"; and its tile card gives its icon
  to a name that would be cut beside it ("Living room…" at the narrowest width now reads whole) (#39).
- Colours are right on the first frame, on every card: wherever Fluvy's look does not reach a card (a dashboard not
  named `fluvy-*`, and its card editor) the card worked out its colour, its surface and its items' colours on the
  default palette until it was attached again, and in the editor on every edit; every card now wears your palette
  from its first frame, and the editor's preview looks again whenever its dialog takes or leaves the look (#40).
- Blue-grey turned violet, blue or green on Iris, Volt and Mint, and white took a near-black icon on the electric
  palettes (#40).
- A card's tap no longer goes with its icon: the whole head (the icon, the name, the line under it) is the card's
  button on every card, so a lamp in half a phone's section, whose icon gives way to a long name, still opens or
  toggles; the switch and the "…" button in a head keep their own tap, a slider is never a tap, a mouse drag never
  taps, and the keyboard reaches it (Tab, Enter taps, Shift+F10 holds) (#42).
- A large tile holds: a long press on it runs its hold action instead of its tap, and its switch is no longer inside
  a button; a media player's art and words, the now-playing strip, a greeting without its avatar and a room's photo
  and row take the tap and the hold too, and an unavailable large tile keeps its readings (as dashes) and its switch
  (#42).
- History bars: a day counter whose reset comes as two writes (two inverter counters summed by a template) read its
  midnight twice as Home Assistant counts it, every night, in the Energy dashboard too; with `reset: day` the card
  reads it by its readings, and today follows the sensor live (33.3, not 51.2) (#45).
- History bars: a read of the recorder that failed was kept for the rest of the hour as "No statistics yet"; it now
  says it could not read the recorder and asks again a minute later. On their own row the readouts' second cell lost
  32 px to a gap it does not have, so a figure with its unit could spill out of it at 211 px.
- History bars read in the unit a typical bar reads in: a day Home Assistant counted twice (a restart's whole reading
  counted again) reads "18,280.2 kWh" beside its ordinary days in kWh, which no longer read "0.0 MWh"; and a scale never
  runs to five intervals, the next nice step taken instead.
- Water and gas: a meter that read a little less than an hour ago (a dip) was taken for one that had been reset, and
  today jumped by its whole reading; a fall below 90 % is a reset, as Home Assistant counts it, a smaller dip a dip.
- A compact thermostat in half a section no longer puts its − and + over the temperature: the readout stays at its
  size and the buttons sit centred under it, two thermostats side by side draw the same size whatever their values
  (9,5 next to 19,5), nothing moves when you step past 10 or turn the device off, and in a narrower column (a phone at
  150 %) the temperature stands alone and opens the details (#46).
- The thermostat's modes keep the order you gave them: the editor's list is now chips you drag into order, offering
  your thermostat's own modes, and unticking a mode no longer reverses the rest (HomeMatic's "Auto · Aus"); the
  alarm's modes work the same way, and the line under a thermostat's name no longer repeats it when the area has the
  same name (#46).
- At 211 px and in half a section no control leaves its card: the fan's −/+ (42 px out in German), the cover's tilt
  and side column and the timer's buttons go under their reading, the dial's ring takes its size from the column,
  German "Relative Luftfeuchtigkeit" no longer runs onto its figure ("Luftfeuchte" where the long word does not fit),
  and a timer's name stays whole in half a section.
- The alarm's keypad works in the narrowest column (broken since 1.7): there a typed code lit no dot and Disarm stayed
  disabled, because the line under the sheet's title ("Enter your code · 29 s") was shortened in a way that stopped the
  sheet from drawing anything after it; the line now gives way to "Enter your code" before it is drawn.
- An empty list is no longer a configuration error: the bars, entities, tiles, updates, stat tiles, helpers,
  distribution, actions, scenes, openings, chips, map, people, readouts and room lights cards show their head and an
  empty panel in their own words while a filter (auto-entities) matches nothing, and their rows the moment it does,
  on the same card — before, the error stayed even after the filter found something; only a list that is not a list
  is still an error (#48).
- Lists handed over by auto-entities: the bars and stat tiles read its `entities` key, the updates, map and heading
  cards read lists of objects (`{entity: …}`), every card watches the ids of such a list, and section titles and
  dividers among the matches are skipped instead of drawn as missing entities (#48).
- A readout's own `tap_action` runs (it was dropped), and the helpers card at narrow widths no longer lets a switch,
  a time, a date or a long select's value run past its row or get cut to "0.": the rows give their circles to their
  names first.
- A card keeps its size while its device is unavailable, unknown or missing: it draws its live anatomy — its circle,
  its name, its state, its readouts as "—", its controls disabled (a switch faded like the stepper beside it, never
  drawn as a live Off) — instead of a short row or one quiet line, so a grid of cards no longer jumps when a device goes
  offline (a 3D printer's large tile beside three live ones was the case that showed it); only its colours change.
- A thermostat, fan, cover, robot vacuum, lock, alarm, humidity card or timer whose entity is missing (an integration
  still starting after a restart, a renamed entity) no longer shrinks to one line: it draws its whole card with its
  controls greyed out and keeps the modes, presets, speeds and features it had when the page last saw it (one the page
  never saw draws its usual parts: a thermostat the modes you configured, or Off · Heat · Cool; a fan its speed, ruler,
  Oscillate and Direction; a cover its position and Open · Stop · Close; a robot vacuum Start · Stop · Return to dock
  and its battery); out of reach a thermostat's mode tiles no longer show the temperature they last ran at, a humidifier
  is shown neither off nor running, the helpers card keeps a number's slider and a select's options, a robot keeps the
  readings you configured, a lock its Open button and a room of lights its switch, greyed.
- Sensor and energy cards keep their size while their entities are unavailable, unknown or missing: the sensor card
  keeps its curve, axis and statistics (a tile its spark), the gauge its ring, range and row, history bars,
  production and meters their history, the weather its hours and days ahead, batteries the time beside their charge,
  the balance its rows, the score its low-carbon ring, the car charger and the energy card their whole card; a
  sensor that is no longer in the house is read as the recorder kept it, so its bars and its day stay; stat tiles
  never wrap a figure (where half the card would cut "21.5 °C", the tiles go one a row).
- Energy card: a sensor that is not there no longer shrinks the card to one line; it keeps its head, "Right now —",
  the chart's room, the hours and the legend, as an unavailable one does.
- Players, calendars, clocks, to-do lists, cameras, 3D printers, update lists, people, maps, openings and automations
  keep their size while what they show is unavailable, unknown or missing: a player's seek line, rounds and volume
  still; a calendar's grid and its rows as still bars (and at its size from the first frame while it is still
  reading); a printer at the size of a job, its time left, layer and trays no longer moving the card as a job counts
  down; a clock's forecast row as dashes (two and one where German or French labels would overlap); a to-do list's
  declared five rows before its items arrive; the now-playing strip no longer leaves an empty row above its artwork.
- A player's seek line and the now-playing strip's progress stay in place while nothing has a length (idle, off, a
  radio stream): the card no longer grows when a track starts.
- The light card's colour field shows *State* (it follows the light) instead of *Primary*; choosing Primary now gives
  the theme's accent (it showed the lit light), the card's `tone` is honoured (it was ignored), the cool quick colour
  reads as a cool white (it showed as peach cream), a colour bulb's card compact by its width keeps a row of its quick
  colours, a light card that cannot be read keeps its size and controls, on a card with a `card_color` the rounds, the
  − and +, options, chips, inner tiles and resting circles take a deeper step of the card's wash instead of the page's
  colour (on Volt's light palette too), and the room lights card shows the colour a light last glowed the moment you
  switch it on.
- Someone who is not an administrator saw an empty automations list with `show: schedules` and with the Schedules
  chip; their schedules are listed now, with the clock, and an administrator's no longer flash as plain rows before
  their settings load.
- The schedule sheet: an end you have not set follows the start (a sunset start no longer ends at 16:00), "At a
  time" comes back to the time it had, a target that shares no action with those chosen is no longer offered (so
  "Do" is never empty), a name suggested before anything is chosen no longer starts with "·", a long name in an
  empty card's panel breaks inside it, the Workdays and Custom tiles' second line reads as a word, and German says
  "Werktagssensor", Brazilian Portuguese "Reprodutores".
- Escape in a schedule sheet or a keypad inside a Bubble Card popup closes only the sheet, and dragging the sheet no
  longer slides the popup closed.
- The schedule sheet's off switches show their thumb in dark mode: the sheet, the alerts' sheet and the keypad wear
  their card's mode (the "Until" switch was 1.05:1 on its track since 1.8.0).
- "Tap again to delete" and "Tap again to confirm" read under a mouse pointer: an armed button wears the danger's fill
  and its ink on every palette (it was 1.12:1 in dark Linen with the pointer on it).
- A room's name pill in half a section drops its icon before the name runs out of the photo, and the room's and the
  fan's rows give their icons to their words in a narrow column (French "Lumières", "Oscillate" at 211 px).
- A tile's two readings share its foot only where both labels and both figures hold in their halves (German
  "Leistung" and "0.8 kWh" in half a section); a month's name in a narrow calendar takes its short form; a player's
  sources lay out two a row where three would cut a name; a head's circle gives way only where that makes the name
  whole.
- The History page's date picker says From and To (Von and Bis, De and À…) instead of the raw "from" and "to" it
  showed in every language since 1.8.0.
- The settings panel keeps its words inside their buttons and chips on a narrow phone: where the apply bar's two buttons
  do not hold half the bar each, they take the whole width one under the other (French's "Appliquer à la maison" ran
  over "Seulement pour moi" at 360, German's "Für das Haus übernehmen" out of its button at 412), and a row of choices
  goes two and one rather than cut a word (pt-BR's "Quando ligado", Spanish "Al encenderse").
- In a narrow column a label no longer runs onto its figure and a side readout no longer leaves the card: the energy
  card puts its cost under the reading, the production card its forecast and the humidity card its dew point where
  the two cannot stand side by side, and the production card says "So far" where "So far today" would not fit (German
  and French at 211 and 266 px, and half a section).
- The gauge's min · max · average take as many columns as hold them, two and one in half a section, where they stayed
  three and ran into each other (a unit past its figure at 211 px); in every row of statistics the last one, alone on
  its row, is measured against the whole row, so three go two and one before they go one a line.
- Every card's declared height (`layoutHeight`) says what the card draws at a 360 column, so the automatic
  dashboard's columns end level and the sections grid places cards without gaps: the thermostat counts its presets,
  fan speeds and modes, the fan its oscillation and direction rows, the cover its position or its tilt, the vacuum its
  readouts and commands, the lock its latch, the alarm its modes, the media player its sources, the weather its
  forecasts, the clock its forecast row, the light its bulb, the room what its area holds, the helpers their rows by
  kind, the updates what waits, the appliance card what its appliance draws (its kind from its device, a hob's rows of
  plates, a fridge's compartments and steppers, the quick modes, buttons and programmes it has, a second drum's line)
  and the appliances card's whole cards each theirs, and every list, legend and row of readouts what it lays out by
  measure; the automatic dashboard reads the house when it measures.
- History bars' figures are rounded free of float noise: a sum that lands a hair off its half (10.45000000000072,
  11.049999999999265) rounds by the same rule as the figure people read.
- A camera card put back off screen (another view, a scroll away) stayed attached and played on with no countdown to
  take it out; it now waits for the viewport's word. A stream's retry wait only ever grew; a stream that played resets
  it to a minute. A live card whose stream could not play now says "Stream unavailable" instead of showing "Live" over
  its stills.
- A 3D printer's camera stills kept refreshing while the card was off screen.
- At 211 px the clock's hero drew its period past the column (the unit was never dropped), the side clock's time ran
  past its card beside the smallest face, the weather hero's unit ran past the card, the vacuum's "Remaining" readout
  was cut, and the keypad's keys sat 2.5 px past the sheet.
- The calendar, the clocks, the weather and the to-do list say every word and figure whole at 211 and 266 px in every
  language. The week strip takes the narrow weekdays where the short ones would run together ("LUNMARMER"); a month's
  head says "KW 38", "Sem. 38" or "Sett. 38" where "Semana 38" would be cut; the agenda's next day reads "2 événements"
  rather than "2 événe…"; an event's place may end in its ellipsis as a name, and an upcoming event keeps its time whole
  ("Toute la journée"); "Could not load events" wraps at its words; an all-day event's "Journée / entière" no longer
  runs into its tone bar.
- A clock's caption gives its sky the short word ("klar"), then lets it go whole after the date ("klare N…" before), and
  a weather out of reach says "Offline" where its long word would be cut; the side clock says "Aufgang 07:31" where
  "Sonnenaufgang 07:31" would be cut, its face yielding to it, and leaves the line where not even that holds; a date
  without room for its weekday drops it ("18 de set.").
- The weather's day rows keep a rain chance whole ("Schauer · 60 %", never "6…"), and run the condition under the
  figures where the language's longest would not hold beside them; the hero's label takes the hero's width where a word
  would otherwise break inside ("DESCONHECID/O"); the compact head lets its glyph say a condition the line cannot hold
  ("Partiellement nu…" before). The to-do list says "3 left" where "3 of 5 left" would be cut (Turkish "5 maddeden 3
  k…").
- Controls and lists say every word and figure whole at 152, 172, 211 and 266 px in every language. A count takes its
  short form where its words would be cut ("3/4 encendidos", then "3/4", on the lights and automations cards); the
  lock's and the alarm's "32 dagen geleden door Marta" lets who did it go first, then says "32 d geleden"; a compact
  light or fan whose state would not hold beside its switch (Spanish "Encendida" in half a section) says its level, or
  keeps the line's place empty — the switch says on or off; "Entity not found" is "Not found" on a light's head and in a
  bars row.
- The actions card no longer breaks a name inside a word ("Resta/rt HA" at 211 px, in English too): the play gives way
  first, as it does side by side, then the glyph — decided from the column, the names and the language's "ran 07:00",
  never from a state; a line that would not hold says what the action does over when it ran, the first a name that may
  end in its ellipsis, the time never cut.
- The helpers and updates cards keep a name its room beside what ends its row: every end counts (a chevron, "Up to
  date", Install), the circles give way first, and where even the bare row cannot hold the name — or its line — the
  button or the state goes under it (German "Installieren", the sun's "Above horizon"). Names and lines wrap at their
  words, never inside one ("Announc/e in", "R/outer" before); both heads are fitted, so "Actualizaciones" takes its
  circle's room rather than an ellipsis.
- The entities card gives its circles to a row's line as to its name, the line takes its short form ("32 d geleden",
  "hace 32 d"), a state of a few words takes a second line before the line is cut, a state in words is never narrower
  than its longest word, and where not even then the state goes under the words ("Niet gedetecteerd"); a template's line
  is the owner's words, ending in its ellipsis as names do. The bars card's circles give way to "6 panels" too.
- The fan's speed ruler keeps only the words that stand 12 px apart, measured ("Apagado" ran into "Baja" at 211 px); the
  keypad says "Code eingeben" where "Gib deinen Code ein" would be cut, and its head grows with a title of two lines
  (Turkish "Devre dışı bırak"); the schedule sheet steps a title word wider than its line down to 16 px, then takes its
  short word (Italian "Programma"), and its "Ablaufverfolgung" link says "Ablauf" at 211 px; the automations card's
  empty line says "Nothing scheduled yet" where the lamp's name is one word wider than the panel.
- The energy cards say every word and figure whole at 152, 172, 211 and 266 px in every language. A source that goes
  down reads "Grid · unavailable · since 21:35" on the score, the sankey, the balance and the grid as on the flow, and
  the time leaves whole where the line cannot hold it ("Netz nicht verfü…" before); a stale flow says its age alone in
  half a column ("32 days ago", never "Updated 3…"); the day's line is "Today" where "Since midnight" would be cut
  ("Desde…"), "Last 7 days" is "7 days" ("Afgelopen 7 da…"), "Entity not found" is "Not found" on the energy and sensor
  cards and the meters' rows, and the energy score's title is "Score" where "Punteggio energetico" would be cut.
- Energy rows keep their figures: a share is "36 %" where "36 % vom Gesamten" would be cut (the distribution, the flow's
  "64 % of the house", Turkish "Kitchen içinde %43" on energy devices), a meter's check-in is its time ("21:47"), a
  battery's power stays whole ("descargando 500 W"), and a list's circles give way to these words as they do to the
  names (the humidity's "Son 6 sa").
- Labels never run onto their figures: "Right now" is "Now" where it would wrap (Italian "Adesso"), the grid's "Net
  import" is "Import" in half a column ("Importação" over "1,5 kW" before); the energy card's "No history yet" keeps two
  lines broken between words, else its short form ("Nessuna cronologia", Dutch "Geen historie"), and the grid's empty
  panel says "Keine Sensoren" where "Netzsensor" would break. A sankey device gone from the house keeps the room of the
  name it had, so its labels keep their tiers.
- The player's and the now-playing strip's lines and a heading's meta are never cut: a player gone from the house says
  "Not found" where "Entity not found" would be cut, on the strip why it is out of reach takes a second line, the
  strip's names end in their ellipsis while the state after them stays whole, and a heading's meta longer than its share
  of the row gives its words up to the chevron. The appliances and the alerts' sheet say every word whole in every
  language too.
- In a YAML-mode dashboard an unquoted `on` or `off` reaches the card as true or false (Home Assistant reads YAML 1.1),
  so `tint: on` never tinted a light card, an alerts card's `snooze: off` still kept each person's snoozes, the energy
  flow's `motion: off` still moved, a thermostat's `modes: [off, heat]` lost Off, a schedule target's `verb: on` did
  nothing, and an alert's `state: on` or `not_state: off` compared against "true" and "false". Every key whose values
  are words with on and off among them (`tint`, `motion`, the alerts card's `snooze`, a thermostat's `modes`, a target's
  `verb`) reads true as on and false as off; an alert's `state` and `not_state` match the word, and an attribute's own
  true or false still matches as before.
- Counts of one said as one in every language: the calendar's "+1 autre", "+1 altro", "+1 weiterer" and Spanish "1
  anterior" (were "+1 autres", "+1 altri", "+1 weitere", "1 anteriores"), the History page's "+1 autre" and "+1 altro"
  under a chart's legend and the state lines, the alerts card's Italian "1 in più" (was "altri 1"), the updates card's
  head and the room's "All devices" row ("1 no disponible", "1 indisponible"), and the appliances card's head, which
  counts each in its number ("1 läuft", "1 terminado", "1 terminé").

### Added

- The light card can show its light's colour on its whole surface (`tint`: off, when on, or always with a quiet wash
  at rest); `tint_strength` is `full` (a lit tile's fill in that colour, the same on every palette as a tile's),
  `soft`, or `brightness` (as strong as the lamp is bright; a lamp at 10 % still reads lit); the colour is the card's
  own `color`, its `tone`, or the light's — the bulb's colour, a group's lit members' by brightness, or the colour you
  just tapped — and `light_whites: temperature` shows a white by its temperature instead of the theme's light (#41).
- `light_colors` on the tile, tiles, room and entities cards: a lit colour bulb's tile or row in its colour (#41).
- The settings panel's Appearance tab has a Lights card: how lights show their colour where a card says nothing ("Show
  their colour": never, when on, always; "In their bulb's colour" for tiles, rows and rooms); both are off until you
  choose, so nothing changes on upgrade (#41).
- The automations card can be about one lamp, or a few entities: `targets` (edited row by row: the entity, its name,
  icon, and what a new schedule for it does — on or off, open or close, run, a brightness, a temperature) lists their
  schedules and the automations Home Assistant relates to them, says when the lamp next turns on ("Turns on in
  9 h"), and its `+` opens straight onto the lamp with the verb chosen, so `+` then Save is a working timer; two to
  six targets are chips, more are searched; made for a card in a popup (#43).
- History bars read a counter by its readings: `reset: day | week | month | year` reads a counter that starts again
  from zero (a day counter, a monthly rain gauge) by its readings at each hour's or day's end, so a reset or a
  restart is never counted twice or below zero; `reset: never` reads a lifetime meter the same way, the editor names
  a utility meter's own cycle and says what the sensor is (a `total` without `last_reset`); `stat: state` draws the
  reading at the end of each bar (a monthly gauge by month is each month's rain); a sensor with no state class reads
  the recorder's history (`source: history` asks for it always); `negative_color` and `current_color` give the bars
  below zero and the one in progress colours of their own; `unit` converts within energy, power, volume and distance
  (#44, #45).
- Appliances: an appliance card and a list of the house's appliances. Each is found by what its integration says —
  LG ThinQ and LG's older SmartThinQ (read by its device sensor's attributes as well, both known by what they say and
  never by their names, LG's states folded: sleep is off, a rinse hold is paused, night dry a dry; its rinse aid
  level and tub-clean count read as reminders, and the words Home Assistant has no translation for said in the
  house's language), Home Connect (Bosch, Siemens, Neff, Gaggenau), Miele, SmartThings (Samsung), Matter, Whirlpool,
  Tuya, hOn and Electrolux/AEG — or by its name in any of the eight languages, and on a smart plug by its switch and
  power: what it is, what it is doing in Home Assistant's own words, the step of its cycle, the time left and when it
  is ready, when a delayed start begins, when it finished and whether it still waits to be unloaded (LG's washers,
  which power off when done and have no door, included), a door left open, why it failed, what it asks to be looked
  after (salt, rinse aid, detergent, filters, descaling, beans, the drip tray), a fridge's compartments, a second drum
  or cavity, a range's burners named by where they sit. Start, pause, stop, power, a programme and a setpoint are
  offered for the integrations whose services are pinned by their source; the others are shown, never written.
  Switching off an appliance that is not at rest asks first, and a fridge, a freezer or a wine cooler always does (on a
  smart plug it is in operation while switched on, never "done", and offers no "Tell me when it's done"). The
  card follows the reporter's design: a picture of the appliance (a product drawing a kind, or your own photo, or the
  icon), its name and what it is doing, a power button tinted by what it does, then its kind's hero — the time left
  of its whole over a bar, an oven's temperature and its target, a fridge's compartments, a hob's zones, a coffee
  machine's drinks — and three rows under a hairline (the programme, water and energy, a filter to clean, the last
  coffee: never what the hero already says), each part hidden or shown, the rows picked, ordered, named, coloured and
  given actions; the picture gives way before a letter of the name does; every big appliance
  is the same height, so a row of them lines up — one that lacks a row shows its next one, or a dash in its place, and a
  second oven cavity or drum is one of its three rows; the small ones on smart plugs (toasters, blenders and sandwich
  makers too) are rows with their picture and power button; compact, dial and row layouts, steppers for setpoints, quick
  modes, buttons and programmes to choose stay one setting away; "Unloaded" is remembered per finish. A second card
  lists the house's appliances as rows, compact rows, tiles with their pictures, or each as its whole card (`variant:
  cards`), what needs a hand first. The automatic dashboards lay the appliances out as in the reporter's design: across
  Home under its columns, the large ones as whole cards side by side (four across a desktop, as many as fit on a tablet
  or a phone) and the small ones as rows, each band leading to a page of every appliance; every room shows its own the
  same way. "Tell me when it's done": an administrator taps the bell beside the time left and Fluvy writes a normal Home
  Assistant automation that notifies their phone (or Home Assistant's notifications) when the appliance finishes; the
  bell turns it off and on, and a long press then a tap within four seconds removes it. An appliance out of reach keeps
  its card's size, gone from the house too (an integration still loading), with its rows, compartments, steppers and
  buttons; its head is one height whatever it says (what it does sits beside the name or under it by the column, never
  by the words), so a row of them stays level. Six of the kinds join Fluvy's icon set (`fluvy:washer`, `fluvy:dryer`,
  `fluvy:dishwasher`, `fluvy:fridge`, `fluvy:oven`, `fluvy:coffee`) (#47).
- Alerts: `fluvy-alerts-card` gathers what needs a look — low batteries, devices gone unavailable, doors and windows
  left open, locks left unlocked, leaks and smoke, a vacuum in error, updates, lights left on, Home Assistant's own
  alerts and repairs — each from one line (`preset: low_battery`) or a matcher of your own (ids, patterns, domains,
  device classes, integrations, areas, floors, labels, devices, states, numbers, attributes, `for`), and one
  definition drives its count, its list and its buttons. Severity orders them and colours them (critical, warning, info
  — info in the new notice tone: the palette's accent, or its blue where the accent is warm enough to pass for a
  warning: Ember, Sand, Clay, Blaze, Flamingo), a door left open waits five minutes and a lock ten before they show (a
  door walked through never moves Home), an alert can escalate after a while or past a count, and `conditions` take Home
  Assistant's own visibility shapes. Show them as compact or mini tiles, chips, rows under a head, or a banner that
  turns through them; the card hides itself while all is clear. A tap opens the alert's list — each entity with its
  state, where and how long, a button of its own (Lock, Close, Install, Dock, Acknowledge) and the alert's own (Lock
  all, asked first) — and Snooze (an hour, eight, until tomorrow morning or until it changes: the snooze is yours and
  follows you to every device, or stays on this device, or is the house's); a long press opens every alert, the snoozed
  ones with Wake. Home Assistant's repairs (for administrators) and its alert entities are alerts too. Everything is in
  the visual editor, a preset or your own matcher per alert, and the card watches the whole house at the cost of what
  changed (#48).
- Danger, a tone for what is wrong now, in every card's tone dropdown (#48).
- Scales and gridlines on the energy card's charts: by source and the whole house carry a power scale on the left
  (W or kW, negative values below the line, the unit at the side, its words in the secondary ink) with dashed gridlines
  across, and the whole house a 0–100 % scale for the battery's charge on the right, on the same lines; in a narrow
  column the charge's scale goes first, then the power's; `show_axis` and `show_grid` turn them off; `line_width: thin`
  draws every line of the chart 1 px and `stack: false` draws every source from zero on its own instead of stacked;
  reading the chart marks each source's edge with a dot under your finger (a ring round the charge's dot where the two
  would meet), and the by-source legend gives each source's power at that moment (#49).
- Status colours of your own: in Fluvy's settings, *Appearance → Status colours*, the warning, the danger, the success
  and the notice (an alert of severity info) can each keep the palette's colour (Auto, the default, so nothing changes
  on upgrade) or take one you pick — six suggestions, the orange of #47's mockup among them, or any colour. Fluvy keeps
  its hue and only makes it as light or as deep as it must be to read, on every palette and in light and dark: the
  mockup's orange is `#b04c00` on white and itself in dark mode. Every card and sheet takes it at once — the alerts'
  severities, an appliance's reminders ("Clean", "Refill"), open doors and low batteries, every tone dropdown's Warning
  and Danger, the badges, the rows — and so do Home Assistant's own warning, error and success colours. Where two
  statuses would look alike, the panel says so. The house's, set by an administrator (#47).
- The heading card's `heading_style` (`title`, `subtitle`), as Home Assistant's own heading card has it: `title` is a
  page's section title (27/600, its link 16), which the automatic dashboard's appliance bands use (#47); `subtitle`, the
  default, is the heading as it was.
- `show_icon` (`auto`, `always`, `never`) on every card with a head (#42): `always` keeps the circle while the name keeps
  a few letters beside it (a smaller circle where the full one would not fit); beside a switch in half a phone's section
  (152 or 172 px) not even the smaller one leaves the name its letters, so there the name has the row, as with `auto`.
- `show_stepper` on the thermostat, light and fan (without the − and +, the reading of a value row is the card's tap; a
  dial without them is 56 px shorter), `show_modes`, `show_current` and `subtitle` on the thermostat, and in a heat/cool
  range a tap on the low or the high temperature chooses which one − and + change (#46).
- `empty_text` and `hide_empty` on every card of a list: the words an empty card says ("All closed"), and whether it
  steps aside while it is empty (never in the editor); the updates card with `hide_empty: true` steps aside while
  nothing waits, as Home Assistant's own does (#48).
- A card's or an item's colour can also be `primary-text`, `secondary-text` or `disabled` (your palette's inks, as
  Home Assistant's YAML knows them), a hex with an opacity (dropped), `rgb(…)`, or any CSS colour your browser reads
  (#40).
- The schedule sheet's "Until" has quick ends: 15 min, 30 min, 1 h and 2 h after the start.
- The hue ruler of a colour bulb says red, green and blue under their colours.

### Changed

- Visible on upgrade: the Rooms view, the room tabs and the wall include an area whose only reading is a sensor
  named in the area's settings, or a thermostat, and an area listed in the wall's `areas` stays even when it is
  empty; the photo card of an empty room keeps its photo with the empty panel under it, so it is taller than 1.8's
  head and panel (320 px, 352 with an administrator's hint, against 204 in a 360 column), and the tile card of an
  empty room keeps its chevron and its tap (+16 px); the room card's editor shows the variant the card draws and the
  sensors it found, and the automatic dashboard's room subview shows the humidity its area names when the room has no
  other reading (#39).
- Visible on upgrade: black, the greys and white are a ladder — six steps in your palette's own greys, each lighter
  than the one before and never a colour (blue grey keeps a hint of cool); in light mode black is a black icon on a
  grey plate and white an outlined pale disc, in dark mode black is a plate deeper than the card (it no longer turns
  white) and white a bright icon on the lightest plate; a grey you type in (`#000`, `#333333`, `#ffffff`) lands on
  the same ladder by how light it is, and Home Assistant's own `--blue-grey-color` is that cool grey too (#40).
- Visible on upgrade: an item whose colour is `primary` (or `accent`) is your palette's accent, also inside a card
  with a colour of its own (it took the card's colour), and the card editor shows None for a card's surface colour
  (`card_color`) until you choose one (it said Primary, with a blue swatch) (#40).
- Visible on upgrade: a tap on a card's name now runs its tap action (more-info by default), as a tap on its icon
  did; the Actions, Helpers and Automations cards lose their "…" button, the head itself running the tap action you
  set; the lights chips and tiles head flips the room on a name tap (only when a light can be switched or a
  `tap_action` is set); tiles are no longer `role=button` articles but carry a `button.fv-tile__tap` overlay, so
  card-mod aimed at `.fv-tile[role=button]`, `button.fv-ico` in heads, `.md-art-tap`, `.hm-art-tap`, `.md-mini__text`
  or the printer ring row's circle stops matching (#42).
- Visible on upgrade: the media card's artwork gives way in a narrow column (266 px and under, half a section), so
  the title, the source and the controls keep their room.
- Visible on upgrade: compact light, fan, lock, gauge (bar), room (row) and compact thermostat cards take at least
  half a section (`min_columns` 4 → 6); Home Assistant holds a card to its minimum, so one stored at four columns
  now draws at six (#42, #46).
- Visible on upgrade: history bars — the days before a sensor's first statistic are empty, not zero, so an average
  no longer falls for days the sensor did not exist; the average, the highest and the lowest are the finished days';
  today is live, carried on to the sensor's reading on every state change, and the card asks the recorder again a
  minute after each hour and at midnight; means, extremes and readings that do not add up show no total, money or
  equivalents; a sensor with no state class shows its recent history instead of "No statistics yet"; the bar in
  progress is drawn lighter with a dashed edge and the pointer reads it as "Today"; without a head, a tap on the chart
  runs the card's tap action; the scale's ticks and unit are in the secondary ink, as the dates (#44, #45).
- Visible on upgrade: in half a section a thermostat (compact or ruler), a full light, a fan and a timer put their −
  and + (or rounds) under the reading, so they are 56 px taller there (full width is unchanged); the − and + stay on
  the card, greyed, while the device is off or unavailable (they used to disappear), and work in a heat/cool range
  on the end you pick; in a narrow column a cover's Open/Closed words give way to keep the tilt buttons inside the
  card; a water heater's and a humidifier's modes use Home Assistant's own translated names; a ruler thermostat's
  declared height counts its mode tiles (396, was 356) (#46).
- Visible on upgrade: an empty list card shows its head and an empty panel instead of the error card (an error card
  already stuck goes after one reload); the openings card uses its short title ("Openings") where the long one would
  end in an ellipsis and no badge keeps it; the helpers card's rows give their circles to their names in narrow
  columns where a switch or a value's button would squeeze a name (#48).
- Visible on upgrade: a light card with a `tone` draws in that tone (the bulb's colour no longer replaces it), one
  set to `color: primary` or `accent` draws in the theme's accent, a light group's card takes its colour from its lit
  members weighted by brightness with whites left out (it took Home Assistant's mean), a colour bulb's card in half a
  section or on a zoomed phone is a row of quick colours taller (60 px), a light card that cannot be read is as tall
  as the live one, and the quick colours' whites read cool and warm (a pale blue-white, a paler amber) (#41).
- Visible on upgrade: the automations sheet's "Until" shows the quick ends; the empty card says "Tap + to add a
  schedule" only where there is a `+`; the card picker previews the automations card listing the house by name; on
  an existing schedule the sheet's focus starts on the verb it does (#43).
- Visible on upgrade: the generated Home (`custom:fluvy-home`) opens with "Needs attention" (leaks and smoke, open,
  unlocked, errors, low batteries; for administrators also updates and repairs), three tiles and a fold, hidden while
  all is clear; on Home and in the rooms of every template an appliance device (a washer, a fridge, a kettle on a
  plug: what the appliance card finds) leaves the plug tiles for the appliance bands, Home's band headings leading to
  a new "Appliances" subview, not a tab; an appliance's own temperature or humidity sensor no longer counts as a
  room's reading; the energy views are unchanged (#47, #48).
- Visible on upgrade: every card's tone dropdown offers Danger; Home Assistant's icon picker lists six more Fluvy
  icons (the appliance kinds); for an administrator, an appliance's whole card with a finish to hear shows a quiet
  bell beside its figures (`show_notify: false` hides it) (#47, #48).
- Visible on upgrade: energy card, by source and the whole house — the scales and gridlines are on by default, so
  the plot is narrower by their labels (about 40 px a side), the hours are centred on their hour under the plot and read
  in the scales' secondary ink, the "Charged · exported" tag under the line goes (the scale and the legend say it), the
  "100 %" tag gives way to the charge's scale where it fits, the chart's top is the next nice tick above the day's peak
  rather than the peak itself, each band's edge is drawn over the house's line so the top of the stack shows the top
  source's colour, and the "Right now" row is always there ("—" while nothing can be read) (#49).
- Visible on upgrade: out of reach, every card keeps its size and anatomy in the off skin — an unavailable or missing
  thermostat, lock or alarm wears the dashed card like the fan, cover and vacuum, its mode tiles and chips dashed and
  taking no tap; an unavailable scene keeps the scene tile's own shape; a sensor card whose sensor is out of reach
  shows the window it had in grey with its bubble at "now" saying "—"; the media card always draws its seek line
  (idle full card 272 → 352 px, hero +76) and the now-playing strip its progress line (212 px whatever it plays);
  a calendar loading draws four still rows; a clock whose weather is out of reach keeps its forecast row (+60 px);
  offline or missing printers keep the full job anatomy (84 → about 700 px); a to-do list out of reach keeps five
  still rows and reports six to the layout before its items arrive; the updates head says "N unavailable" instead
  of "Up to date"; the energy balance lists a two-way source it cannot read once; the weather says "Not found" for a
  weather entity that is not there; a missing entity the page read earlier keeps its name, unit, classes and
  capabilities.
- Visible on upgrade: a row of three chips that cannot stand in one line goes two and one, the last chip across the
  line, before it goes one a line (thermostat modes, fan presets, the schedule sheet and every other three-chip
  row); a row of statistics (the EV charger's session, the balance's money, the grid's totals, the energy card's
  legend, the flow's totals) takes as many columns as hold its words and figures, two and one in half a column
  instead of one a line under 240 px, and never wraps a word onto its figure; the vacuum's and the cover's commands
  wrap into two full rows rather than draw a button under 44 px; the energy overview puts the battery under the
  house's reading by measuring the two, not under a 240 px column.
- Visible on upgrade: lists keep their circles only while the column holds every name beside what ends its row — the
  grid's price, the distribution's rows, the humidity card's rows, the meters, the entities card, the calendar's day
  rows and the map's rows now follow the rule the fan, room, helpers and updates rows already did.
- Visible on upgrade: the map card has a short title ("Everyone") for a narrow column, as the people card has "At
  home"; where not even the short title holds beside the map round (half a phone's column), both cards keep the title
  whole and put "Map" in a row under the body.
- Visible on upgrade: in a narrow column (half a section, 211 or 266 px) and in a long language, a word that would be
  cut takes its short form instead — "Now", "Import", "Today", "Not found", "Score", "3/4 encendidos", "KW 38", "Code
  eingeben" — a row's value, button or state that would not hold beside its words goes under them, a compact light's or
  fan's state gives way to its level beside the switch, a heading's meta that would be cut leaves its chevron alone, and
  the now-playing strip's names end in their ellipsis while the player's state after them stays whole.
- Visible on upgrade: in a YAML dashboard an unquoted `motion: off` now stops the energy flow and a thermostat's `modes:
  [off, heat]` keeps Off (YAML had read them as false).
- Visible on upgrade: the clock's time steps down a size before a digit or its period is cut (the hero's 64 → 48, the
  side clock's 40 → 32 with its face following it down to a tile's 24, the tile's 40 → 32); the weather hero's figure
  steps down to the readout size where it would cut its unit in a narrow column, and its day rows take short weekdays
  where a long one (Portuguese) would not hold.
- Visible on upgrade: the vacuum's readouts take as many columns as hold their words (two and one in a 211 column);
  the keypad's keys give way on the 4 grid in a sheet too narrow for them; an energy device's modes are tiles only
  while every name holds its cell, else chips, as the thermostat's; the sankey in half a column sets its words in two
  columns, at the start and the end of each tier.
- Visible on upgrade: a sensor card with several curves never draws two of them in colours closer than the palette
  engine's own distance between series (two warm curves on Linen).
- Visible on upgrade: the printer's row with its progress ring is the card's button — its name and its line open the
  printer too, not only its circle, and its round still pauses and resumes (#42, #47); the 3D printer's times (what
  is left, when it is ready, how long ago it finished) are shared with the appliances: the same days and the same
  rules, the printer's own words.
- Visible on upgrade: the automatic dashboard's columns are cut with the house in hand (a thermostat with presets
  and fan speeds, a fan with oscillation, a player with sources are reserved their real height), so columns end
  closer to one line; in the demo home the appliances list and the thermostat move to the first column, the player
  and the to-do list to the second.
- English comes in parts: what every page says stays in the bundle's core, and a family's own words travel with the
  family's chunk — the settings panel's, the History page's and the Activity page's are fetched only when the page
  is opened; the naming words the automatic dashboard reads a house by are build input and no longer ship in any
  language; the wall's words (its way out, its toast, its way back) are core's, so a wall that never opened the
  panel says them; "Traces" is a shared word, so the schedule sheet says it without the Activity page.
- Budgets: every page 236 KB gzip (224 in 1.8: the head as the card's button, the grey ladder, the value row, empty
  lists, the room's contents, the appliances' announcement and icons, the house-aware heights, the status colours of
  your own, every word held whole in every language, less the 9 KB the lazy families' English left core), the energy
  family 76 KB (64), the automations family 20 KB (16), the languages 24 KB (20); new chunks of their own: the
  appliances (51 KB) and their pictures (32), the alerts (24) and their sheet (12), the history bars' readings (8).
- For translators: English is a folder of parts (`packages/core/src/i18n/locales/en/`), every other language still
  one catalogue; the naming words have a file per language (`packages/core/src/i18n/words/`), and the appliance
  kinds' stems beside the strategy's. See `docs/translating.md`.
- Words, from the 1.9 translation review: Turkish says the alerts editor's domains "Etki alanları" (it said "Alanlar",
  which reads as the areas beside it), the unavailable preset "Kullanılamayanlar" as Home Assistant does, "Kompakt
  satırlar", and the appliance editor's "Bölme görünümü" and "Hızlı mod görünümü" no longer repeat the labels above
  them. German: "An einer smarten Steckdose", "Dieser Zyklus", an oven's target "Ziel" throughout as #47's mockup writes
  it ("Ziel 200 °C", "Zieltemperatur"), "Trocknungsgrad". French: a hob's "Allumées : 1 sur 4", "Déverrouillées", "Rien"
  beside a clear alert, a reminder's "OK", a job's "encore 45 min" and "depuis 45 min", and the typographic apostrophe
  in the cards. Italian: "Accese: 1 di 4", "dashboard" (was "plancia"), the severity "Attenzione", "Avvia la
  manutenzione", "ancora 45 min" and "da 45 min". Dutch: the appliance editor's "Rijen" (was "Regels"), "Snelfuncties
  tonen", "Zoals opgegeven" in both cards. Spanish: "Encendidas: 1 de 4", "Nivel de secado", "Iniciar el mantenimiento".
  Brazilian Portuguese: "Ligadas: 1 de 4", "Trava infantil", "Alvo 200 °C", "Temperatura-alvo", and an appliance at work
  says "Funcionando".
- The appliances and the alerts families are fetched as the bundle starts, as the energy family is, and defined as
  they land; each language's catalogue carries their words (about 3 KB more).

### Development

- The measurer draws the widths it measures as cards, the way Home Assistant lays them out: half-section cards at 152
  and 172, full cards at the 211 floor and at 266, phones at their own sections (328 and 380) and a desktop at 360;
  until now it passed window widths and the playground's frame shrank to fit, so every narrow probe drew the same
  176-px card and no card between 176 and 263 was ever measured (which is how a compact thermostat's figure could sit
  under its stepper, #46). It also sees words drawn under a control or over each other (`overlap`), two runs of text
  laid over each other anywhere else (`collision`: a week strip's "LUNMARMER"), a word broken across two lines or a
  figure parted from its unit (`midword`: "Resta/rt HA"), a figure, a unit or a percentage cut by an ellipsis or a line
  clamp (`cut-figure`: "Schauer · 6…") and any other word so cut that is no name (`cut-word`: "2 événe…"; a tooltip excuses a name's words only, never a cut figure or a status line), a pill that
  cuts its own name (`pill-cut`), a line cut by its box with no ellipsis (`clipped`), a catalogue key on screen
  (`raw-key`) and a card head without a free 44 × 44 to tap (`head-target`); a name may end in its ellipsis, the house's
  (an entity's, a device's, an area's, a person's, what a player plays) or a card config's (`name`, `title`). CI
  measures every language at the four card widths in a job of its own beside the English sweep (`pnpm measure:narrow`),
  and `tools/render/measure-fixtures.mjs` holds each rule to a frame drawn to break it and a clean one it must let pass;
  every half-section card has a playground frame at its own size; `tools/render/known-violations.json` lists what a
  later block owns and only shrinks.
- `tools/render/heights.mjs` is a gate: a drift over 8 px between a card's declared and drawn height fails CI
  unless `tools/render/known-heights.json` lists it with its reason; the file only shrinks (`--write-known` rewrites
  it, keeping the reasons), and the interaction suites read the declarations with the house too.
- Every card of the catalogue is held to its live size and anatomy while its entities are unavailable, unknown or
  missing, in every variant and at every card width the measurer uses (`tools/render/interactions-unavailable.mjs`,
  `unavailable.test.ts`), with Home Assistant's own way of writing an entity it cannot reach in the demo home; a card
  that finds what it shows (a room in its area, the house's automations) has only what its config names taken out
  when missing, and one whose rows are what its entities say keeps every row and part but not the live twin's
  height, the reason said. `resolveEntity` remembers, for the page's lifetime, what Home Assistant last wrote of each
  entity's description and capabilities; `button()` in `@fluvy/ui` takes a `disabled` flag.
- `interactions-unavailable.mjs --states never` mounts each card with the ids its config names renamed to ones the page
  has never read, and holds it to the height it declares where the house is not there to say (the fan, the cover and the
  robot vacuum hold; the scenes, helpers and history bars cards not yet, so the state is asked for, not part of `pnpm
  visual`); the appliances card finds the house's appliances in its registries, so missing takes out only what its
  config names, and `@fluvy/core` answers a missing entity's capabilities as a state object (`capabilitiesOf`) for what
  reads states rather than views. The security suite types a code and disarms at 211 and 360; the rooms suite reads the
  tile heads and the hints at 211 in every language; the lists suite holds every list's empty panel to 16 under its head
  and 20 above its foot.
- The playground puts the house's status colours over any page (`?warning=%23dc630b`, `&danger=`, `&success=`,
  `&notice=`; a frame its own with `FrameSpec.statuses`), and `interactions-colours.mjs` checks in Chromium, light and
  dark, that a picked warning reads at 4.5 on its card while the danger stays the palette's; the build gates the
  derivation over every preset, the community's palettes and custom ones, and keeps the notice ΔE2000 5.5 from the
  warning and the danger (`roles/notice-separation`).
- The playground's stand-in for Home Assistant answers its WebSocket from one table (history for every entity asked,
  statistics by period and over a window, `recorder/get_statistics_metadata` from the house, related items, repairs,
  stored data and its subscriptions, backend translations), sheets add their own answers on top, its registries stay
  the same objects as Home Assistant's do, a frame's columns are held to the card's own minimum as Home Assistant
  holds them, a house can be drawn with no frame for a suite that mounts its own cards (`?frames=none`), a dashboard
  that does not wear the look is drawn as Home Assistant does (`?theme=off&fallback=mist`), and new sheets show the
  greys, the unavailable twins, the appliances (with the reporter's mockup beside ours), the alerts and the recorder's
  load (ten history bars and five plug appliances ask under two questions a minute).
- The history bars' gridlines, ticks and unit live in `energy/axes.ts`, shared with the energy card (classes
  `ax-grid`, `ax-tick`, `ax-unit`, were `hb-grid`, `hb-tick`, `hb-unit`); the bundle fails when a family's English is
  found in the every-page code, and a test holds every module that says a family's words to the chunk that registers
  them.
- The history bars suite's recorder-load check failed between 23:00 and 24:00 (its hour crossed midnight and every
  window was asked again); it now runs its hour from a morning of the sheets' day. The public demo lists the
  appliances and alerts sheets. The measurer's ledger of known violations is empty.
- A facts guard (`pnpm --filter @fluvy/docs check`) holds the spelled counts in the README, the docs, the package
  description and the design language — the cards, the palettes, the automatic dashboards, the languages, the panel's
  tabs — to the code, the every-page budget to `finish.mjs` and the chunk table in `docs/development.md` to
  `check.mjs`.

## [1.8.0] — 2026-10-12

### Added

- **Automations** (#33): `fluvy-automations-card` lists every automation of the house — on or off, when it last
  ran — and the schedules Fluvy writes among them with their days, times and next run; rows, compact rows or tiles,
  filters, a fold for long lists. A schedule is a native Home Assistant automation (in Settings → Automations too),
  created and edited in a sheet: what it targets, what it does (on, off, open, close, run; a brightness or a
  target temperature), on which days (every day, workdays by the workday sensor, the weekend, your own), when (a
  time, or sunrise and sunset with an offset) and until when. Only administrators add, edit or delete; everyone
  sees the list, the switch and Home Assistant's dialog on tap. The card comes in its own chunk, the sheet in
  another fetched on the first tap; the words of the family are in eight languages.
- **Quick colours of your own, named and edited one by one** (#37): the light card's `colors` take any colour as
  `#rrggbb` or `[r, g, b]` beside the words, each with a name of its own (`{ color: '#ff2d55', name: 'Lila' }`)
  that its round says, and the editor edits the list row by row — a colour (the words, the picker, or Custom colour
  with a colour well) and a name — in your order, any number of them, with the bulb's default six shown as rows
  until the list is touched. A hex now reads as itself ("#ff2d55", no longer "Ff2d55") and a Home Assistant colour
  as words ("Deep purple"); the row wraps by count (three make one short row, twelve two) and the card's height
  follows.
- **History bars** (#38): `fluvy-history-bars-card` draws a sensor's last days, weeks or months as bars from Home
  Assistant's long-term statistics — the value over each bar on a nice scale with dashed gridlines and the unit
  beside it, the dates under them, the total and the average beside the title (on their own row on a phone), and a
  strip of facts under the chart on the page's surface: the highest, the lowest and the average by default, or what
  the bars come to in CO₂, trees, kilometres and money, a share of another sensor, or a template of your own. The
  readouts and the facts are lists you compose in order, each with its own name, icon, colour, unit, decimals,
  factor and tap action; a bar can be what a meter gained or a measurement's mean, highest or lowest; the day in
  progress joins when asked; a pointer or the arrow keys read a bar's day in the readouts' place. Three layouts
  (`full`, `compact`, `mini`), every part switchable, eight languages, in the energy family's chunk.

### Changed

- The every-page budget is 224 KB (222 in 1.7), the languages' 20 KB (16): the automations family's announcement
  and words and the light's own colours; the automations card and its sheet come as two chunks of their own, the
  history bars in the energy family's.
- Dev dependencies: eslint 10.12, typescript-eslint 8.71.1, Vite 8.3.4, happy-dom 20.14.6, Playwright 1.64,
  @types/node 24.19.1.

### Fixed

- A pill (a chip's width) was fitted by its box rather than its content, and fitted again in the font event itself,
  a frame before the face was usable: a tab row could flicker between filling its line and not — the chips card's
  tabs at a phone's column, seen by the measurer in CI since 1.6. Fitted by the content, in the element's own pixels
  under a zoomed view, a frame after a font lands.

## [1.7.0] — 2026-10-12

### Added

- **The sensor card's own readout can be named** (#28): `label` names the card's own sensor under its readout when
  others share the chart, as an entry's `name` does. Left empty, a readout takes its measure's word ("Temperature",
  "Humidity") when no other sensor on the chart measures the same, else its name beyond the title: a room's
  "Office climate temperature" and "Office climate humidity" read "Temperature" and "Humidity" with nothing set. The
  editor says so under both fields.
- **Colour on the light card** (#32): a colour bulb gets a row of quick colours under its ruler — two whites first
  where it has a temperature, then red, orange, green and blue, or the house's own list (`colors`: `warm`, `cool`, a
  Home Assistant colour name, `#rrggbb`, `[r, g, b]`, or `picker`, a round that opens the browser's colour picker and
  holds a colour of your own) — and a hue ruler in the temperature ruler's slot while it glows a colour; a white
  swatch brings the temperature ruler back. The card wears the bulb's colour: its icon, its
  switch and its brightness ruler take it. `show_color` turns it off; a white bulb's card is unchanged.
- **A colour for the whole card** (#34): `card_color` tints a card's own surface — a quiet wash of the colour as its
  fill, its edge and dividers in the colour — on every card that takes a `color`, so cards can be grouped at a
  glance (every light warm, every cover blue). It is independent of `color`, keeps the words at full contrast on every
  palette in light and dark, and never covers a card that is off or unavailable.
- **The essentials while off** (#31): the thermostat's and the fan's `when_off: essentials` keep the head, the value
  and what wakes the device — the mode tiles, or the fan's switch and speed ruler — and hide presets and fan speeds
  (presets, oscillation and direction on the fan) while it is off; they come back the moment a mode or the switch is
  tapped, below it, before Home Assistant answers. The default, `all`, shows everything as before.
- **Nine printer integrations** (#29, #30): the printer card now knows Creality (`ha_creality_ws`, with the CFS's
  trays), Elegoo (its durations in milliseconds, its chamber a box, its filament a colour), Anycubic's local
  integration (with the ACE's slots and the external spool), the Snapmaker U1 and the older Snapmaker line (fixed
  names, "HH:MM:SS" durations, read-only) and FlashForge (its LED, its error code, the job's thumbnail over the IFS's
  pictures) by their own words, beside OctoPrint, PrusaLink, Bambu Lab and Moonraker. The job's file and a failure's
  code are read from the status's own attributes where a printer has no sensor for them (Creality's). Every phase the
  new integrations report folds into the card's — Elegoo's self-tests, homing and levelling as preparing, Creality's
  "off" as offline, "completed" as finished. Elegoo's Canvas slots and FlashForge's IFS are not shown as trays.

### Changed

- **The camera's live stream stays put** (#28): scrolling the card off the screen no longer ends the stream and
  scrolling back no longer starts another; the element is kept for 45 s off screen and a hidden tab is left to Home
  Assistant's own players. A stream that cannot play gives way to the stills and is tried again a minute later, then
  less often. In full screen the stream shows the whole picture and a still is asked at the screen's width.
- **A printer is known by what it has**: a device of an integration the card does not know is a printer when it
  carries a status (or a printing sensor), a nozzle or a bed, and a job's measure together — a washer with a progress
  and a time left is never one — and the card reads its roles by the words the integrations share. The entity known
  most surely to play a role plays it: a "print status" over a "wifi status", the job's thumbnail over a spool's
  picture, whichever the registry lists first. A printer of any integration still works given its `device` and
  `roles`.

### Fixed

- **A sensor's own colour on the chart** (#28): an entry's `color` ("Also on the chart") now paints its readout's key
  and its curve; it used to fall back to the card's accent.
- **The overview's state of charge** (#28): the battery's dashed line now keeps to the positive half of the chart,
  0 % on the kW zero line and 100 % on the tag's line, so a low battery on a day of heavy export or charging no
  longer reads as an outflow.
- **Narrow columns** (the 1.6.1 list): at the widths a phone's zoom makes, an alarm's, a thermostat's and a water
  heater's mode tiles give way to chips rather than cut a word; a tile's foot shows one readout where two labels
  would overlap; the sensor's statistics take fewer columns where a label would not fit; the flow's dead-source line,
  the weather's context and the keypad's line give way in segments; the lock's slide hint hides where it would not
  fit; the camera's off text takes two lines; a scene tile's line is dropped, never cut; a room's head line and a
  map row's word fit their own room; the keypad's keys give way to 56; the energy card's rolling axis keeps its
  middle label only where it stands apart; a long panel tab keeps its words; the meter's note ends in an ellipsis
  rather than leave the card; a fold that hides an alert says so in the warning ink in every layout; a short age is
  read in full; the flow's comets no longer fade along a re-laid-out layer's old lanes; the Spanish camera pill says
  "En directo"; a compact alarm's glyph chips are never under 44 (two rows rather than narrower chips); an option
  tile's value is dropped rather than cut where a word of it would not fit its cell (the thermostat's "Standby" under
  Off, the alarm's and a charger's mode descriptions); the grid card's readouts and the map's zones take fewer
  columns where a label would not fit; a tile's foot keeps its two cells and judges its labels against them.
- A new printer card's first choice could land on a Bambu Lab AMS (a device with trays and no job): it now takes the
  house's first printer.

## [1.6.0] — 2026-10-08

### Added

- **The whole house on one chart** (#26): the energy card's `variant: overview` draws today as Home Assistant's
  "Power sources" graph does — every source's power stacked above the line (the sun's whole production, the battery's
  discharge, a generator, a car, the grid's import), what went into the battery, a car and the grid under it, the
  house's use as a line over them — plus your batteries' charge, dashed on its own 0–100 % scale. The legend gives the
  day's energy at rest and each flow's power under the finger; `show_soc` and `show_house` take the charge or the
  house's line away. [How it reads a house](docs/energy.md).
- **A way back from a subview on the wall** (#26): a wall has no header, so Home Assistant's back arrow went with it.
  *Wall → Back from a subview* chooses a back button (the default: a pill at the top left with a chevron and the
  subview's name, on the line of the exit corner) or Home Assistant's header, in subviews only.
- **The camera, live and in its own shape** (#26): `camera_view: live` plays Home Assistant's own stream (WebRTC, HLS
  or MJPEG, as the camera offers) while the card is on screen, and falls back to stills where there is none;
  `aspect_ratio` (16:9, 4:3, 3:2, 1:1, 2:1, 21:9, or `native`, the camera's own) and `fit_mode` (`cover`, or `contain`
  for the whole picture on the screen's dark, as a 180° camera needs); `refresh` from half a second. Stills are asked
  at the card's width in device pixels: sharp, and no heavier than they need to be.
- **Several sensors on one chart** (#26): the sensor card's *Also on the chart* (`entities`) adds up to two more
  sensors — a readout each above the chart, and a curve each on its own scale in its measure's tone. Scrubbed, every
  readout says that moment and the axis says when.
- **People: an action and a phone battery each** (#25, #26): the people card's `people` take a name, a colour (a
  ring round their picture), and a tap and a hold action per person — `navigate` to a person's own page, for one.
  `show_battery` puts each phone's battery beside its person: a glyph filled to its level and "78 %", glyph and figure
  in the warning tone at 20 % and under, a bolt while it charges; found from the person's phone (its battery sensor,
  or the tracker's own `battery_level`) or named as `battery`.
- **Openings with their own names** (#26): the openings card's `rows` take a name, an icon, a colour (its circle, at
  rest too), a tap and a hold per opening; `variant: compact` lays them out as 48 rows and `variant: tiles` two a row,
  and `show_time` takes the times away.
- **A colour per item, at rest too** (#26): scenes, chips, people and openings take a `color` per item, as tiles do.
  `tint: always` on tiles, tile groups, scenes, chips, rooms and lights shows an item's colour at rest as well, a quiet
  wash with a hairline of it, while on keeps the full fill.
- **A 3D printer card** (#27): `custom:fluvy-printer-card`, given the printer's device, finds the rest itself for
  OctoPrint, PrusaLink, Bambu Lab and Moonraker. The job and its picture (the camera's stills or its live stream, or
  the job's preview), the progress, the time left, when it will be ready and how long it has run; the nozzle, the bed
  and the chamber (both figures while a heater is on its way), the layers, the speed and the filament — a Bambu Lab
  AMS's trays with their colours, the one printing marked; the stage while it prepares and, when a print fails, why.
  Pause or resume, stop (asked first) and the light; any readout opens its entity, and any of the printer's entities
  can be one more (`sensors`). `variant: compact` and `variant: row` (a ring of the progress round the printer); any
  part can be named by hand (`roles`). System buttons and an emergency stop are never shown. The automatic Home
  dashboard adds a compact one for each printer it finds.

### Changed

- The camera, lock and alarm cards load on demand, with the printer: what every dashboard loads first is 9 KB lighter.

### Fixed

- The visual editor showed switches off that the card had on, and choices empty that the card had made (the date and
  forecast of a clock, a cover's tilt, a fan's presets, the greeting's weather, a timer's buttons, a gauge's style, a
  map's layout… on forty cards): every switch and choice now shows what the card does when the config says nothing.
- Words that ran out of their chip or row in some languages at a phone's width: the wall's back button and long press
  (Spanish, Italian), the screen's dark after sunset (German, Dutch), the openings' "all sensors" row (Spanish,
  French, Portuguese), the people card's title (German: a shorter one where the long one does not fit).
- Narrow columns, large sizes and long languages: a card's head gives its badge way before its title, then its circle;
  a list's rows (lock, alarm, camera, openings, people) give their circles to their names together, and a row's age
  takes its short form ("21 d") rather than an ellipsis; the greeting says the language's short hello where even the
  greeting alone would be cut (a phone at 150 %); the update and helper buttons, the weather, calendar, clock, rooms,
  meters and energy cards keep their words whole in all eight languages.
- A house in Fahrenheit: a thermostat whose entity gives no range or step of its own now takes Home Assistant's own in
  Fahrenheit (45–95 °F, a whole degree a step) where it took Celsius' (7–35, by halves), and a water heater's
  110–140 °F.
- **The greeting showed the same person to everyone** (#26): a greeting card without a `person` now greets whoever is
  signed in — their person's name and picture, and their more-info on a tap. The automatic dashboards and a new card
  no longer write a person into the greeting; a card that names one keeps it, so empty its *Person* field to follow
  the signed-in user.

## [1.5.0] — 2026-10-03

### Added

- **Dashboard tabs, your way** (#20): the view tabs in a dashboard's header — Home Assistant's own — take the look as
  the house chooses in *Appearance → Dashboard tabs*: Fluvy's (the dashboard's name, then the views as words, the
  accent under the open one), pills, Home Assistant's own, or hidden; each tab with its view's name, its icon or both
  (a view without an icon gets the one its name says), and the dashboard's name before them in any style.
  A person who keeps their own look keeps their own tabs. The edit mode and subviews keep Home Assistant's header.
- **The corner, your way**: *Appearance → Sidebar and header* puts Home Assistant's logo in the sidebar's head in place
  of the menu icon, takes away the dividers under the sidebar's name and the header, lays the header on the page's
  own colour, and puts the header's actions (add, search, Assist, edit) in one menu — all four, the corner of Fluvy's
  screenshots.
- **Templates in row text** — a row's `secondary` may be a Home Assistant template
  (`{{ states('sensor.humidity') }} %`), rendered by Home Assistant and kept live, on every card that lists rows:
  entities, lock, alarm, camera, bars, stat tiles, actions and helpers. The row's entity is `entity` in the template
  and the person looking `user`; a template that fails renders nothing, never its own text. The editor's field takes
  a keyword or a template alike (#21).
- **Compact variants** for the cards that ran long (#21): the bars card's `variant: compact` draws 48 px rows — the
  name and the value on one line, the 4 px bar under them; the weather card's `variant: compact` is one head row
  (the condition circle, the name, "condition · high / low" and the temperature) over the hours and the days ahead
  as columns, as many as the width holds (`days` stays the maximum); the stat tiles card's `variant: compact` draws
  64 px tiles of label over value, three a row when every label and value fits (`columns: auto | 2 | 3`, which the
  full tiles take too), and 48 px rows.
- **A size per device** — a tablet on the wall reads its dashboards at 90, 100, 110, 125 or 150 %, remembered by
  that browser alone: `?zoom=125` on the address (`?zoom=off` back), or *This device · Size* in the panel's
  Preferences tab and the Wall tab's device card. Only the dashboard's view grows; Home Assistant's header, sidebar,
  dialogs and the edit mode keep their size, and the size is set before the page paints. Every drag, scrub and
  measure of the cards reads the pointer in the control's own pixels, so a ruler, a lock's grip, a dial, a chart
  or a tab row behaves the same at any size (#21).
- **Power on the media cards** (#21): the media card turns a player on and off from a round in its head (in place
  of "…", which the artwork's tap still opens), a hero from its corner, and the now-playing strip from its left edge
  (`show_power`, on where the player can be switched); a player that is off offers "Turn on" and no dead transport.
  The compact row and the strip take `controls`: power, previous, play, next and volume, in the order written, as
  many as the width holds.

### Changed

- The settings panel has five tabs, on one line: *About* is now the last card of *Preferences* (*Fluvy*: the
  version, the look in use, the settings file, the house's reset). An old `/fluvy/about` link opens Preferences.
- On the dashboards that wear the look, the header's tabs are Fluvy's by default: the views as words instead of
  Home Assistant's icons. *Appearance → Dashboard tabs → Original* gives Home Assistant's tabs back.
- The automatic dashboards no longer repeat their views as chips under the greeting, now that the header's tabs carry
  their names; `greeting_tabs: show` (or the dashboard's options in the panel) puts them back.

### Fixed

- An automatic dashboard whose grid meter is found by its name (no power sensors in the Energy dashboard, no export
  sensor) drew its grid gauge with no entity: the card was handed `true` and failed to render. It names the meter.
- The energy card's `sources` variant (the house's power by source) is drawn from the power sensors the Energy
  dashboard names, as Home Assistant's own "Power sources" graph is: energy meters that tick in coarse steps, or a
  hybrid inverter's AC meter counted as the sun, no longer flatten the midday or put the sun in the night (#23). What
  went into the battery is drawn under the line with the export; "right now" is the house's own use; a gap in the
  recorder is a gap. Without power sensors the meters are read in blocks long enough for their step not to show.
- The bars card counted a `plain` row as 76 px in its height; it is 60. The stat tiles card's height left out the
  gaps above its tiles and its rows, so an automatic dashboard cut its columns 32 px short.
- A bars, stat tiles or weather row squeezed under what holds its name (half a column) cut the name to a letter; the
  rows now give their circles to the names, as a head does. A compact row of an entity that cannot be read said only
  "—"; it says "Unavailable", "Unknown" or "Not found". A missing entity drew a sensor's trend glyph; it draws the
  `ban` glyph. A dead stat tile was an ordinary tile; it wears the dashed hairline, in both variants.

## [1.4.0] — 2026-10-01

### Added

- **The energy flow, rebuilt** on one energy model shared by every energy card. A source is read the way its meter
  is: one signed sensor, two sensors (what comes in and what goes out), or one per phase summed per sign — so a
  house that imports on two phases and exports on the third shows both flows, and the sun's share of the house is
  right again (#19). With no sources given, the card reads the Energy dashboard's own: every grid connection, array
  and battery, two power sensors kept as two. Several arrays and batteries, a generator and a car that powers the
  house are sources too; `consumers` show where the energy goes. Variants `rows`, `cross` and `list`; styles
  `stream`, `legs` and `rail`; `motion: full | calm | off`; the badge says the sun's share, the self-sufficiency or
  the grid's way; each source takes its name, icon, colour, threshold, arrows and when to show. A day, a week or a
  month from the statistics, allocated hour by hour the way the Energy dashboard does, so the figures match.
- Every lane in the colour of where its energy came from, a solid arrowhead whose tip ends the lane, and pulses of
  light at a steady 24–72 px/s (eight a card at most, paused off screen and in a hidden tab).
- New energy cards: **Energy balance**, **Grid** (each phase, the price), **Batteries**, **Car charger**,
  **Where it went** (a sankey of the period), **Energy score**, **Water & gas**.
- The energy card's `sources` variant (the house's power today by where it came from), nested energy devices with
  what is not measured, Distribution's `total` (the whole's own meter: what no source accounts for), production by
  array, and a signed gauge for a meter that can go negative.
- [docs/energy.md](docs/energy.md): how the energy cards read a house, and every case.
- **Room lights** (`fluvy-lights-card`): a room's lights on one card. A tap on the card turns the whole room on or off;
  each light is a round beside the room's name (`row`), a chip with its name (`chips`) or a compact tile (`tiles`)
  that a tap turns and a hold opens. A light that is on wears its bulb's colour and its round a ring of its level;
  the lights come from an `area` or a list, each with its own name, icon and colour; `show_brightness` adds one
  ruler for the room. The automatic dashboard's Lights view starts each room of two lights or more with it.

### Changed

- The automatic dashboards read the whole Energy dashboard (every connection, the battery's charge, water and gas)
  and give the Energy template a *Today* view (a day's flow, where it went, the score) and a *Water & gas* view.
- The energy family loads as its own file, fetched as Fluvy starts: every page stays under its budget.
- 1.3's flow keys (`solar_power`, `grid_power`, `grid_invert`, `battery_*`, `home_power`, `flow_style: ribbons`) are
  still read, and never written.
- In the flow card's editor a source shows only the fields its kind is read by (a grid has no state of charge).
- A figure in kW (or kWh, MW…) from 1 to 100 keeps its decimal: "1.0 kW" beside "2.2 kW".

### Fixed

- The automatic dashboard could take an export meter for the grid's own; export meters are now the grid's second
  sensor.
- Production counted "today" on the browser's clock; it counts on the house's.
- An unavailable icon circle was filled in a solid palette (Volt, Mint); it is the dashed ring alone, as in the others.
- A tile gave nothing under the finger (its entrance held the press back); it shrinks and eases again, as designed.
- The room card's inner tiles were 76 tall; they are 84, as designed.
- In a narrow column the light and fan cards' heads kept room for a 48 px switch that is 56: the second line now
  gives way before it is cut.

## [1.3.3] — 2026-09-30

### Added

- `fire-dom-event` as a card action, as Home Assistant's own cards take it: the whole action leaves the card as
  `ll-custom`, so browser_mod's popups (with `browser_id: THIS`) and other frontend integrations answer a
  Fluvy card's tap and hold.
- `assist` as a card action (it opens Home Assistant's Assist), and `navigation_replace` on a `navigate`.

### Fixed

- An action with a `confirmation` ran without asking. Home Assistant's own dialog now asks first, with its words
  and its exemptions, and a tile no longer flips before the answer.
- `call-service`, as `perform-action` was written before Home Assistant 2024.8 (with `service` and
  `service_data`), did nothing.

## [1.3.2] — 2026-09-30

### Added

- A visible way out of wall mode: a small × in the top-right corner, there when the wall comes and whenever
  someone touches the screen, gone when it rests. A tap takes the device out of the wall, and a notice offers the
  way back for a few seconds. The house chooses in the *Wall* tab (*Way out*) between this button, the default,
  and the hidden long press of before, which pauses the wall instead.

## [1.3.1] — 2026-09-29

### Fixed

- A light card in half a phone's column (two lamps on a line) had no switch: under 200 px its head dropped it and
  left the ruler to turn the lamp on and off. The head is now fitted round the switch, as the fan's is — the sub
  steps aside, then the icon circle, never the switch — and the card keeps its height.

## [1.3.0] — 2026-09-29

### Added

- Five automatic dashboards, each a template and a strategy of its own: **Home** (the dashboard of before, with a
  Rooms view when the house has two rooms with something in them, and a page per room), **Rooms** (a tab a floor,
  a card a room), **Energy** (now, production, devices, meters), **Security** (the alarm, the cameras, the openings
  room by room) and **Wall** (two columns for a tablet, without tabs). The panel's *Dashboards* tab lists them,
  creates any with one tap, edits each one's options apart, lists it in the sidebar or not, and recreates it in two
  taps; the settings file carries every dashboard's options.
- Two cards, forty-one in all: **Room** — an area as the approved area card (its photo under the name pill, its
  temperature, humidity and how many devices are on, its lights, climate, media and devices as rows or as inner
  tiles; as a tile, or as a compact row) — and **Map** — where everyone is, as columns of zones with the faces in
  each (two, then a "+N" disc), as rows, or as Home Assistant's own map on a plate.
- Wall mode for a tablet on the wall: no sidebar, no header, the screen kept awake, a screensaver with the clock (or
  black) after a while that any touch or a motion sensor wakes, day and night by Home Assistant's mode, the sun or
  a pair of hours with a night veil, the wall mesh behind the cards. The house sets it in the panel's *Wall* tab,
  whose preview shows the wall as it would be now (its night included) and which shows the screensaver itself on a
  tap; the tablet becomes a wall with `?kiosk` on the address (or the tab's switch) and remembers; a hold of the
  top-right corner pauses it. Everything of the wall loads only on a device that is one.
- Palettes that travel: a custom palette shared as a file (`<name>.fluvy-palette.json`) with a title and an author,
  read back onto the gallery, saved to the house (twelve, under *Yours*) or removed; the palettes the community has
  contributed ship under *Community* with their authors. A draft that equals one of them is that palette.
- Turkish (`tr`): the eighth language, in every card, page, dialog and editor form, with the words the automatic
  dashboards read a Turkish-named house by.
- Every card under one editors' contract: what to show (`show_*`), which items and in which order (subset lists
  with Fluvy's rows editor), at least one other layout (`variant`), the chip rows filling by default
  (`<x>_style: full | chips`), a `tap_action` and a `hold_action` (a still press on the head) on every entity card,
  a `tone` and a `color` on the card and on each item, `unknown` drawn as a live surface. New variants: compact cover,
  fan, vacuum, lock and alarm (144 tall), a camera tile, a gauge bar, compact energy and production, distribution
  rows, readouts grid, a plain heading, compact entities, the clock's face and layout apart, the calendar's
  calendars as items.
- Colour per card: every card takes a `color` — one of Home Assistant's colour names (`teal`, `deep-orange`…) or
  any `#rrggbb` — that stands in for the palette's accent inside it: its chart, its lit light, its icon circle,
  its dial. The colour is derived on the very palette the card wears, in light and in dark, through the same
  arithmetic that makes the palette (its ink readable on the card, its fill legible under its ink, twelve graph
  series apart), so a red card on Linen is Linen's red. The editor offers Home Assistant's colour picker, whose
  swatches show the palette's colours. Device tones (a fan, a heater, a speaker) keep their own.
- The dropdown: the cards' text field as a button, opening its list in the browser's top layer — over Home
  Assistant's sidebar and dialogs — under the field, or over it near the foot of the page, as wide as the field;
  keys, letters and the pointer as a native select's, a hint beside each name, the chosen row marked. The
  Preferences tab's language is the first to use it (eight chips before): *Automatic* with the language it
  resolves to, then Fluvy's languages by their own names with the English name beside.
- Preferences: a *Help improve this translation* row that opens the translating guide.
- View backgrounds: the wall mesh (`--fluvy-mesh-*`), derived from the palette's own page colour.

### Changed

- The cards' options share one vocabulary: `subtitle` (`sub`, `meta` before), `variant` (`layout`, `view`),
  `hours` (`trend_hours`), `color` (`accent`), `name` on an entity card (`title` before on the to-do, energy and
  production cards), `show_*` for every switch (`hide_completed` before), `calendars` as items on the calendar
  (`entities` + `tones`). Every older name is still read, for good; it is never written back.
- The settings are version 2: the house keeps its shared palettes and its wall. A house that goes back to 1.2 keeps
  them unread; a 1.2 save keeps what it does not know once the house has been saved by 1.3.
- The panel has six tabs — *Dashboards* (it was *Dashboard*) and *Wall* are new.
- The automatic dashboards' strategy, the wall, the community palettes and the cards' visual editor load on demand
  (their own chunks); a dashboard page pays only for the cards. The automatic dashboards cut their columns by every card's declared
  height, measured at a phone's column — the layouts are level where the old table left them uneven.
- The theme's named colours follow the tone Home Assistant gives each: pink is the armed alarm's rose, cyan the
  water, teal the presence green, lime the dehumidifier's green, light green the battery, deep purple the house,
  brown the gas (it was the accent). Every surface Home Assistant paints through them moves with them.
- The theme says which palette it is (`--fluvy-palette`), and so does a look applied live.
- Card editors: the choices of a dropdown (a variant, a forecast, a first weekday…) and the tones are said in the
  dashboard's language; they were English words whatever the language.
- A compact tile inside a card (a room's controls) is an inner tile: 84 tall, the control radius, the page's fill,
  no hairline; off, its icon circle is the card's fill with the text ink. The state line on an on-fill is the fill's
  ink at 80 % (4.5:1 on every palette; the palette gates hold it).
- The docs' card tables are generated from the code (`pnpm docs:cards`), and the release refuses a chunk over its budget.

### Fixed

- Tiles: a mini tile is never narrower than 84 px (a group asked for more columns lays out fewer), so its icon
  circle is always the 44 of every other tile; a small tile's state line is fitted to the tile — "Open · 40 %"
  loses its figure before it is cut, and an unavailable tile shows "—" where the word cannot fit — and a large
  unavailable tile drops its "· 11 days ago" the same way. A compact tile's icon left under 160 px, not under 128:
  the size queries measured the content box.
- Energy flow, gauge, bars and the other chart cards: in a column too narrow for the icon circle and the title,
  the circle goes and the title stays whole (a typed title may end in an ellipsis, as a name does). The energy
  card's curve draws in the card's colour again (its chart lacked a tone carrier).
- The cards' words arriving in a new language refreshed every card twice.
- The dropdown's list, once it scrolls (nine languages), was a tab stop of its own.
- The docs said "five tabs", listed the automatic dashboard's options without `weather` and `language`, and gave
  the Security view a rule it does not follow (it needs an alarm, a lock, a camera or a gate).

## [1.2.1] — 2026-09-28

### Removed

- The swipe between a dashboard's views (1.2.0). Home Assistant draws one view at a time, so the arriving view
  could only appear once it was on the page — a slide out, a gap, a slide in — and rendering the neighbouring
  view ourselves proved neither light nor safe. A gesture that cannot show what is coming is worse than none;
  the tabs stay, and the *Swipe between views* preference goes with it.

## [1.2.0] — 2026-09-27

### Added

- Swipe between a dashboard's views on a phone: the view follows the finger, and letting go past a third of the
  width (or a flick) opens the next tab, which slides in from the finger's side. A drag that begins on a ruler, a
  dial, a slider, a scrolling row of chips or a map is theirs; a drag that leans vertical stays a scroll; the
  screen's edges are left to the system. Each person's to turn off in Preferences → *Swipe between views*.
- German, Dutch, French, Italian and Brazilian Portuguese, for every card, page and the settings panel, chosen in
  Preferences or taken from Home Assistant's language. One catalogue per language, fetched only when spoken; the
  automatic dashboard reads a house named in any of them.

## [1.1.2] — 2026-09-27

### Added

- Tiles card: each tile's readouts are chosen in the editor (a plug's power, its energy today, its cost); a wide
  tile shows three, a narrower one two. A sensor whose device class is monetary is labelled Cost.
- Light card: half a section is enough. Under 260 px of content (or `variant: compact`) the card keeps its head,
  with the level in the state line, and the brightness ruler alone, so two lamps share a line; the layout editor
  lets it go down to six columns (it stopped at nine).

## [1.1.1] — 2026-09-27

### Changed

- The demo opens in the light mode on Blaze, and lays its frames out in lanes filled by height: nothing overlaps,
  nothing is left hanging.

### Fixed

- Settings: the first card sits 16 px under the toolbar on a desktop too (it touched it).

## [1.1.0] — 2026-09-27

### Added

- A public demo at https://acosta290.github.io/fluvy/: the real cards, pages and settings panel on the simulated
  home, with the palette, mode, device and language changed live; deployed by `pages.yml` on every push to `main`.
- Motion clips in the README: the precision dimmer, the energy flow changing pace, a palette applied in the settings
  panel, a scrub across the History charts. `pnpm clips` records them on the playground (`tools/render/clip.mjs`)
  with the gestures the interaction suites prove.
- The settings panel's Dashboard tab lists Fluvy auto in Home Assistant's sidebar, or takes its entry out (an
  administrator's switch).

### Changed

- Activity: the icons sit 4 px clear of the timeline's spine, as the dots already did.
- The interaction suites and the clips share one gestures module (`tools/render/lib/gestures.mjs`).

### Fixed

- The documentation counts fifteen palettes (there was never a Cobalt), lists the automatic dashboard's options as
  the code has them (`dial | compact | ruler`, `ribbons | rail | legs`, eight views) and no longer mentions an
  Activity card that does not exist; CI measures the two devices sheets by their names.

## [1.0.2] — 2026-09-27

### Changed

- The README shows the whole product: the app with the sidebar and tabs, three galleries of cards, the two
  pages, the four tabs of the settings panel.


## [1.0.1] — 2026-09-27

### Changed

- The HACS listing says what Fluvy is: "Fluvy - Premium Theme & Cards", so a search for a theme finds it.
- The README renders inside HACS as well: absolute image URLs, no `<picture>` element.
- The licence badge is static, so it never depends on a cache.

### Removed

- The files prepared for Home Assistant's brands repository, which no longer takes custom integrations; the
  integration serves its own icon.


## [1.0.0] — 2026-09-27

The first public release.

### Added

- The Fluvy theme: one generated theme, light and dark, written from the same tokens the cards use.
- Thirty-nine cards for lights, climate, energy, media, security, calendar, clocks, helpers, people, weather and
  more, each with an editor form and a picker preview.
- The automatic dashboard (`strategy: { type: custom:fluvy-home }`): Home, Lights, Climate, Energy, Media and
  Sensors built from the registries and the energy preferences.
- The settings panel in the sidebar: sixteen palettes in a pastel and an electric line or a custom accent, three
  shapes, where the look applies, per-person preferences, applied live.
- The Activity and History pages, replacing Home Assistant's logbook and history pages while the house wants them.
- The shell: Home Assistant's own pages (Settings, dialogs, forms, the sidebar) in the same design while the
  Fluvy theme is worn.
- The integration (`custom_components/fluvy`): installs through HACS, serves the build, loads it on every page,
  registers the panel and the Lovelace resource, installs the theme, and says through Repairs what only you can do.
- English and Spanish.

[Unreleased]: https://github.com/acosta290/fluvy/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/acosta290/fluvy/compare/v1.3.3...v1.4.0
[1.3.3]: https://github.com/acosta290/fluvy/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/acosta290/fluvy/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/acosta290/fluvy/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/acosta290/fluvy/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/acosta290/fluvy/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/acosta290/fluvy/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/acosta290/fluvy/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/acosta290/fluvy/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/acosta290/fluvy/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/acosta290/fluvy/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/acosta290/fluvy/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/acosta290/fluvy/releases/tag/v1.0.0
