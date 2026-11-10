# The cards

Sixty-five cards, listed as **Fluvy · …** in the card picker, each with a live preview and an editor form. The form is
the reference for a card's options: it shows what the card does by default, and a default you leave as it is is never
written into the configuration. It shows an option only where it acts — in the style chosen, with the card's other
options as they are — and an option it hides keeps its value for when it acts again. In YAML, a card is
`type: custom:<tag>` plus the entity or entities it draws and any option the editor offers; the *Options* column below
names them (a select's values in brackets, a list with its item keys), and *Reads* the older names a card still
accepts (read, never written back). Every entity card also takes
`entity`, `name`, `icon`, `tap_action`, `hold_action`, `tone`, `color`, `card_color` (a quiet wash of a colour as
the card's own surface, its edge and dividers in it — see [the theme guide](theme.md#a-colour-per-card-and-per-item))
`card_opacity` (how solid its surface is, 0 to 100: under 100 the view's background shows through; left out, the
house's — see [the settings panel](settings-panel.md#cards)) and `unavailable` (how it looks while its device is out
of reach: `dashed`, the default, on the page's fill in a dashed hairline; `quiet`, as it is while off, still saying
"Unavailable"; left out, the house's — a tile of the tiles card may say its own);
a list card takes `title`. A card with a slider (the light, slider, tile, tiles, lights, media, fan, cover and helpers
cards) also takes `slider_style` (the style its sliders are drawn in: `ruler`, `bar`, `liquid` or, on a tile, `fill`;
left out or `house`, the house's — see [the settings panel](settings-panel.md#sliders)) and `slider_words` (the
figures under a bar or a liquid: `ends`, the ends and the middle, or `none`). A card with a head also takes `show_icon`: `auto` (the default: the circle gives way where
a long name in a narrow column needs its room, and only then), `always` (the circle stays while the name keeps a
few letters beside it: a smaller circle first, then none) or `never`. An `icon` left out — a card's, a row's or a
tile's — is the one you set for the entity in Home Assistant (in its settings, or a helper's, a scene's or a script's
own), else Fluvy's glyph for its kind, drawn open or shut as it stands (a door, a gate, a garage, a window), else its
integration's or Home Assistant's own: a sensor of a class Fluvy has no glyph for takes Home Assistant's, one of no
class keeps Fluvy's trend arrow unless its integration has an icon for it. The tables are generated from the code
(`pnpm docs:cards`).

A `name` is your own words, or a name made of Home Assistant's parts as its own editor writes it: the entity's own
name, its device's, its area's or its floor's, one or a list of them (words of your own among them as
`{ type: text, text: … }`), joined by a space as Home Assistant's own cards join them. Left out, a card says the
entity's friendly name, as Home Assistant's cards do. A light named "Baum" on a device named "EG_GA_L_Baum" in the
area "Garten" has the friendly name "EG_GA_L_Baum Baum"; it reads "Baum" with

```yaml
name:
  type: entity
```

and "Baum Garten" with `[{ type: entity }, { type: area }]`. A card's editor offers Home Assistant's name picker for
its name, and for each item's name in its lists, wherever an entity is beside it; words you type stay words.

Every card holds from the floor of a narrow column — 152 px for a card that takes half a section, 211 px for a full
one — up to a wall's 520 px, in light and dark, in every language Fluvy speaks; `unavailable`, `unknown` and a
missing entity are drawn on purpose (a quiet surface, inert controls, a dash for the value), never as an error, and
at the size and in the anatomy the card has live, so a grid never jumps when a device goes offline. Names may be
shortened with an ellipsis; values never are: a reading too long for its room says itself shorter instead, a large
count in the language's short words ("5.1M queries", then "5.1M"), a figure without its unit, a moment as long ago as
it was ("12 days ago"). A card that takes an action changes on screen first and calls
the service after; sliders and dials send on release, not per frame. A card of a list with nothing in it (a filter
that matches nothing yet, the last entry taken out) shows its head and an empty panel in its own words, never an
error: `empty_text` says what nothing means there ("All closed"), and `hide_empty: true` lets the card step aside
until something is listed again (see [auto-entities](troubleshooting.md#a-list-filled-by-auto-entities)).

`tap_action` and `hold_action` are Home Assistant's actions: `more-info` (the default), `toggle`, `navigate`, `url`,
`perform-action` (and `call-service`, as it was written before Home Assistant 2024.8), `assist`, `fire-dom-event`
and `none`. The head is the card's button: a tap on its circle, its name, the line under it or the room up to what
trails them answers the tap, and a still press anywhere on it the hold (with a keyboard: Tab to it, Enter taps,
Shift+F10 or the menu key holds). A control in the head (a switch, a "…" button) keeps its own tap beside it, and the
body keeps its own controls, so a slide is never a tap; a mouse that drags never taps either. A tile answers both on
its whole surface, a large one around its switch and ruler; a player on its art and its words; a greeting with no
avatar on its words. A stat tile answers its own `tap_action` (its entity's details, with the history, by default)
and `hold_action` (nothing by default), and one whose entity cannot be read is no button. A head whose actions have
nothing to act on (a card of many entities has no details of its own) is no button at all. An action with a `confirmation` is asked about first, by Home Assistant's own dialog, and nothing
on the card moves before the answer.

## Customisation

Every card exposes what to show (section switches such as `show_fan`), which items appear and in which order (subset
lists such as `modes: [off, heat, cool]`), and at least one other layout through `variant`. Chip rows fill the row by
default and are content-sized on request (`preset_style`, `fan_style`, `suction_style: chips`). Cards that list rows
(lock, alarm, camera, bars, stat tiles) take a `rows` list edited with Fluvy's own rows editor. A bars row turns
warning, and counts in the head's badge, under its `low` or over its `high`; a battery and a soil's moisture are low
under 20 % unless their row says otherwise. While a device is off,
the thermostat and the fan can keep to the essentials (`when_off: essentials`) — the thermostat its head, value and
modes, the fan its switch and speed ruler — and presets, fan speeds, oscillation and direction come back the moment a
mode or the switch wakes it (the water heater and the humidifier only have modes, so nothing hides on them).

A compact or mini tile keeps its name to one line, ending a long one in an ellipsis; `name_lines: 2` lets it take a
second line where one would cut it — on the tile and tiles cards, the template card, the room lights' tiles and the
room card's tiles and row. The tile is then a line taller whatever its name says (a compact one 88 instead of 76, 96
inside a card, a mini 124 instead of 108), so a row of tiles stays level.

A sensor card's readouts are named by their measure when nothing is set ("Temperature", "Humidity"); `label` names
the card's own sensor, an entry's `name` names that entry, and each entry may take its own `color`:

```yaml
type: custom:fluvy-sensor-card
entity: sensor.office_climate_temperature
label: Inside
entities:
  - entity: sensor.office_climate_humidity
    name: Humidity
    color: teal
```

A chart is drawn in the house's chart style (fluvy's settings → Charts: `classic` from the factory, the chart every
card drew before 1.11) unless the card names its own with `chart`: `classic`, `soft` (a soft copy under the line,
hairlines at the quarters, Fluvy's knob at the line's end), `glow`, `minimal` (a thin line ending in its dot), `step`
(each reading held across its slot, on a scale of its own range), and, for a sensor alone whose readings add up (a
meter, energy, power, rain, gas, water, a price — not a temperature, a humidity or a pressure), `bars` and `columns`:
the window in at most 24 bars, an hour each over a day, each what the meter gained there or the slot's mean. The fine keys change
one thing of the style and are offered only where the style draws it — `curve` (`smooth`, `straight`, `step`), `fill`
(`gradient`, `flat`, `none`), `line_width` (`thin`, `regular`, `bold`), `glow`, `show_points` (`none`, `end`, `all`),
`show_grid` (`x`, `y`, `both`, `none`), `show_axis`, `highlight` (`min`, `max`, `both`, `current`) — and `animate:
false` draws the chart still. A card's own key wins over the house's setting, which wins over the style's own default;
a key the card never writes is the house's. A tile's spark is `minimal` where the card's style is, else classic.

```yaml
type: custom:fluvy-sensor-card
entity: sensor.living_room_temperature
chart: soft
line_width: thin
```

How much of the past a chart shows is the house's too (fluvy's settings → Charts: the last 12 hours from the factory,
24 before 1.18) unless the card says its own: `hours` on the sensor card (its chart, its several sensors and its tile's
spark) and the energy card's line, `span` on the Chart card. Its line is drawn calmly: its points on the house's round
times (12:00, 12:30 …), as far apart as the card's width holds them for its style's stroke, each the mean of the
readings around its time — or, with `points` (`5m`, `15m`, `30m`, `1h`; `auto` the house's from the factory), a point
every so often, each Home Assistant's reading then, so the line passes through what Home Assistant says at 12:00 (down
to a pixel apart, drawn thinner where its points stand closer than its stroke reads). Read with a finger or a mouse,
any of them says the reading itself at the round time nearest — the five-minute bucket, or the state then — never a
mean across it.

```yaml
type: custom:fluvy-sensor-card
entity: sensor.living_room_temperature
hours: 24
points: 30m
```

Every card that draws a chart takes `chart` the same way, each offered only the styles it draws: the energy card,
the history bars and production (their styles are in [the energy cards](energy.md)), the distribution's stack and the
bars card `classic` or `soft` (each part a pill, its ink deepening along it). A gauge card's ring takes `gauge`:
`ticks` (its dial since 1.0), `dial` (the thermostat's dial, read) or `ring` (a ring lit to the value, Fluvy's knob at
its end) — the bar and the signed ring keep their one look; the humidity card's ruler `ticks` (its marker, the classic
one) or `ruler` (read lit to the value, Fluvy's knob on it). A gauge that names none draws the house's where it can,
else its classic. The History page draws its charts in the house's style; it has no setting of its own.

A gauge card's ring may also move with what its sensor reads, each offered only for the sensors it reads: `liquid` (a
percentage, a humidity: two slow waves, the reading in the larger of water and air), `thermo` (a temperature: a sky
over the ground — snow falling on a drift when it is cold, a mild sun and a drifting cloud, heat haze over dry ground,
a desert with its saguaros from 35 °C), `tank` (a volume or a level: bubbles while it fills, as fast as it fills),
`battery` (its charge as a level, the warning's under 40 % and the danger's under 20 %; bubbles and the bolt while it
charges), `pulse` (power: rings that beat faster with more of it), `air` (wind, or a ventilation's flow: streamlines as
fast as the wind) and `sun` (power or irradiance from the sun: rays that lengthen and turn with it). How fast a tank
fills or a battery charges is read off the card's last hour; a moving gauge the sensor does not read (a sky for a
power) draws the ticks. The humidity card's band takes `liquid` too, its level the reading under the figure. Each
takes the column's width and the dial's height, so the card keeps its size. `animate: false` — the card's, else the
house's motion in fluvy's settings — rests a moving gauge on its first frame, still a wave, its bubbles, rings and
snow gone, as a system that asks for less motion does.

```yaml
type: custom:fluvy-gauge-card
entity: sensor.terrace_temperature
gauge: thermo
```

The Min / Max / Average row under the gauge, over its last `hours`, is the card's to shape: `show_stats: false`
leaves it out and the card 60 px shorter, and `stats` lists the figures it shows, in their order.

```yaml
type: custom:fluvy-gauge-card
entity: sensor.grid_power
stats: [max, average]
```

A light that only switches on and off (its `supported_color_modes` is `onoff` alone) draws the light card as its
head alone — the circle, the name, the state line and the switch, 84 px — in every style, and its editor offers only
what the bulb does: no layout, stepper or live update, no temperature ruler, no quick colours.

`show_brightness` says when the light card shows its light's brightness — its level and its ruler, and with them the
stepper, the temperature ruler and the quick colours: `true` (always, the default), `false` (never: the card is its
head alone, as a light that only switches is) or `when_on` (while the light is on: its head alone while the light is
off or cannot be read; turned on, the card eases open and the rest fades in, and turned off it fades out and eases
back, the cards under it moving with it, at once with reduced motion). The editor offers it where the bulb dims, and
while the brightness is never shown it offers none of the layout, the stepper, live update, the rulers or the quick
colours.

```yaml
type: custom:fluvy-light-card
entity: light.garden
variant: compact
show_brightness: when_on
```

A colour bulb's quick colours (`colors`) are the house's own, any number in any order: `warm`, `cool`, a Home
Assistant colour name, `#rrggbb`, `[r, g, b]`, `picker` (a round that opens the browser's colour picker), or any of
those with a `name` its round says. The editor edits them row by row — a colour (the words, the picker, or *Custom
colour* with a colour well) and a name — and shows the bulb's default six until the list is touched; a hex reads as
itself and a colour name as words ("Deep purple") when no name is given.

```yaml
type: custom:fluvy-light-card
entity: light.lamp
colors:
  - warm
  - color: "#ff2d55"
    name: Lila
  - color: [0, 128, 128]
    name: Teal
  - deep-purple
  - picker
```

A lit light card can show its light's colour on its whole surface (`tint`, 1.9): `on` while the light is on, `always`
with a quiet wash of it at rest too, `off` never. How much: `full` (the default) is a lit tile's fill in that colour —
the same on every palette as a tile's — `soft` a gentler wash, `brightness` a wash as strong as the lamp is bright
(a lamp at 10 % still reads lit), and `full_brightness` (1.17) as much of the whole fill as the lamp is bright: the
soft wash for a dim lamp, the very card `full` draws at 100 %, the steps between following the brightness as you drag.
Its words are the fill's own wherever they read on it, else the card's: on a solid palette in dark (Volt, Mint, Noir)
they change once, at one level, the same up and down. The colour is the card's own `color` when it has one
(*Primary* is the palette's accent; the editor's *State* follows the light), else its `tone`, else the light's: the
colour it glows, a group's lit members' by their brightness, the one you just tapped. A white shows its warmth (1.10)
on one scale, from Home Assistant's own colour for its temperature: a candle's (2,200 K) the warmest, 2,700 K warm,
4,000 K a little, 5,000 K nearly neutral, daylight (6,500 K) neutral, and a cool one, above it, cool — or the palette's
lit light with `light_whites: palette`. A light that only dims or only switches, and a white Home Assistant gives no
colour for, have no colour of their own and take the palette's lit light. Where a card says nothing of its surface, the
house decides (the settings panel → Appearance → Lights; off unless chosen):

```yaml
type: custom:fluvy-light-card
entity: light.sofa_lamp
tint: on
tint_strength: full_brightness
```

Tiles, a tiles group, a room's tiles and rows, and an entities card's rows can wear a lit bulb's colour as well
(`light_colors: true`, or the house's choice; the room lights card does unless told not to), a white by its warmth
or as the palette's light as above (`light_whites`). Every light a card draws follows one rule (1.10): its own `color`,
else its own `tone`, else its bulb's colour, else the card's `color`, else the card's `tone`, else the palette's lit
light — so a bulb's colour now comes before the card's. A light group wears its lit members' colours, weighed by their
brightness. The editors offer only what acts: the whites while the bulbs show their colours, the colour at rest
(`tint`) on a room lights card in tiles and on a room with tiles, a light's colours on a tile of a light.

```yaml
type: custom:fluvy-lights-card
area: bedroom
variant: tiles
light_whites: palette
```

The room lights card can carry a colour round (`show_color: true`, Discussion #137): a palette round in the head,
before the lights' rounds or the room's switch, whose own tap opens the room's colours for every light at once, while
the room's icon keeps switching the lights and the brightness ruler keeps setting the room. It opens Fluvy's colour
sheet: the light card's hue ruler (or the hue wheel, `color_control: wheel`) and quick colours (`colors`, the light
card's list) for the whole room, with the room's switch in its head; a colour chosen goes to every light of the room
in one call, each as Home Assistant fits it (a white bulb takes the nearest white), wakes a room that is off, and the
sheet says which lights take none. Where the card is one light or a light group, `color_action: more-info` opens Home
Assistant's details of it instead. The round shows only where a light of the room takes a colour, and in half a
column it steps to a "Colour" row under the body. It is off unless asked for, so a card that does not name it draws
as it did.

```yaml
type: custom:fluvy-lights-card
area: living_room
show_color: true
colors: [warm, cool, red, orange, '#8e44ad', picker]
```

The history bars card reads a sensor's long-term statistics (`days` bars of a `period`: days, weeks or months; a
bar is what a meter gained, or a measurement's `mean`, `max` or `min`). Its head readouts (`head`) and the facts
under the chart (`facts`) are lists of kinds you compose in order — `total`, `average`, `highest`, `lowest`,
`today`, and the equivalents `co2` (× `co2_factor`, 0.4 kg a kWh), `trees` (22 kg a tree a year), `km` (5 km a
kWh), `money` (× `price`, in the house's currency), `share` (`of` another sensor) and `template` — each with its
own `name`, `icon`, `color`, `unit`, `decimals`, `factor` and `tap_action`. The factors are rough and yours to set.
Every part switches off (`show_values`, `show_axis`, `show_grid`, `show_dates`, `show_facts`, `show_head`), the
day in progress joins with `include_today`, and `variant: compact` keeps the bars and their dates, `mini` a row of
readouts and a sparkline:

```yaml
type: custom:fluvy-history-bars-card
entity: sensor.grid_export_energy
name: Feed-in to grid
icon: up
color: '#86B98C'
price: 0.19
facts:
  - kind: share
    of: sensor.solar_energy
    name: Share of production
    icon: tower
  - kind: money
    name: Revenue (est.)
  - kind: co2
    name: CO₂ avoided
```

By default a meter's bars are what Home Assistant counts (its long-term `change`, the Energy dashboard's numbers).
A counter that starts again from zero on a cycle — a day counter, a monthly rain gauge — is better read by its own
readings: `reset: day` (or `week`, `month`, `year`) reads it at each hour's or day's end, so a reset that comes as
two writes, a restart that reads 0 for a moment, or a `total` without `last_reset` is never counted twice or below
zero; `reset: never` reads a lifetime meter the same way. The editor names a utility meter's own cycle. `stat: state`
draws the reading at the end of each bar (a monthly gauge by month is each month's rain). A sensor with no state
class has no statistics: its bars come from the recorder's history, kept for its last days (`source: history` asks
for it always). Today is live, the average, the highest and the lowest are the finished bars', and the days before
a sensor existed stay empty. `negative_color` and `current_color` give the bars below zero and the one in progress
colours of their own; `unit` converts within energy, power, volume and distance:

```yaml
type: custom:fluvy-history-bars-card
entity: sensor.rain_this_month
days: 28
include_today: true
reset: month
unit: in
current_color: blue
```

## Templates in row text

In every list of rows (entities, lock, alarm, camera, bars, stat tiles, actions, helpers) a row's `secondary` may be
a Home Assistant template instead of a keyword or words of its own: anything with `{{ … }}` or `{% … %}` is rendered
by Home Assistant and kept live, so the line changes as the entities it reads do. The row's own entity is `entity` in
the template and the person looking at the dashboard `user`; a template that fails renders an empty line, never its
own text. The editor's field takes a keyword or a template alike. A camera's rows are its history: each says when it
last changed, as the time of day, unless its `secondary` asks for another line (`state`, `area`, an attribute, a
template, `none`), and a row's `tone` or `color` shows on its circle. A row with no `tap_action` of its own opens its
entity's details, a select's its dropdown (see Helpers).

```yaml
type: custom:fluvy-entities-card
rows:
  - entity: climate.living
    secondary: "{{ state_attr('climate.living', 'current_temperature') }} °C · {{ states('sensor.humidity') }} %"
```

A row's time — the openings card's "2 h ago", a list row's *last change* line, a tile's, a person's — is Home
Assistant's `last_changed`, which a restart or a reload resets. Where the house keeps the real one (1.11: a
timestamp sensor such as `sensor.front_door_real_last_changed`, or an attribute of the entity's own), the row reads
it from there with `since`: the sensor's id, or `attribute:<name>`, as an ISO date or an epoch in seconds or
milliseconds; the editor offers the house's timestamp sensors, and takes any other typed. The openings card names one
for every row at once with `since_pattern` — `sensor.{id}_real_last_changed`, `{id}` the row's object id, `{entity}`
its whole id — and a row's own `since` wins. A sensor that is empty, unknown, unavailable or no moment at all leaves
the row on Home Assistant's own time.

```yaml
type: custom:fluvy-openings-card
since_pattern: sensor.{id}_real_last_changed
rows:
  - binary_sensor.front_door
  - entity: binary_sensor.garage_door
    since: attribute:last_opened
```

## Pictures of your own

The thermostat, the media and the appliance cards take a picture of your own, `image`: an address (`/local/tv.png` for
a file in Home Assistant's `www` folder, or one on the web), or an entity whose picture it is — the image entity an
integration gives a product picture with, a camera's still, a person's face. The thermostat shows it in its circle's
place beside the name, and it gives way in a narrow column as the circle does. The media card shows it on its plate
where the player has no artwork (`image_mode: fallback`, the default: a television on its tuner, a speaker at rest) or
always (`always`), drawn whole, never cropped. An address of any other kind than `https:`, `http:`, a path or
`data:image/` is never loaded, and out of reach the picture greys and fades with the card. A picture that will not
load gives way to what the card draws without one and is tried again by itself, so one Home Assistant could not serve
while it restarted comes back; an entity's picture is drawn again as it changes.

```yaml
type: custom:fluvy-media-card
entity: media_player.lounge_tv
image: /local/lounge-tv.png # or image.lounge_tv
image_mode: fallback
```

## Media

The media card's line under the title is the player's own: who made what plays, else its state and when it last played,
or what a television that is on shows. `secondary` puts a line of your own in its place, in every style, the compact
row's too: words of your own, a template (rendered and kept live, the player is `entity` in it), or an entity, said as
its state with its unit — a status sensor's "On · TV · Volume 7 · Soundbar". Words that do not fit lose their last
` · ` parts, then end in an ellipsis; a player out of reach still says so in their place. A television
(`device_class: tv`) that is on and plays nothing Home Assistant can name — a tuner's channel, an app its integration
does not report as playing — is titled by its app or its input, else its name, never "Nothing playing", and its line
says its state and the rest.

```yaml
type: custom:fluvy-media-card
entity: media_player.lounge_tv
variant: mini
secondary: sensor.lounge_tv_status # or "{{ state_attr(entity, 'source') }} · {{ states('sensor.soundbar_volume') }}"
```

## TV remote

The remote card (#143) is a remote in Fluvy's hand for a television, a receiver, a console or a player: the head with
the power round; the player's sources as chips that fill their row; the D-pad, a ring of four arrows round OK between
its four keys (`dpad: ring`, the default) or the familiar grid of nine (`grid`); rewind · play/pause · forward; the
volume; the channel; the apps; keys of your own. `entity` is the player (`media_player`), `remote` the remote entity
that takes the keys (`remote.send_command`); either alone will do. Each key goes to the player's own service where it
has one (power, volume, mute, play and pause, previous and next, a source), else to the remote as its integration
takes it — the table knows Android TV Remote, Apple TV, Roku, LG webOS (its buttons on the player itself), Samsung and
Fire TV, read from their sources and not tried on a device — else to a command of your own (`commands: { back:
KEY_RETURN }`, a word or an action). A key no part of the device takes is drawn disabled; the D-pad and the channel
are drawn where a remote is named (or the television is an LG). Held, an arrow, a volume or a channel key repeats.

`groups` names what is drawn and in what order: `source`, `dpad`, `transport`, `volume`, `apps` by default, `channel`
and `custom` by name; a group the device cannot take is not offered. `nav` names the four keys round the pad (back,
menu, subtitles, home by default), `transport` the playback rounds, `side_keys` puts the four beside the ring where the
column holds them (`auto`), always (`sides`) or in a row under it (`row`); `ok_label` writes the word on OK (`word`) or
leaves it plain. `volume: auto` draws the house's ruler where the device reports a level it can set and keys (down ·
mute · up) where it does not; `ruler`, `keys` and `stepper` (the 96 pill with a mute round) ask for one. `volume_entity`
routes the volume to a receiver or a soundbar: the row names it, says its level, and shows it off ("Off", the ruler
asleep) or out of reach ("—", the row still) while the television stays live.

The apps row shows the player's sources that name a platform — Netflix, Disney+, Prime Video, YouTube, Spotify and
some fifty more, matched whatever their case and spacing — each with its logo and its brand colour, the open one
coloured; `apps` lists your own instead (`app: netflix`, or a `source`, a `key`, a `tap_action`, with a `name`, an
`icon`, a `color` and an `image` of your own: `/local/logo.svg` or a web address in place of the logo), the editor offering the platforms with their logos. `apps_style: circles` draws 44
circles in equal cells with their names under them (names all or none, as many as hold a finger's 50, wrapping by
count), `chips` filled chips; `apps_tint: always` colours every app at rest, not only the open one. `custom` lists keys
of your own, a key of the table or an action, as cells that fill the column. `variant: compact` is the head and one row
of `keys` (back, home, play/pause, volume down and up by default); `pad` the head and the D-pad alone; `row` the media
card's mini row with its `controls` (back, home, power). Off, the power round takes the primary fill and every key
stays alive (`off_keys: live`: the integrations that wake on any key do) or power alone (`power`, the rest faded); out
of reach the card keeps its size and anatomy in the dashed skin. Heights at a 360 column: full 572 with the default
groups, compact 144, pad 276, row 76.

```yaml
type: custom:fluvy-remote-card
entity: media_player.living_room_tv
remote: remote.living_room_tv
volume_entity: media_player.receiver
groups: [source, dpad, transport, volume, apps]
apps:
  - app: netflix
  - app: disneyplus
  - name: Radio
    icon: mdi:radio
    source: Live TV
custom:
  - name: Guide
    key: guide
  - name: Sleep
    icon: moon
    tap_action:
      action: perform-action
      perform_action: media_player.turn_off
      target: { entity_id: media_player.living_room_tv }
```

A Samsung television whose back key the table names otherwise:

```yaml
type: custom:fluvy-remote-card
entity: media_player.bedroom_tv
remote: remote.bedroom_tv
variant: compact
keys: [back, home, play_pause, volume_down, volume_up]
commands:
  back: KEY_RETURN
```

## Chips

A chip's `name` may be a Home Assistant template, rendered and kept live as a row's text is: who is home, the rooms
with a light on, a state. So may its `icon` (an icon such as `mdi:home-account`, or a Fluvy glyph's name) and its
`color` (a colour's name, `#rrggbb`, drawn on the card's palette); the chip's `entity` is `entity` in them. A template
that fails says nothing of itself, and one that renders nothing leaves the chip its icon, or leaves out a chip with no
icon: a chip that shows only while there is something to say. The row stays one line, whatever the words. Fluvy never
runs JavaScript: a button-card label between `[[[ ]]]` is shown as written, so write it as a template.

```yaml
type: custom:fluvy-chips-card
chips:
  - name: "{{ states.person | selectattr('state', 'eq', 'home') | list | count }} home"
    icon: mdi:home-account
    path: /dashboard-home/people
  - name: >-
      {{ states.light | selectattr('state', 'eq', 'on') | map(attribute='entity_id') | map('area_name')
      | reject('none') | unique | list | count }} rooms lit
    icon: mdi:lightbulb-group
    color: "{{ 'amber' if is_state('light.kitchen', 'on') else 'grey' }}"
  - name: "{{ 'Washer done' if is_state('sensor.washer_state', 'finished') else '' }}"
    entity: sensor.washer_state
```

## Template

The template card is a tile — compact (the default), mini or large, the tile card's own — whose `name`,
`secondary`, `icon`, `color` and `active` may each be a Home Assistant template, rendered and kept live as a row's
text is. `entity` is optional. With one, the tile is that entity's: its glyph, its tone and its state, on a large tile
its switch, its ruler and its `readouts`, and a template reads it as `entity`. Without one, the tile is your words
alone: it wears the resting skin, toggles nothing, and is a button only for an action that needs no entity
(`navigate`, `url`, `perform-action`, `assist`).

- `secondary`: `state` (the default with an entity), `area`, `last-changed`, `none` (the default without one), words
  of your own or a template. Your own words that do not fit lose their last ` · ` parts, then end in an ellipsis. An
  entity that is unavailable or gone says so in their place; an unknown one (a button never pressed) keeps them.
- `icon`: an icon such as `mdi:lightbulb`, or a Fluvy glyph's name (`bulb`).
- `color`: a colour (a Home Assistant colour's name, `#rrggbb`, `rgb(…)`) or one of the palette's tones (`warning`,
  `heat`, `water`…); `tint: always` keeps it at rest. The editor's colour picker takes a colour; a template goes in
  YAML.
- `active`: when the tile shows as on — `auto` (as its entity is; the default), `always`, `never`, or a template: on
  unless it gives `off`, `false`, `no`, `0` or another state that reads as off. The fill is `active`'s; a large
  tile's switch and ruler still say what the entity is.

Until Home Assistant answers, the tile shows its entity's own glyph, colour and state, and a blank line where the
words will land, so nothing moves when they do; a template that fails shows nothing of itself, and a reader hears
the entity's name (or "Template").

A Mushroom template card pastes in: `primary` is read as `name`, `icon_color` as `color`, `layout: vertical` (or
Mushroom's later `vertical: true`) as the mini tile (`horizontal` and `default` as the compact one). `fill_container`,
`multiline_secondary`, `double_tap_action` and `entity_id` have no part here and are let go when the editor saves;
`picture`, `badge_icon` and `badge_color` stay in the configuration, not drawn. One difference to know: Mushroom's
template card does nothing on a tap or a hold unless you give it an action, where Fluvy's tile toggles what toggles (a
light, a switch) on a tap and opens its details on a hold. To keep a pasted card still, write
`tap_action: { action: none }` (and `hold_action: { action: none }`).

```yaml
type: custom:fluvy-template-card # was custom:mushroom-template-card
entity: sensor.washer_power
primary: "{{ 'Washing' if states(entity) | float > 10 else 'Washer' }}"
secondary: "{{ states(entity) | round }} W"
icon: mdi:washing-machine
icon_color: "{{ 'blue' if states(entity) | float > 10 else 'grey' }}"
active: "{{ states(entity) | float > 10 }}" # Fluvy's own: the fill
layout: vertical
```

## Schedules

The automations card lists every automation of the house — on or off, when it last ran — and the schedules Fluvy
wrote among them with their days, their times and their next run. A schedule is a native Home Assistant automation
(it is in Settings → Automations too, and Home Assistant's own editor opens it); Fluvy only adds the easy sheet, the
list and the management. Tap `+` to add one: what it targets, what it does (on, off, open, close, run; a
brightness or a target temperature), on which days (every day, workdays by the workday integration's sensor, the
weekend, or the days you pick), when (a time, or sunrise and sunset with an offset) and, with an end, until when.
One edited in Home Assistant past Fluvy's shape is still listed, as a plain row; only administrators add, edit or
delete, and everyone else sees the list, the switch and Home Assistant's dialog on tap.

```yaml
type: custom:fluvy-automations-card
show: schedules
variant: tiles
entities:
  - automation.good_morning
  - automation.blinds
```

A card in a popup is about one lamp, not the house: `targets` lists the entities it is about (each with a name, an
icon and what a new schedule for it does — its verb, a brightness, a temperature), the list shows their schedules and
the automations Home Assistant relates to them, the head says when the lamp next turns on, and `+` opens the sheet
already set to it, so a timer is `+`, pick the time, Save. The sheet's "Until" has quick ends (15 min, 30 min, 1 h,
2 h after the start). Only administrators create or edit automations (Home Assistant's rule); everyone else gets the
list and the switches.

```yaml
type: custom:fluvy-automations-card
title: Timers
targets:
  - entity: light.kitchen
```

## Appliances

The appliance card finds a washer, a dryer, a dishwasher, an oven, a hob, a hood, a fridge, a freezer, a wine cooler, a
coffee machine, a kettle, an air fryer, a microwave, a toaster, a blender, a sandwich maker, a pet feeder, fountain or
litter box — or any appliance on a smart plug, read from the plug's switch and power — by what its integration says (LG
ThinQ and LG's older SmartThinQ, Home Connect, Miele, SmartThings, LocalThings, Matter, Whirlpool, Tuya, hOn,
Electrolux, PetKit, PETLIBRO) or by its name in any of Fluvy's languages, else its maker's; `kind` names it when the
card guesses wrong, `roles` names an entity for a role (a helper you attached to its device, a template or a utility
meter, plays one only where nothing of its integration's own does) or `none` for one the card found and should leave
out, everything else as found (#127: a remote start that says off while the appliance takes a start, the wrong door, a
water meter of its whole life; the editor's **None**, or an entity left empty), and `scan: false` makes it read only the
entities you name (`entity` and `roles`) and nothing else of its device. The card is the design a reader drew for us: a
picture of the appliance (`picture`: a drawing a kind, the icon, none, or `image` for your own photo; it steps down from
64 to 44 and 32 before it gives way to a letter of the name, and `picture_min: 32`, `44` or `64` keeps it at least that
large, a long name ending in "…" beside it), its name and what it is doing (off while its power switch is off, unless it
says it runs, waits or is done), a power button tinted by what it does, its kind's hero — the time left over a bar, an
oven's temperature and target, a fridge's compartments, a hob's zones, a coffee machine's drinks — and three `rows`
under a hairline (the programme, water, energy, a filter to clean, the last coffee: picked, ordered, named, coloured and
given actions in the rows editor), `maintenance` as rows of their own, and buttons only where the integration's own code
says exactly how (start, pause, stop, power, the light; the rest is shown and never written) — or, for any integration,
the Start, Pause, Resume and Stop its `roles` name (`start`, `pause`, `resume`, `stop`: a device's button, a helper's
button or a script), found by themselves where the integration names its buttons so. `confirm` names the commands that
ask first in Home Assistant's dialog, wherever they are tapped (its buttons, its power button, the row's round):
`start`, `resume`, `pause`, `stop`, `off` (switching off, or `power`), `feed`, `clean` and `level`, in any case, in
words that name the appliance ("Start Oven?"). Unset, a stop asks, and so do switching off while it runs, waits to start
or has failed (a fridge at any time), a meal, a clean and a levelling, and a litter box's resume; an oven, a microwave
and an air fryer ask before they start too (#128: a stray tap heats whatever was left inside, with nobody by it), where
a kettle, which stops at the boil, and a washer, a dryer or a dishwasher start at one tap. An oven's buttons are Start,
Stop, the light and its power, each where its integration can do it. A list replaces that set: name every command that
asks, `off` included (`confirm: [start, stop, off]`); `confirm: []` asks for nothing, which is the home's choice, where
a list of names the card does not know asks as unset does, and its editor says which it does not know. The editor offers
the commands its appliance can send at all, by the entities the card found, whatever they list at the moment. `variant:
compact`, `ring` (a dial) and `row` are the smaller layouts; every part switches off (`show_power`, `show_hero`,
`show_progress`, `show_rows`, `show_controls`…). An administrator sees a bell beside the time left: "Tell me when it's
done" writes a normal automation that notifies their phone when the appliance finishes.

```yaml
type: custom:fluvy-appliance-card
device: 1f2c…            # the appliance's device; or entity: one of its entities
kind: washer             # auto by default
rows: [program, water, energy]
```

```yaml
type: custom:fluvy-appliance-card
entity: switch.washer_power
variant: row
confirm: [start, stop, off]   # its round asks before it starts the washer too
```

```yaml
type: custom:fluvy-appliance-card
device: 3c5d…            # a dishwasher that starts with its remote start off
roles:
  - role: remote
    entity: none         # not the card's to say; the rest as found
```

```yaml
type: custom:fluvy-appliance-card
device: 9a7e…
scan: false              # only the entities named here
show_controls: true
picture_min: 44          # keep the picture, cut a long name
roles:
  - role: state
    entity: sensor.dishwasher_machine_state
  - role: start
    entity: button.dishwasher_start
  - role: pause
    entity: button.dishwasher_pause
  - role: stop
    entity: script.dishwasher_stop
```

Any device can be an appliance (#115): the picker lists every device of the house with a sensor, a binary sensor or a
switch, whatever its integration — an espresso machine over MQTT, a washer on a bridge of its own. Pick it and choose
what it is (`kind`, where its name or its maker's does not say); the card reads what it can by its entities' names and
words (what it is doing, its power switch, its programme, a temperature, its counters, its water tank), and
**Entities named by hand** (`roles`) names what it did not find: the editor offers the roles of its kind, and its
entity pickers the device's own entities (a switch over them offers the whole house: a plug's power under a washer
plays a role too). More of its readings go in `rows` (**Another entity**), or `sensors` on a compact card, named
without the words all its entities' names begin with. A Decent DE1 over MQTT (its tablet's de1plus-mqtt plugin) reads
by itself as a coffee machine: what it is doing in its own words (a failure or a call for a hand in Fluvy's, its own
word as its alarm row's value), its profiles as its drinks, its last shot and its tank in millilitres, due while the
machine asks for water. Named by hand, with its steam's temperature as a row:

```yaml
type: custom:fluvy-appliance-card
device: 4b9e…            # Decent Espresso DE1PRO
kind: coffee
drinks: [Default, Londinium, Blooming espresso]
rows:
  - last_brew
  - water_tank
  - entity: sensor.decent_espresso_de1pro_de1_steam_temperature
    name: Steam
roles:
  - role: state
    entity: sensor.decent_espresso_de1pro_de1_state
  - role: power
    entity: switch.decent_espresso_de1pro_de1_on
  - role: program
    entity: select.decent_espresso_de1pro_de1_profile
  - role: temperature
    entity: sensor.decent_espresso_de1pro_de1_head_temperature
```

Pet devices are appliances too: a feeder, a water fountain and a litter box (`kind: feeder`, `fountain`,
`litter_box`), found on PetKit's and PETLIBRO's integrations (from HACS) by their device type and their entities, or
by their names. Their hero is two `tiles` — a feeder's food and its next meal, a fountain's water and its filter, a
litter box's litter and its waste bin — each ringed by what is left where the device says it in percent, in the
warning's ink when it runs low and the danger's when it is out; their rows say the last meal and what it gave today
(`last_meal`, `next_meal`, `fed_today`), what the pets drank (`drank_today`), the water purified and the pump
(`purified`, `pump`), who used the box last and how often today (`last_use`, `uses_today`), and their parts (`food`,
`desiccant`, `water_tank`, `water_filter`, `litter`, `waste`, `deodorant`, `clean`, `filter`) with the days they have
left, soon within `low_days` (seven). A feeder at rest counts down to its next meal ("Next meal in 1 h 13 min"), read
from PETLIBRO's sensors or PetKit's feeding plan in the house's time; a litter box says who used it last. Its round is
the button that matters: a meal now (`feed_amount` is the amount PetKit's feeders take, their smallest by default;
PETLIBRO's gives the amount set on the device), a clean, or a resume while a cat has paused one — each asks first in
Home Assistant's dialog. `show_controls` adds the others (deodorize, level the litter, pause); a reminder's hold resets
a filter, a desiccant or a deodorant. The tiles and rows are picked, ordered, named and coloured in the rows editor as
any whole card's; on the automatic dashboards the pet devices have a band of their own.

```yaml
type: custom:fluvy-appliance-card
device: 9a41…            # a PetKit or PETLIBRO feeder
tiles: [food, next_meal]
rows: [last_meal, fed_today, desiccant]
feed_amount: 20          # a PetKit feeder's meal, as it takes them
low_days: 5
```

The appliances card lists the house's appliances (or those it names in `appliances`) as rows, compact rows, tiles or —
`variant: cards` — each as its whole card side by side, as many as fit: what needs a hand first, then what runs, what
waits, what is done, what rests; `show: active` keeps only the busy ones; `picture_min` keeps the tiles' and the whole
cards' pictures, and `confirm` names what the whole cards ask before, as the appliance card's does (an appliance's own,
in `appliances`, wins). The automatic dashboards lay the house's appliances out the same way across Home and across
every room.

```yaml
type: custom:fluvy-appliances-card
variant: cards
```

## Cameras

The cameras card shows several cameras at a glance, as a reader drew it (#60): each a tile of its picture — "Live" at
its top and a full-screen round at its bottom — over its circle (its own `icon`, the one set for the camera, its area's,
the camera), its name and its line. The line reads the camera's motion sensor where it has one (`motion`, else the
motion, occupancy or presence sensor on the camera's device): "Motion detected" (its circle neutral, or in the camera's
own `tone` or `color` where it has one) or "No motion"; else the camera's state ("Online", "Recording", "Streaming",
"Offline"); `status` asks for one of them, or `none`. The cameras are those it lists in `cameras`, else every camera of
its `area`. Each picture refreshes itself only while it is on screen (`refresh`, in seconds), or streams with
`camera_view: live` — the first `max_live` of them (four by default), the others keeping to stills. A picture whose
stream cannot play shows its stills and says so on its line ("Stream unavailable"). `columns` lays the tiles out
(`auto`: one in a narrow column, two from 320, up to four across a wide band); `variant: list` is a row a camera with
its thumbnail, `compact` the pictures alone with their names. The head's round opens a sheet of every camera, with a
switch that shows them all live, or none, while the dashboard stays open (never written to the card; none with
`max_live: 0`); a `hold_action` on the card runs there instead.

```yaml
type: custom:fluvy-cameras-card
title: Outside
cameras:
  - entity: camera.driveway
    icon: mdi:fence
  - entity: camera.garden
    motion: binary_sensor.garden_person
  - camera.terrace
  - camera.garage
columns: 2
camera_view: live
max_live: 2
```

## Alerts

The alerts card gathers what needs a look. Each alert is one line — a `preset` (`low_battery`, `unavailable`, `open`,
`unlocked`, `hazards`, `errors`, `updates`, `lights_on`, `ha_alerts`, `repairs`) or a matcher of your own (ids,
`entity_id` patterns, `domain`, `device_class`, `integration`, `area`, `floor`, `label`, `device`, `state`, `above`,
`below`, `attribute`, `for`…) — and one definition drives its count, its list in the sheet and its buttons. A preset
waits where a moment is no news — `unavailable` and `open` five minutes, `unlocked` ten — and `for` says otherwise
(`for: 0` shows it at once). Alerts are ordered by `severity` (critical, warning, info; info in the palette's accent,
or its blue where the accent is warm enough to pass for a warning), an alert can `escalate` after a while or past a
count, and `conditions` take Home Assistant's own visibility shapes. `variant` draws them as `tiles` (the default),
`mini`, `chips`, `rows` under a head, or a `banner` that turns through them; the card hides itself while all is clear
(`hide_empty: false` keeps an "All clear" tile). A tap opens the alert's sheet — each entity with its state, where
and how long, a button of its own (Lock, Close, Install, Dock, Acknowledge) and the alert's (Lock all, asked first) —
and Snooze (an hour, eight, until tomorrow morning, until it changes; the snooze follows you to every device, or
stays on this device with `snooze: device`); a long press opens every alert, the snoozed ones with Wake. Home
Assistant's repairs (for administrators) and its `alert` entities are alerts too.

```yaml
type: custom:fluvy-alerts-card
alerts:
  - preset: unavailable
    domain: light
    name: Lights unavailable
  - preset: low_battery
  - preset: open
    for: { minutes: 15 }
  - preset: errors
  - preset: updates
```

## Items

The items card lists the items of a sensor's list attribute (#66) — the aircraft a FlightRadar24 sensor keeps in
`flights`, a departures board, parcels on their way — a row each (60), a compact row (48, the name and the value) or a
tile (76, two a row from a phone's card, one a row in a narrower one), under a head that counts them from the sensor's
state. `attribute` names the
list (`auto`, the default, takes the first attribute that holds one — `flights`, `items`, `entries` or `list` first);
`items_template` is a template that gives the list instead (as JSON), so any sensor becomes one. Each item is shown by
the fields the configuration maps — `item_name`, `item_secondary`, `item_value`, `item_unit`, `item_icon`,
`item_image` and `item_url`: a field of the item (`altitude`, `airport.city`, `legs.0.from`) or words with `{field}`
in them, `{a|b}` taking b where a is empty; a number is written in your locale with its digits, a date and time as a
moment, and a " · " segment that says nothing goes — or by a preset that knows the integration's shape. `preset: auto`
(the default) draws flights where the attribute is `flights` or the items carry a `callsign` or a `flight_number`: the
callsign over the route (`AMS → BCN`) and the aircraft, the altitude in feet with a climbing or descending arrow (from
`vertical_speed`, ±100 ft/min) or "On ground", the aircraft's photo as its circle, the nearest first — and hides the
`item_*` fields; `none` keeps your mapping, `flights` asks for the preset. The figures keep the integration's units —
feet, knots, feet a minute, kilometres — as the FlightRadar24 integration reports them. `sort` orders the list by a
field (`sort_order`: `ascending` or `descending`; numbers as numbers, words as the language sorts them, items without
the field last). `max_rows` (1–20, five) is the card's height, never the list's length: fewer items, the empty panel
and a sensor out of reach keep the size, at every width (where a value would not hold beside its name, every row puts
its value under its name, in the same height). `show_count` puts the count under the title ("3 aircraft"; `subtitle` wins),
`show_image` an item's picture in its circle (one that will not load falls back to the glyph). A tap on an item opens
its sheet — the flight's airline, route, aircraft, altitude, speeds, heading, distance, position and times, with a
round to the flight on flightradar24.com; a plain item's every field — or nothing (`item_tap: none`); the head's tap
opens the sensor's details.

```yaml
type: custom:fluvy-items-card
entity: sensor.flightradar24_current_in_area # the count as its state, the aircraft in `flights`
title: Flights nearby
max_rows: 5
empty_text: Clear skies
```

A list of your own, mapped field by field:

```yaml
type: custom:fluvy-items-card
entity: sensor.metro_departures
attribute: departures
preset: none
item_name: "{line} → {destination}"
item_secondary: Platform {platform}
item_value: due
item_unit: min
sort: due
variant: compact
```

## Web page

The web page card frames a page — a lightning map, a chart of your own, a site — on a plate: under a head with the
page's host on its line (`variant: plate`, the default; `title`, `subtitle` and `icon` are yours to set), alone on the
card (`frame`) or with no card at all (`bare`). The plate keeps the shape asked for (`aspect_ratio`: `16:9` by default,
`4:3`, `3:2`, `1:1`, `2:1`, `21:9`, Home Assistant's `56%`, or `fill` for the view's height in a panel or grid view)
or the `height` written (in px, which wins); `scale` draws the page smaller (a dense map at `0.75` shows more of
itself) and `refresh` asks for it again every so many minutes while the tab is shown and the card on screen. Its rounds
sit at the plate's bottom end — open in a new tab, full screen (the plate itself; a phone that cannot opens the tab)
and reload (`show_open`, `show_fullscreen`, `show_reload`) — and a narrow plate gives them up in order, the reload
first. `look: dark` inverts the page where the page cannot be asked for a dark one — pictures invert too — and
`auto` does so only while the card is dark. A skeleton covers the plate until the page loads; one still loading after
twenty seconds says so and offers the tab. A page that refuses to be framed (its `X-Frame-Options` or its frame
ancestors) loads all the same, blank: no card can tell from outside, and the open round is the way out.

The page is framed as Home Assistant's own iframe card frames it: `sandbox: standard` (the default) is Home
Assistant's set — forms, pop-ups, pointer lock, its own origin, scripts, modals, downloads — and
`allow_open_top_navigation` lets a tap in the page send this tab elsewhere; `strict` keeps the page from its cookies
and storage (no `allow-same-origin`), its pop-ups, modals and downloads; `off` lifts every limit, which only a page of
your own deserves. The frame sends no referrer and takes `allow: fullscreen` as its permissions policy (`allow` names
another). On an https dashboard an http page is never asked for — the browser would refuse it without a word — so the
plate says the page needs https, at its size, its open round alive. Home Assistant's `type: iframe` card pastes in:
`hide_background` is the bare plate, `disable_sandbox` the level `off`.

```yaml
type: custom:fluvy-web-card
url: https://www.lightningmaps.org/?lang=en#m=oss;t=3;s=0;o=0;b=;ts=0;y=41.39;x=2.17;z=8;d=2;dl=2;dc=0
title: Lightning
aspect_ratio: 4:3
scale: 0.75
refresh: 5
show_reload: true
```

## Chart

The chart card draws any time series (#68) — a sensor's history, its long-term statistics, a list in its attributes or
a weather's forecast — from what has happened to what is to come, now marked and what is to come dashed. `series`
lists them, six at most: an entity, or the entity with what it says of itself — `source` (`history`, `statistics`,
`attribute` or `forecast`; by default a weather's forecast, the list its attributes hold where it holds one of the
usual ones, else its history), `attribute` (the list; one that says today reads its tomorrow after it, as Nordpool's
`raw_today` and `raw_tomorrow`), `time_key` and `value_key` where the list's keys are not the usual ones (`start`,
`from`, `time`, `period_start`, `datetime` …; `value`, `price`, `pv_estimate`, `temperature` …), `stat` and `period`
for statistics (a meter's change and a measurement's mean by default; an hour a reading through a week, a day beyond),
`name`, `tone` or `color`, `unit` and `decimals` (a unit its sensor's converts to scales its figures; any other names
the unit its list is written in — Solcast's kW under a kWh sensor), `curve`, `fill` and `kind`: `line`, `area`,
`columns` (drawn under the lines, on one scale) or `band` (its lows and highs). The lists read are Nordpool's (24 hours
or 96 quarters a day, and its plain `today` and `tomorrow`), Tibber's map of hours to prices, ENTSO-E's and Frank
Energie's prices, Solcast's forecast (its tenth and ninetieth percentiles a band), and any list of entries with a
moment and a value, a map of moments to values, or a day's values; quarters stay quarters and a negative price stays
negative. `span` is the window: the house's (fluvy's settings → Charts: the last 12 hours from the factory, 24 before
1.18) where it names none, or any `<N>h` or `<N>d` rolling to now (`4h`, `12h`, `24h`, `48h`, `7d`, `30d` offered),
`today`, or `today+tomorrow`, which is today alone until tomorrow's prices are published. A series of the recorder's
drawn as a line or an area runs through time as the sensor card's does, on `points` (an hour's statistics never finer
than the hour). Bars, columns, a band and a stepped line stand on whole round periods of the house's clock (12:00,
13:00 …, as many as the card's width holds calmly), each reading what Home Assistant says of its period: a bar at 12:00
is its 12:00 hour — a statistic's mean, its changes added up, its lowest or its highest as its `stat` says — the band
its lows and highs of each period, the axis on the same round times. The slot still running reads so far, paler, and
says Now.

A series wears the card's colour alone, and the palette's series colours (or the house's set, fluvy's settings →
Charts) beside others; its own `color` wins over both. It may name a colour of the palette's, which follows the
palette and the mode as the rest of the house does — `graph-1` … `graph-12` (the palette's series colours), `accent`,
`ok`, `warning`, `danger`, `notice`, `light`, and the energy states `solar`, `grid`, `battery`, `water`, `gas` and
`home` — the editor offers them by name; a Home Assistant colour's name or a `#rrggbb` stays as it is.

`thresholds` colour the line from a value up to the next threshold, each in a tone — `ok` is the good, cheap one: the
line changes colour where it crosses one, and a bar takes the tone of the threshold its value reaches. `highlight`
marks the cheapest and the dearest window of what is to come (`min`, `max` or `both`; a price's in the ok and the
danger tones, any other series' in its own) as a stretch of the plot behind the line and a pill that names it —
"Cheapest 13:00–15:00 · 0.078 EUR/kWh", shorter where the row is narrow — over `highlight_hours` (one by default);
the `step` style marks both unless told otherwise. `show_head` writes the value now big over the chart with its change
on the period before ("+5 %": a rolling window against as long a stretch before it, a calendar day against the day
before; from history or statistics), and `show_legend` names two or three series in the value row, four or more under
the axis — in the value row too, one a row, where the card is too narrow for its columns to hold every name. The chart is drawn in the house's chart style or the card's own (`chart`, and every fine key of the sensor's
chart above); a pointer, a held finger or the keys (← → a slot, Home, End, Escape) read it, and the value row reads
with it. `variant`: `full` (the head, the value row, the chart and its axis), `compact` (the head, the chart, its
axis) or `tile` (the value over a spark of every series). Its height is its variant's and its series count's at every
width — loading, empty or out of reach it keeps it — and where the value row has nothing to say, the chart takes its
room, as it gives the legend the lines it takes past its own.

```yaml
type: custom:fluvy-chart-card
title: Electricity price
icon: mdi:flash
series:
  - entity: sensor.nordpool_kwh_nl_eur_3_10_021 # raw_today and raw_tomorrow, read on their own
    tone: ok # the line where it is cheap
span: today+tomorrow
chart: step
thresholds:
  - tone: warning
    value: 0.18
  - tone: danger
    value: 0.26
highlight: both
highlight_hours: 2
```

The measured temperature and the forecast after it, on one chart:

```yaml
type: custom:fluvy-chart-card
title: Temperature
series:
  - entity: sensor.living_room_temperature
    name: Living room
  - entity: weather.home # its hourly forecast
    name: Outside
    color: graph-4 # the palette's fourth series colour, whatever the palette
span: today+tomorrow
chart: soft
```

## Energy usage

The energy usage card draws the house's energy as Home Assistant's usage graph does (#62): a column for each hour of a
day, each day of a week or a month, each month of a year, stacked from the line up by where the house took it from —
the sun, the battery, the grid on top — and down by what went into the battery and out to the grid, each in its
source's colour. The figures are the Energy dashboard's statistics allocated the dashboard's own way, bucket by bucket
(an hour of a day, a day of a week or a month, a month of a year), so one bucket's import is never netted against
another's export and the card says what Home Assistant's graph says. The
head says what the house used over the range, the legend each series' total, and a finger on the chart reads a slot's
whole stack in a bubble (← → walk the slots from the keyboard, Escape lets go). `period` is the span while no date
picker is followed — `day` (today, the default), `week`, `month` or `year`, each its calendar span, with Day · Week ·
Month · Year chips (`show_period`) — and `compare` draws the period before as quiet ghost columns behind the bars, its
figure in the bubble. Given a `collection_key` the card follows that Energy date picker (Home Assistant's own, or the
Energy period card) with Home Assistant's own statistics for its range: its chips go, and the picker's Compare draws
the ghosts. `sources` lists the sources drawn, in the order they stack, each with its `name`, its `color` (a colour of
the palette's, as a Chart card's series may name one, which follows the palette; or a colour name or a `#rrggbb`) and
`show` (none: every source the Energy dashboard has); past `max_sources` the last fold into "Other"; `show_returns: false`
leaves out what went out, `show_legend: false` the legend. `variant: compact` is the chart and its axis alone, `mini` a
strip under the head. Each slot is one column, its parts flush and only its outer ends rounded, on a scale that hugs
what the columns reach on both sides of zero; `chart` draws them `classic` in their inks (`columns`, the same look,
draws as classic), or `soft` a step lighter; `show_axis` and `show_grid` turn the scale and its gridlines off, and
`unit` and `decimals` say how the figures read. With no Energy dashboard the card says so.

```yaml
type: custom:fluvy-energy-usage-card
period: week
compare: true # last week behind this one
sources:
  - { type: solar, name: Roof }
  - battery
  - { type: grid, color: '#7c5cff' }
```

Following a date picker on the dashboard:

```yaml
type: custom:fluvy-energy-usage-card
collection_key: energy_casa # the key of a date picker on this dashboard
variant: compact
```

## Slider

The slider card sets any value on the light card's anatomy (#77): its head, its figure with the − and + (`show_stepper`),
and Fluvy's ruler under them — a relative drag, slower as the finger slides away, the fine scale on a hold, the arrow
keys, Page Up and Down, Home and End. It sets a media player's volume (the head's round mutes it; the line says what
plays, else its source), a `number` or an `input_number` in its own range, step and unit, and a fan's speed in its own
speeds, named under the ruler. `min` and `max` narrow the ruler within the entity's range (a soundbar kept under 60 %),
and `label` names the figure (Volume, Speed or Value by default). The ruler draws a tick a step where its steps are no
more than twenty — every value it can stop at — and its 5 % and 25 % ticks otherwise; a range that crosses zero (an
offset of −2 to +2) is lit from zero to the knob, its figures signed. The head ends in what the entity is set with:
`control: auto` mutes a player, switches a fan, or switches `toggle_entity` — another entity's switch, as a soundbar
whose volume is a `number` and whose power is a switch — and `mute`, `switch` or `none` ask for one. `live_update`
sends the value while the finger drags (heard at once on a volume), else once on release; a stepper's taps are one call
once they stop. `variant: compact` keeps the head, with the figure on its line, and the ruler (188 at a 360 column, two
on a line in half a section); `tile` is the house's large tile with the ruler at its foot, as the tile card draws a
player's volume or a number. `tone`, `color` and `tint` are the light card's: the colour shows on the surface while what
it sets is on (`on`; a tile's default), at rest too (`always`), or never (`off`; the full and compact card's default).

```yaml
type: custom:fluvy-slider-card
entity: number.soundbar_volume # the volume, a number of its integration
toggle_entity: switch.soundbar_power # its power, a switch of its own
name: Soundbar
variant: compact
live_update: true
```

A player's volume, kept under 60 %:

```yaml
type: custom:fluvy-slider-card
entity: media_player.living_room
max: 60
```

## Helpers

The helpers card draws each helper as its own control: a number with its figure, − and + and ruler, a text as its
field, a switch, a date or a time, a button as a row, and a select as its options in chips. A select of more than six
options is a row whose value opens Fluvy's own dropdown (#96): the list unfolds under the value, the option chosen
checked; a tap, or the arrow keys and Enter (a letter finds the next name), chooses one (`select_option`), and Escape
or a tap elsewhere closes it with nothing changed. A select's row may offer a part of its options, in the order it
names them (`options`: of those the select lists — a few of an oven's thirty modes for its upper zone), name an
option in words of its own where its integration left it raw (`labels`), and be chips or a dropdown whatever its
length (`display`: `auto`, the default — chips up to six — `chips` or `dropdown`). Options it names that the select
does not list are left out; where it names none the select lists, it offers them all.

```yaml
type: custom:fluvy-helpers-card
rows:
  - entity: select.oven_cooking_mode
    name: Upper zone
    options: [conventional, fan_conventional, grill, pizza] # four of thirty: chips, in this order
  - entity: select.tv_picture_mode
    display: dropdown
    labels:
      gen_589828: AI Mode
```

A select's row on the entities card, and among the rows of the lock, alarm and camera cards, ends in its value the
same way, whatever its length: the value opens the same dropdown, chooses with `select_option`, and takes the same
`options` and `labels`. A row with a `tap_action` of its own keeps it and shows its value in its `labels`; out of
reach, the value is a dash on a button that does nothing.

```yaml
type: custom:fluvy-entities-card
rows:
  - entity: select.oven_cooking_mode
    options: [conventional, fan_conventional, grill, pizza]
    labels:
      fan_conventional: Fan oven
```

## Openings

The openings card says each sensor's state once, in the words its class deserves — a door's Open and Closed, a
motion's Detected and Clear, a leak's Wet and Dry — and counts what needs acting on in its head ("2 open", "1 alert"):
an open door, window or cover, a leak, smoke, a problem. A row may read its sensor as a class of its own
(`device_class`, Home Assistant's binary sensor classes: `door`, `window`, `garage_door`, `opening`, `motion`,
`moisture`, `smoke` …), for a sensor that has none or the wrong one: it takes the class's words, its icon (open or shut
as it stands) and whether it counts (#102). A row may also say a state in words of its own (`states`, by the state:
`on`, `off`; a cover's `open`, `closed`), before the class's. The class decides what counts: a tilt sensor given words
alone reads "Tilted" and never counts as open; given `device_class: window`, a tilted window counts as an open one. In
a dashboard in YAML mode, Home Assistant reads an unquoted `on:` or `off:` as true or false; the card reads those as
on and off, so the example below works as written there too.

```yaml
type: custom:fluvy-openings-card
rows:
  - binary_sensor.bedroom_window # the contact, a window
  - entity: binary_sensor.bedroom_window_tilt # the tilt, of no class: said, never counted
    name: Tilt
    icon: mdi:window-open-variant
    states:
      on: Tilted
      off: Closed
  - entity: binary_sensor.side_door_contact # a contact of no class, read as a door
    device_class: door
```

## Calendar

The calendar card draws one table of events as the view chosen: the day's agenda, the month, the week's strip,
the month and the day, the day's timeline, the upcoming days or a tile. The week and the month start on the day
`first_weekday` says — a weekday, or `language`, the default: your profile's, else your language's. The week view
may roll instead (#111): `first_weekday: today` makes its strip today and the six days after it, "Next 7 days", so on
a Sunday it shows the week ahead and not the one ending; it rolls over at midnight on its own, as a wall dashboard
that is never reloaded needs, and a day picked in it stays picked while it is in the strip. A month keeps your
week's first day.

```yaml
type: custom:fluvy-calendar-card
variant: week
first_weekday: today
calendars:
  - calendar.family
  - calendar.work
```

## Rooms

The room card draws a room from its area: its picture (`photo`), a head (`tile`) or a compact tile (`row`), its
readings, how many of its devices are on, and its controls as rows or tiles. Its devices are what a person calls a
room's devices: its lights, its switches that power something (a plug that says it is one, or one switch beside a
power or energy reading), its fans, covers, players, thermostats and vacuums; never a sensor, nor an appliance's own
options. `include` counts what that leaves out and `exclude` leaves out what it shows, each a list of entity ids,
patterns of ids (`switch.dishwasher_*`), device ids or domains (`media_player`); an entity or a device you name comes
from wherever its area is, and what a room includes it keeps whatever it excludes. What a room leaves out leaves its
count, its rows and its readings.

Its **quick actions** stand at the end of its head, its row or its picture: a round each, as many as the width holds
once the name has its room (none in half a phone's section), each a switch for all it stands for and a ring of how
much of it is on. By default they are the room's lights (their ring: the light the room gives of all it could, a dimmed
light by its brightness) and its blinds (their ring: where they stand); `quick_actions` asks for the room's `lights`,
`covers`, `fans` or `media`, or any entity, in your order, each with its own `name`, `icon`, `tone`, `color`,
`tap_action` and `hold_action`. A tap turns a set off while any of it is on and on otherwise; blinds open, close, or
stop while they move; players pause, else play. Each takes what it can, one call a service: a blind that only tilts
moves its slats, a player that cannot pause stops or goes off, one that can do neither is left out, and a round none
of whose members can act takes no tap. With a `confirmation` Home Assistant asks first, once for all the round moves
(blinds that only tilt beside blinds that close as well), and nothing moves before its answer. A hold (or
`more-info`) opens an entity's details, or where the room opens for a set of several. `show_quick_actions: false` hides
them. `show_arrow: false` hides the arrows on a tile's head and on its rows, so the words have their room; a tap still
opens the room.

```yaml
type: custom:fluvy-room-card
area: kitchen
exclude:
  - switch.dishwasher_*
include:
  - switch.coffee_machine
quick_actions:
  - lights
  - covers
  - entity: switch.kettle
    name: Kettle
    color: '#e2725b'
```

The automatic dashboards take the same say per room: `rooms` in the dashboard's raw configuration, by area id, tunes
that room's card, its count and its page.

```yaml
strategy:
  type: custom:fluvy-home
  rooms:
    kitchen:
      exclude: [switch.dishwasher_*]
```

## Vehicle

The vehicle card (#84) draws an electric car from its device: give it the car's `device` (or any of its `entity`s) and
it finds the rest by what its integration calls them — Tesla Fleet, Teslemetry and Tessie, Renault, Volvo and Škoda
from Home Assistant, and Kia and Hyundai (kia_uvo), MySkoda, Polestar, MG (mg_saic), Volkswagen's two and BMW's
CarData from HACS — and any other by what its entities are (a battery's charge, a lock, a climate, a tracker).
`roles` names an entity for a part it does not find, or plays otherwise (`{ role: range, entity: … }`); with
`scan: false` only those play. What could move, wake or sound the car — a horn, its lights, keyless driving, a remote
engine start, a forced refresh that drains its small battery, valet mode — is never a control, nor is a charge cable's
latch taken for the car's lock, or its 12 V battery for its own.

The whole card is a head (the car, where it is when no row says it — its address, away from home, where its
integration gives one — and how long since it last reported, "Updated 2 h ago"; what it does in the badge: Charging ·
7.2 kW, Driving · 64 km/h, Charged, Plugged in, Parked, Asleep), its battery on the car charger's ruler with its range
beside it and its charge limit marked (`hero: ring` draws it as a ring, the limit a dot on it), and a line under it
saying the most pressing: why a charge failed; while it charges, when it will be at its limit — the clock time, how long
from now and how fast its range grows ("80 % at 22:59 · 1 h 12 min left · +46 km/h"); a range that runs low (under
`low_range`, in the range's unit, or a fifth of its charge); a window, a door or a boot left open; its charge limit
reached; plugged in and not charging; a cabin too cold or too hot to get into while its climate is off. Under it, its
controls as one row of rounds — the lock, the climate, the charge, the boot, the windows, the front boot and sentry, the
ones the car has, as many as the column holds with their words — each acting on the car and asking first where it
matters (unlocking, opening the boot or the front boot, venting or closing the windows, stopping a charge, turning
sentry off), each holding for its details; then `rows` (where it is and how far it has gone; its inside and outside
temperatures, its charging power and rate, its limit, its time to full, its software, its speed, its fuel, or any
entity) and its tyres from above (`show_tyres`: each pressure at its wheel, a low one in the warning's ink). A car out of
reach keeps every part in its place, its values dashes and its controls still.

`variant: compact` keeps the head (its range leading the line), the battery as a bar with its limit marked and a row of
rounds; `mini` is a strip: the car's circle ringed by its charge, its name over its charge, range and what it does, and
its first control. `controls` is an ordered list (each with its `name`, `icon`, `color`, `confirm`, `tap_action` and
`hold_action`; nine of them wrap into even rows), and so is `rows`; every part switches off (`show_range`, `show_limit`,
`show_status`, `show_controls`, `show_rows`); `image` is a picture of the car — an address, an image or camera entity,
or `auto` for the one its integration gives — over the battery or in the head (`image_position`); `range_unit` (km or
mi) and `power_unit`, each with its decimals; `hero_tap_action` and `hero_hold_action` answer the battery.

```yaml
type: custom:fluvy-vehicle-card
device: 7c1e…            # the car's device; or entity: one of its entities
image: /local/model-y.png
controls: [lock, climate, charging, trunk, frunk]
rows: [location, odometer, inside]
show_tyres: true
low_range: 50
```

A Nissan Leaf on Home Assistant's own integration has no device: its entities are named by hand.

```yaml
type: custom:fluvy-vehicle-card
scan: false
name: Leaf
roles:
  - { role: battery, entity: sensor.leaf_charge }
  - { role: range, entity: sensor.leaf_range }
  - { role: plugged, entity: binary_sensor.leaf_plug_status }
  - { role: charging, entity: binary_sensor.leaf_charging_status }
  - { role: climate_switch, entity: switch.leaf_climate_control }
```

<!-- generated:cards -->

## Everyday

| Card | Type | What it is | Options | Reads |
| --- | --- | --- | --- | --- |
| **Tile** | `custom:fluvy-tile-card` | A light, switch, cover, fan, player, number or sensor as a tile: large with a precision ruler or two readouts, compact row, or mini. | `size` (`large`, `compact`, `mini`), `name_lines` (`1`, `2`), `since`, `tint` (`on`, `always`), `light_colors`, `light_whites` (`palette`, `temperature`), `readouts` | — |
| **Tiles** | `custom:fluvy-tiles-card` | A group of compact or mini tiles, two to four per row, 8 px apart. | `size` (`compact`, `mini`, `large`), `columns` (`1`, `2`, `3`, `4`, `auto`), `name_lines` (`1`, `2`), `tint` (`on`, `always`), `light_colors`, `light_whites` (`palette`, `temperature`), `readouts`, `empty_text`, `hide_empty`, `tiles` (a list: `entity`, `name`, `icon`, `tone`, `color`, `readouts`, `since`, `unavailable`, `tap_action`, `hold_action`) | `entities` → `tiles` |
| **Template** | `custom:fluvy-template-card` | A tile whose name, line, icon, colour and fill are templates, with or without an entity; a Mushroom template card pastes in. | `secondary` (`state`, `area`, `last-changed`, `none`), `since`, `variant` (`compact`, `mini`, `large`), `active` (`auto`, `always`, `never`), `name_lines` (`1`, `2`), `tint` (`on`, `always`), `readouts` | `primary` → `name`, `icon_color` → `color`, `layout` → `variant`, `vertical` → `variant` |
| **Light** | `custom:fluvy-light-card` | The precision dimmer: relative drag, slide away to slow down, hold for the 1 % scale, colour temperature. | `show_brightness` (`true`, `when_on`, `false`), `variant` (`auto`, `full`, `compact`), `show_stepper`, `live_update`, `show_temperature`, `show_color`, `temperature_tint`, `tint` (`off`, `on`, `always`), `tint_strength` (`soft`, `brightness`, `full`, `full_brightness`), `light_whites` (`palette`, `temperature`), `colors` (a list: `color`, `name`, `rgb`) | — |
| **Slider** | `custom:fluvy-slider-card` | Any value on the precision ruler: a player’s volume with its mute, a number or a helper, a fan’s speed, another entity’s switch in its head. | `variant` (`full`, `compact`, `tile`), `show_stepper`, `control` (`auto`, `mute`, `switch`, `none`), `toggle_entity`, `min`, `max`, `label`, `live_update`, `tint` (`off`, `on`, `always`) | — |
| **Room lights** | `custom:fluvy-lights-card` | A room’s lights on one card: one tap for the whole room, a round, chip or tile for each light, in its colour. | `area`, `variant` (`row`, `chips`, `tiles`), `show_brightness`, `show_count`, `show_level`, `show_color`, `color_action` (`sheet`, `more-info`), `color_control` (`ruler`, `wheel`), `light_colors`, `light_whites` (`palette`, `temperature`), `tint` (`on`, `always`), `name_lines` (`1`, `2`), `empty_text`, `hide_empty`, `lights` (a list: `entity`, `name`, `icon`, `color`), `colors` (a list: `color`, `name`, `rgb`) | `entities` → `lights` |
| **Thermostat** | `custom:fluvy-thermostat-card` | Climate, water heater or humidifier on a dial, with modes, presets and fan speeds. | `image`, `subtitle`, `variant` (`dial`, `compact`, `ruler`), `show_stepper`, `show_modes`, `modes_style` (`tiles`, `chips`, `full`), `modes` (`off`, `heat`, `cool`, `heat_cool`, `auto`, `dry`, `fan_only`), `show_current`, `show_presets`, `preset_style` (`full`, `chips`), `show_fan`, `fan_style` (`full`, `chips`), `when_off` (`all`, `essentials`) | — |
| **Entities** | `custom:fluvy-entities-card` | Rows of entities: a switch for what toggles, the value for what is measured. | `title`, `subtitle`, `variant` (`rows`, `compact`), `show_count`, `light_colors`, `light_whites` (`palette`, `temperature`), `more`, `more_path`, `empty_text`, `hide_empty`, `rows` (a list: `entity`, `name`, `icon`, `secondary`, `since`, `options`, `labels`, `tone`, `color`, `tap_action`) | `entities` → `rows` |
| **Items** | `custom:fluvy-items-card` | The items of a sensor’s list attribute, a row each — flights overhead, departures, deliveries — with a flights preset for FlightRadar24. | `title`, `subtitle`, `attribute` (`auto`), `preset` (`auto`, `none`, `flights`), `item_name`, `item_secondary`, `item_value`, `item_unit`, `item_icon`, `item_image`, `item_url`, `items_template`, `sort`, `sort_order` (`ascending`, `descending`), `variant` (`rows`, `compact`, `tiles`), `max_rows`, `show_count`, `show_image`, `item_tap` (`sheet`, `none`), `empty_text`, `hide_empty` | — |
| **Media** | `custom:fluvy-media-card` | A media player: artwork, seek bar, transport and volume — full, compact row or hero. | `secondary`, `image`, `image_mode` (`fallback`, `always`), `variant` (`full`, `mini`, `hero`), `source_style` (`full`, `chips`), `show_source`, `show_volume`, `show_power`, `controls` (`power`, `previous`, `play`, `next`, `volume`) | — |
| **Now playing** | `custom:fluvy-now-playing-card` | The compact player of the home screen: artwork, thin progress, transport and volume. | `show_volume`, `show_power`, `controls` (`power`, `previous`, `play`, `next`, `volume`) | — |
| **Remote** | `custom:fluvy-remote-card` | A TV remote in Fluvy’s hand: power, sources, a D-pad with OK, playback, volume routed where you like, channels, the apps with their logos, keys of your own. | `remote`, `volume_entity`, `variant` (`full`, `compact`, `pad`, `row`), `off_keys` (`live`, `power`), `groups` (`source`, `dpad`, `transport`, `volume`, `channel`, `apps`, `custom`), `dpad` (`ring`, `grid`), `ok_label` (`word`, `plain`), `side_keys` (`auto`, `sides`, `row`), `nav` (`power`, `up`, `down`, `left`, `right`, `ok`, `back`, `home`, `menu`, `info`, `guide`, `captions`, `settings`, `input`, `assistant`, `exit`, `play_pause`, `play`, `pause`, `stop`, `rewind`, `forward`, `previous`, `next`, `record`, `volume_up`, `volume_down`, `mute`, `channel_up`, `channel_down`), `transport` (`power`, `up`, `down`, `left`, `right`, `ok`, `back`, `home`, `menu`, `info`, `guide`, `captions`, `settings`, `input`, `assistant`, `exit`, `play_pause`, `play`, `pause`, `stop`, `rewind`, `forward`, `previous`, `next`, `record`, `volume_up`, `volume_down`, `mute`, `channel_up`, `channel_down`), `volume` (`auto`, `ruler`, `keys`, `stepper`), `apps_style` (`circles`, `chips`), `apps_tint` (`open`, `always`), `keys` (`power`, `up`, `down`, `left`, `right`, `ok`, `back`, `home`, `menu`, `info`, `guide`, `captions`, `settings`, `input`, `assistant`, `exit`, `play_pause`, `play`, `pause`, `stop`, `rewind`, `forward`, `previous`, `next`, `record`, `volume_up`, `volume_down`, `mute`, `channel_up`, `channel_down`), `controls` (`power`, `up`, `down`, `left`, `right`, `ok`, `back`, `home`, `menu`, `info`, `guide`, `captions`, `settings`, `input`, `assistant`, `exit`, `play_pause`, `play`, `pause`, `stop`, `rewind`, `forward`, `previous`, `next`, `record`, `volume_up`, `volume_down`, `mute`, `channel_up`, `channel_down`), `commands`, `apps` (a list: `app`, `name`, `icon`, `image`, `color`, `source`, `key`, `tap_action`), `custom` (a list: `name`, `icon`, `key`, `tap_action`) | — |
| **Cover** | `custom:fluvy-cover-card` | Blinds, shutters, garage doors and valves: vertical position ruler, tilt, open · stop · close, favourites. | `subtitle`, `tilt_angle`, `variant` (`full`, `compact`), `favorites_style` (`full`, `chips`), `show_tilt`, `show_favorites`, `favorites` (a list: `name`, `position`, `tilt`) | — |
| **Fan** | `custom:fluvy-fan-card` | Speed ruler with steps, oscillation, direction and presets. | `subtitle`, `variant` (`full`, `compact`), `show_stepper`, `show_presets`, `preset_style` (`full`, `chips`), `show_oscillation`, `show_direction`, `when_off` (`all`, `essentials`) | — |
| **Vacuum** | `custom:fluvy-vacuum-card` | Robot vacuum or mower: battery, start · stop · dock · locate, suction. | `subtitle`, `variant` (`full`, `compact`), `show_battery`, `battery_entity`, `area_entity`, `duration_entity`, `remaining_entity`, `suction_style` (`full`, `chips`) | — |
| **Lock** | `custom:fluvy-lock-card` | Slide to unlock, never one accidental tap; codes, jammed state, related rows. | `subtitle`, `variant` (`full`, `compact`), `show_rows`, `rows` (a list: `entity`, `name`, `icon`, `secondary`, `since`, `options`, `labels`, `tone`, `color`, `tap_action`) | — |
| **Alarm** | `custom:fluvy-alarm-card` | Arm modes as tiles and the keypad sheet for codes. | `subtitle`, `variant` (`tiles`, `compact`), `modes` (`disarm`, `arm_home`, `arm_away`, `arm_night`, `arm_vacation`, `arm_custom_bypass`), `show_rows`, `rows` (a list: `entity`, `name`, `icon`, `secondary`, `since`, `options`, `labels`, `tone`, `color`, `tap_action`) | — |
| **Camera** | `custom:fluvy-camera-card` | A still that refreshes itself, or Home Assistant’s live stream, in the shape you choose; tap for the stream. | `subtitle`, `camera_view` (`auto`, `live`), `refresh`, `aspect_ratio` (`16:9`, `4:3`, `3:2`, `1:1`, `2:1`, `21:9`, `native`), `fit_mode` (`cover`, `contain`), `show_rows`, `rows` (a list: `entity`, `name`, `icon`, `secondary`, `since`, `options`, `labels`, `tone`, `color`, `tap_action`) | `sub` → `subtitle` |
| **Cameras** | `custom:fluvy-cameras-card` | Several cameras at a glance, each picture live or refreshing itself with its name and what it sees; a sheet of them all. | `title`, `subtitle`, `area`, `variant` (`grid`, `list`, `compact`), `columns` (`auto`, `1`, `2`, `3`, `4`), `camera_view` (`auto`, `live`), `max_live`, `refresh`, `aspect_ratio` (`16:9`, `4:3`, `3:2`, `1:1`, `2:1`, `21:9`, `native`), `fit_mode` (`cover`, `contain`), `show_status`, `status` (`auto`, `motion`, `state`, `none`), `show_live`, `show_fullscreen`, `empty_text`, `hide_empty`, `cameras` (a list: `entity`, `name`, `icon`, `motion`, `status`, `camera_view`, `refresh`, `fit_mode`, `tone`, `color`, `tap_action`, `hold_action`) | `entities` → `cameras` |
| **3D printer** | `custom:fluvy-printer-card` | A 3D printer’s job: progress, time left, heaters, layers, filament and the camera; pause, resume and stop. OctoPrint, PrusaLink, Bambu Lab, Moonraker, Creality, Elegoo, Anycubic, Snapmaker and FlashForge. | `device`, `variant` (`full`, `compact`, `row`), `readouts` (`nozzle`, `bed`, `chamber`, `layer`, `speed`, `filament`, `elapsed`), `show_image`, `image` (`auto`, `camera`, `preview`), `camera_view` (`auto`, `live`), `fit_mode` (`cover`, `contain`), `aspect_ratio` (`16:9`, `4:3`, `3:2`, `1:1`, `2:1`, `21:9`, `native`), `show_filament`, `show_controls`, `sensors` (a list: `entity`, `name`), `roles` (a list: `role`, `entity`) | — |
| **Appliance** | `custom:fluvy-appliance-card` | A washer, dryer, dishwasher, oven, hob, fridge, coffee machine, pet feeder, fountain, litter box or small appliance on a plug, pictured: what it does, when it is ready, what it uses, its reminders. | `device`, `kind` (`auto`, `washer`, `dryer`, `washer_dryer`, `dishwasher`, `oven`, `microwave`, `hob`, `hood`, `fridge`, `freezer`, `wine`, `coffee`, `kettle`, `air_fryer`, `toaster`, `blender`, `sandwich_maker`, `feeder`, `fountain`, `litter_box`, `appliance`), `variant` (`full`, `compact`, `ring`, `row`), `picture` (`art`, `icon`, `none`), `image`, `picture_min` (`auto`, `32`, `44`, `64`), `show_power`, `power_action`, `show_notify`, `show_hero`, `show_progress`, `progress_style` (`auto`, `bar`, `steps`), `time` (`both`, `left`, `end`), `show_zones`, `setpoint_style` (`readout`, `stepper`), `show_modes`, `modes_style` (`chips`, `tiles`), `modes` (`super_cool`, `super_freeze`, `eco`, `holiday`, `ice_maker`, `sabbath`, `child_lock`), `show_drinks`, `drinks`, `feed_amount`, `unit` (`both`, `main`, `sub`), `show_rows`, `row_values` (`inline`, `end`, `plain`), `readouts` (`program`, `temperature`, `spin`, `dryness`, `energy`, `water`, `cycles`, `detergent`, `elapsed`, `total`, `this_cycle`, `probe`, `power`), `show_controls`, `show_programs`, `controls` (`start`, `pause`, `stop`, `power`, `light`, `feed`, `clean`, `deodorize`, `level`), `confirm` (`start`, `resume`, `pause`, `stop`, `off`, `feed`, `clean`, `level`), `show_maintenance`, `low_level`, `low_days`, `unload_reminder`, `unload_after`, `done_for`, `door_alert`, `running_power`, `finished_after`, `scan`, `rows` (a list: `key`, `entity`, `name`, `icon`, `color`, `tap_action`, `hold_action`), `tiles` (a list: `key`, `entity`, `name`, `icon`, `color`, `tap_action`, `hold_action`), `sensors` (a list: `entity`, `name`), `maintenance` (a list: `key`, `name`, `icon`, `color`, `tap_action`, `hold_action`), `zones` (a list: `entity`, `name`, `icon`, `color`, `tap_action`, `hold_action`), `roles` (a list: `role`, `entity`) | — |
| **Appliances** | `custom:fluvy-appliances-card` | The house’s appliances as live rows, or their whole cards side by side: what runs, what is done, what waits. | `title`, `subtitle`, `variant` (`rows`, `compact`, `tiles`, `cards`), `max_rows`, `picture` (`art`, `icon`, `none`), `picture_min` (`auto`, `32`, `44`, `64`), `confirm` (`start`, `resume`, `pause`, `stop`, `off`, `feed`, `clean`, `level`), `show` (`all`, `active`), `sort` (`state`, `name`, `none`), `show_count`, `hide_empty`, `empty_text`, `appliances` (a list: `device`, `entity`, `name`, `icon`, `color`, `kind`, `tap_action`, `hold_action`) | — |
| **Vehicle** | `custom:fluvy-vehicle-card` | An electric car: its battery, range and charge limit, when it is full, where it is, and its lock, climate, charging, boot and windows in one row. Tesla, BMW, Renault, Volvo, Kia, Hyundai, Volkswagen, Škoda, Polestar, MG and more. | `device`, `scan`, `variant` (`full`, `compact`, `mini`), `hero` (`ruler`, `ring`), `image`, `image_position` (`hero`, `head`), `show_range`, `show_limit`, `show_status`, `show_controls`, `show_rows`, `show_tyres`, `low_range`, `stale_after`, `range_unit` (`auto`, `km`, `mi`), `range_decimals` (`auto`, `0`, `1`, `2`), `power_unit` (`auto`, `W`, `kW`), `power_decimals` (`auto`, `0`, `1`, `2`), `hero_tap_action`, `hero_hold_action`, `controls` (a list: `control`, `name`, `icon`, `color`, `confirm`, `tap_action`, `hold_action`), `rows` (a list: `row`, `entity`, `name`, `icon`, `color`, `tap_action`, `hold_action`), `roles` (a list: `role`, `entity`) | — |
| **Weather** | `custom:fluvy-weather-card` | Condition, temperature, feels-like, wind and the daily or hourly forecast. | `show_name`, `variant` (`full`, `compact`), `forecast` (`daily`, `hourly`, `both`), `days`, `show_forecast`, `hourly_step` | `forecast` → `show_forecast` |
| **Sensor** | `custom:fluvy-sensor-card` | A sensor with its curve, trend, min, max and average, or up to three sensors on one chart. | `subtitle`, `variant` (`chart`, `tile`), `hours`, `show_stats`, `label`, `chart` (`classic`, `soft`, `glow`, `minimal`, `step`, `bars`, `columns`), `points` (`auto`, `5m`, `15m`, `30m`, `1h`), `curve` (`smooth`, `straight`, `step`), `fill` (`gradient`, `flat`, `none`), `line_width` (`thin`, `regular`, `bold`), `glow`, `show_points` (`none`, `end`, `all`), `show_grid` (`auto`, `none`, `x`, `y`, `both`), `show_axis`, `highlight` (`none`, `min`, `max`, `both`, `current`), `animate`, `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`, `L`, `m³`, `gal`, `ft³`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `entities` (a list: `entity`, `name`, `icon`, `color`) | — |
| **Readouts** | `custom:fluvy-readouts-card` | Up to four values side by side with their trends. | `hours`, `variant` (`grid`, `row`), `empty_text`, `hide_empty`, `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`, `L`, `m³`, `gal`, `ft³`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `rows` (a list: `entity`, `name`, `unit`, `decimals`, `tap_action`) | `entities` → `rows` |
| **People** | `custom:fluvy-people-card` | Who is home: avatars, zones, times and phone batteries, each person with a tap of their own. | `title`, `variant` (`grid`, `rows`), `map_path`, `show_zone`, `show_time`, `show_battery`, `empty_text`, `hide_empty`, `people` (a list: `entity`, `name`, `battery`, `color`, `since`, `tap_action`, `hold_action`) | `layout` → `variant`, `entities` → `people` |
| **Openings** | `custom:fluvy-openings-card` | Doors, windows and motion at a glance, with what is open counted. | `title`, `subtitle`, `variant` (`rows`, `compact`, `tiles`), `max_rows`, `show_count`, `show_time`, `since_pattern`, `empty_text`, `hide_empty`, `rows` (a list: `entity`, `name`, `icon`, `color`, `device_class`, `states`, `since`, `tap_action`, `hold_action`) | `entities` → `rows` |
| **Alerts** | `custom:fluvy-alerts-card` | What needs a look — low batteries, devices gone, doors left open, leaks, updates, repairs — each from one line, as tiles, chips, rows or a banner, hidden while all is clear. | `title`, `subtitle`, `variant` (`tiles`, `mini`, `chips`, `rows`, `banner`), `columns` (`1`, `2`, `3`, `4`, `auto`), `show_count`, `show_culprit`, `show_duration`, `compact`, `order` (`severity`, `config`), `rotate`, `snooze` (`user`, `device`, `house`, `off`), `max_alerts`, `empty_text`, `hide_empty`, `alerts` (a list: `preset`, `name`, `icon`, `severity`, `tone`, `color`, `entity`, `domain`, `device_class`, `entity_id`, `integration`, `state`, `not_state`, `above`, `below`, `attribute`, `phones`, `acknowledged`, `area`, `floor`, `label`, `device`, `exclude`, `for`, `unchanged_for`, `include_unavailable`, `hidden`, `diagnostic`, `count_by`, `min_count`, `name_by`, `sort_rows`, `split`, `snooze`, `admin_only`, `tap_action`, `hold_action`, `row_action`, `row_hold_action`, `row_button`, `actions`, `conditions`, `escalate`, `match`, `id`) | — |

## Rooms and the map

| Card | Type | What it is | Options | Reads |
| --- | --- | --- | --- | --- |
| **Room** | `custom:fluvy-room-card` | A room of the house from its area: its picture, its climate, what is on, and its controls. | `area`, `variant` (`photo`, `tile`, `row`), `controls` (`rows`, `tiles`, `none`), `show_climate`, `show_count`, `show_quick_actions`, `show_arrow`, `picture`, `path`, `temperature_entity`, `humidity_entity`, `include`, `exclude`, `tint` (`on`, `always`), `name_lines` (`1`, `2`), `light_colors`, `light_whites` (`palette`, `temperature`), `tiles` (a list: `entity`, `name`, `icon`, `tone`, `color`, `readouts`, `since`, `tap_action`, `hold_action`), `quick_actions` (a list: `group`, `entity`, `name`, `icon`, `tone`, `color`, `tap_action`, `hold_action`) | — |
| **Map** | `custom:fluvy-map-card` | Where everyone is: the house’s zones as columns of faces, a row a person, or Home Assistant’s map on a plate. | `title`, `variant` (`zones`, `map`, `rows`), `map_shape` (`wide`, `square`), `hours_to_show`, `default_zoom`, `fit_zones`, `show_empty`, `show_distance`, `map_path`, `empty_text`, `hide_empty`, `zones` (a list: `entity`, `name`, `icon`) | — |

## Structure and navigation

| Card | Type | What it is | Options | Reads |
| --- | --- | --- | --- | --- |
| **Hello** | `custom:fluvy-hello-card` | The greeting: name, date, weather and avatar. | `person`, `weather`, `show_weather`, `show_date`, `show_avatar` | — |
| **Chips** | `custom:fluvy-chips-card` | A row of chips that navigate between views or open entities. | `tint` (`on`, `always`), `empty_text`, `hide_empty`, `chips` (a list: `name`, `icon`, `path`, `entity`, `color`, `action`) | `label` → `name` |
| **Heading** | `custom:fluvy-heading-card` | A section title with its count and a link. | `title`, `heading_style` (`title`, `subtitle`), `variant` (`bar`, `plain`), `subtitle`, `path` | `meta` → `subtitle` |
| **Web page** | `custom:fluvy-web-card` | A web page on a plate — a map, a chart, a site of your own — under a head, in a frame or bare; sandboxed as Home Assistant’s iframe card is. | `url`, `variant` (`plate`, `frame`, `bare`), `title`, `subtitle`, `aspect_ratio` (`16:9`, `4:3`, `3:2`, `1:1`, `2:1`, `21:9`, `fill`), `height`, `scale`, `refresh`, `look` (`page`, `dark`, `auto`), `sandbox` (`standard`, `strict`, `off`), `allow_open_top_navigation`, `allow`, `show_open`, `show_fullscreen`, `show_reload` | `hide_background` → `variant`, `disable_sandbox` → `sandbox` |

## Scenes, actions and helpers

| Card | Type | What it is | Options | Reads |
| --- | --- | --- | --- | --- |
| **Scene** | `custom:fluvy-scene-card` | One scene, script or button as a tile with a done state. | `subtitle`, `show_subtitle` | `meta` → `subtitle` |
| **Scenes** | `custom:fluvy-scenes-card` | A grid of scenes and scripts. | `title`, `columns` (`auto`, `1`, `2`), `tint` (`on`, `always`), `empty_text`, `hide_empty`, `scenes` (a list: `entity`, `name`, `icon`, `subtitle`, `color`, `tap_action`) | `entities` → `scenes` |
| **Actions** | `custom:fluvy-actions-card` | Buttons and scripts as a list with run buttons. | `title`, `subtitle`, `columns`, `empty_text`, `hide_empty`, `rows` (a list: `entity`, `name`, `icon`, `secondary`) | `entities` → `rows` |
| **Helpers** | `custom:fluvy-helpers-card` | Numbers, selects, texts, booleans and dates as their own controls. | `title`, `subtitle`, `options_style` (`full`, `chips`), `empty_text`, `hide_empty`, `rows` (a list: `entity`, `name`, `icon`, `secondary`, `since`, `presets`, `options`, `display`, `labels`) | `entities` → `rows` |
| **To-do** | `custom:fluvy-todo-card` | A to-do list: check, add, hide the done. | `subtitle`, `show_completed`, `show_add`, `show_due` | `title` → `name`, `hide_completed` → `show_completed` |
| **Timer** | `custom:fluvy-timer-card` | A timer counting down live, with pause and cancel. | `show_gauge`, `show_actions` | — |
| **Updates** | `custom:fluvy-updates-card` | Pending updates with install buttons and progress. | `title`, `subtitle`, `show_up_to_date`, `toggle`, `toggle_secondary`, `empty_text`, `hide_empty` | — |
| **Automations** | `custom:fluvy-automations-card` | Every automation of the house: on or off, run, last and next run; schedules written as native automations, created and edited in a sheet. | `title`, `subtitle`, `variant` (`rows`, `compact`, `tiles`), `show` (`all`, `schedules`), `sort` (`name`, `next`, `last`), `show_add`, `show_switch`, `show_last`, `show_next`, `show_filters`, `max_rows`, `area`, `workday`, `time_step`, `domains` (`light`, `switch`, `input_boolean`, `fan`, `cover`, `climate`, `scene`, `script`, `valve`, `media_player`), `targets` (a list: `entity`, `name`, `icon`, `verb`, `level`, `temperature`) | — |

## Energy

| Card | Type | What it is | Options | Reads |
| --- | --- | --- | --- | --- |
| **Energy period** | `custom:fluvy-energy-period-card` | The view’s date picker as a strip: ‹ the day, week, month or year › and back to today, Home Assistant’s own, so its energy cards follow it as Fluvy’s do. | `variant` (`row`, `compact`, `stacked`), `collection_key`, `periods` (`day`, `week`, `month`, `year`, `custom`), `show_today`, `show_compare` | — |
| **Energy usage** | `custom:fluvy-energy-usage-card` | Energy used by the hour, the day or the month, stacked by source. | `title`, `subtitle`, `variant` (`full`, `compact`, `mini`), `mode` (`usage`, `flows`), `plot_height`, `period` (`day`, `week`, `month`, `year`), `collection_key`, `show_period`, `show_returns`, `show_legend`, `compare`, `max_sources`, `chart` (`classic`, `soft`), `show_grid` (`auto`, `none`, `x`, `y`, `both`), `show_axis`, `animate`, `unit` (`auto`, `Wh`, `kWh`, `MWh`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `sources` (a list: `type`, `name`, `color`, `show`) | — |
| **Energy** | `custom:fluvy-energy-card` | Power right now, the day curve and the energy legend. | `invert`, `subtitle`, `variant` (`full`, `compact`, `sources`, `overview`), `hours`, `collection_key`, `show_soc`, `show_house`, `stack`, `cost_entity`, `show_cost`, `chart` (`classic`, `soft`, `glow`, `minimal`, `step`), `points` (`auto`, `5m`, `15m`, `30m`, `1h`), `curve` (`smooth`, `straight`, `step`), `fill` (`gradient`, `flat`, `none`), `line_width` (`thin`, `regular`, `bold`), `glow`, `show_points` (`none`, `end`, `all`), `show_grid` (`auto`, `none`, `x`, `y`, `both`), `show_axis`, `highlight` (`none`, `min`, `max`, `both`, `current`), `animate`, `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`, `L`, `m³`, `gal`, `ft³`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `legend` (a list: `entity`, `name`, `period`, `unit`, `decimals`) | `title` → `name` |
| **Energy flow** | `custom:fluvy-energy-flow-card` | Where the house’s energy comes from and where it goes, live or over a period: import and export at once, every source, lanes in their origin’s colour. | `title`, `subtitle`, `home`, `variant` (`rows`, `cross`, `list`), `flow_style` (`stream`, `legs`, `rail`), `motion` (`full`, `calm`, `off`), `max_power`, `badge` (`solar`, `self_powered`, `grid`, `none`), `period` (`live`, `day`, `week`, `month`), `collection_key`, `show_period`, `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `sources` (a list: `type`, `power`, `phases`, `import`, `export`, `invert`, `level`, `capacity`, `name`, `icon`, `color`, `threshold`, `arrows`, `show`), `consumers` (a list: `entity`, `name`, `icon`, `color`), `readouts` (a list: `entity`, `name`, `unit`, `decimals`) | `home_power` → `home`, `solar_power` (folded in), `grid_power` (folded in), `grid_invert` (folded in), `battery_power` (folded in), `battery_invert` (folded in), `battery_level` (folded in) |
| **Energy balance** | `custom:fluvy-energy-balance-card` | What comes in against what goes out, live or over a period: the house is the remainder, so the totals agree; each phase of the grid, and the money. | `title`, `subtitle`, `period` (`live`, `day`, `week`, `month`), `collection_key`, `show_period`, `show_phases`, `show_cost`, `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `sources` (a list: `type`, `power`, `phases`, `import`, `export`, `invert`, `name`, `color`, `threshold`) | — |
| **Grid** | `custom:fluvy-grid-card` | The grid right now: the net import or export, in and out at once, each phase with its voltage, the price and today’s totals. | `title`, `subtitle`, `power`, `phases`, `import`, `export`, `invert`, `voltages`, `price`, `collection_key`, `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `readouts` (a list: `entity`, `name`, `unit`, `decimals`) | `power` → `phases` |
| **Batteries** | `custom:fluvy-batteries-card` | The house’s batteries as one: their state of charge, full or empty in, the reserve on the ruler, a row per battery and their mode. | `title`, `subtitle`, `reserve`, `mode`, `unit` (`auto`, `W`, `kW`, `MW`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `batteries` (a list: `power`, `phases`, `import`, `export`, `invert`, `level`, `capacity`, `name`, `icon`, `color`) | — |
| **Car charger** | `custom:fluvy-ev-charger-card` | The car on its charger: its charge against the target, ready by when, what the session added and how much of it came from the sun, the charging mode. | `invert`, `level`, `target`, `ready_by`, `status`, `session_energy`, `solar_share`, `vehicle`, `mode`, `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`, `L`, `m³`, `gal`, `ft³`), `decimals` (`auto`, `0`, `1`, `2`, `3`) | — |
| **Where it went** | `custom:fluvy-energy-sankey-card` | A day, week or month of energy from where to where, in true proportions: the grid, the battery and the sun into the house, the charge and the export, and the house into its devices. | `title`, `subtitle`, `period` (`day`, `week`, `month`), `collection_key`, `show_period`, `max_devices`, `unit` (`auto`, `Wh`, `kWh`, `MWh`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `devices` (a list: `entity`, `name`, `parent`) | — |
| **Energy score** | `custom:fluvy-energy-score-card` | Self-powered, sun used and low-carbon as rings, the Energy dashboard’s own gauges, over imported, exported and net. | `title`, `subtitle`, `period` (`day`, `week`, `month`), `collection_key`, `show_period`, `co2`, `unit` (`auto`, `kWh`, `MWh`), `decimals` (`auto`, `0`, `1`, `2`, `3`) | — |
| **Energy devices** | `custom:fluvy-energy-devices-card` | Where the energy goes, device by device on one scale: nested circuits, and what no meter measures. | `title`, `subtitle`, `total`, `collection_key`, `sort`, `max_rows`, `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `rows` (a list: `entity`, `name`, `icon`, `parent`, `cost_entity`, `tone`, `color`, `unit`, `decimals`, `tap_action`) | `entities` → `rows` |
| **Water & gas** | `custom:fluvy-meters-card` | Today’s water and gas against a typical day, what flows right now, and a leak sensor or a valve beside them. | `title`, `subtitle`, `variant` (`full`, `rows`), `collection_key`, `unit` (`auto`, `L`, `m³`, `gal`, `ft³`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `meters` (a list: `entity`, `rate`, `typical`, `name`, `icon`, `kind`, `unit`, `decimals`), `rows` (a list: `entity`, `name`, `icon`) | — |
| **Gauge** | `custom:fluvy-gauge-card` | A ring gauge for any numeric sensor with min, max and average, or centred on zero for a meter that runs both ways. | `subtitle`, `variant` (`ring`, `bar`, `signed`), `gauge` (`ticks`, `dial`, `ring`, `liquid`, `thermo`, `tank`, `battery`, `pulse`, `air`, `sun`), `animate`, `min`, `max`, `max_entity`, `label`, `badge`, `show_stats`, `hours`, `stats` (`min`, `max`, `average`), `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`, `L`, `m³`, `gal`, `ft³`), `decimals` (`auto`, `0`, `1`, `2`, `3`) | — |
| **Stat tiles** | `custom:fluvy-stat-tiles-card` | A headline value and a grid of stat tiles. | `title`, `subtitle`, `variant` (`full`, `compact`), `columns` (`auto`, `2`, `3`), `badge_entity`, `badge_label`, `empty_text`, `hide_empty`, `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`, `L`, `m³`, `gal`, `ft³`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `tiles` (a list: `entity`, `name`, `icon`, `tone`, `highlight`, `unit`, `decimals`, `tap_action`, `hold_action`), `rows` (a list: `entity`, `name`, `icon`, `secondary`, `tone`, `color`, `tap_action`) | `entities` → `tiles` |
| **Production** | `custom:fluvy-production-card` | Hourly production bars with the forecast behind, stacked per array when there are several. | `subtitle`, `forecast_entity`, `peak_entity`, `show_forecast`, `show_peak`, `variant` (`full`, `compact`), `collection_key`, `chart` (`classic`, `soft`, `columns`), `show_now`, `highlight` (`none`, `min`, `max`, `both`, `current`), `animate`, `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`, `L`, `m³`, `gal`, `ft³`), `decimals` (`auto`, `0`, `1`, `2`, `3`), `arrays` (a list: `entity`, `name`) | `title` → `name` |
| **History bars** | `custom:fluvy-history-bars-card` | A sensor’s last days, weeks or months as bars from its long-term statistics: the total and the average in the head, the value over each bar, and a strip of facts under them — the highest and lowest, or what it comes to in CO₂, trees, kilometres or money. | `subtitle`, `variant` (`full`, `compact`, `mini`), `days`, `period` (`day`, `week`, `month`), `stat` (`change`, `state`, `mean`, `max`, `min`), `reset` (`auto`, `never`, `day`, `week`, `month`, `year`), `source` (`auto`, `history`), `date_format` (`date`, `weekday`, `short`), `negative_color`, `current_color`, `include_today`, `show_head`, `show_values`, `show_axis`, `show_grid`, `show_dates`, `show_facts`, `co2_factor`, `price`, `chart` (`classic`, `bars`, `columns`, `minimal`), `highlight` (`none`, `min`, `max`, `both`, `current`), `animate`, `unit` (`auto`, `W`, `kW`, `MW`, `Wh`, `kWh`, `MWh`, `L`, `m³`, `gal`, `ft³`), `decimals` (`0`, `1`, `2`, `3`), `head` (a list: `kind`, `name`, `unit`, `decimals`, `factor`, `of`, `template`, `tap_action`), `facts` (a list: `kind`, `name`, `icon`, `color`, `unit`, `decimals`, `factor`, `of`, `template`, `tap_action`) | `title` → `name` |
| **Chart** | `custom:fluvy-chart-card` | Any time series on one chart — history, statistics, a list in an attribute (Nordpool’s prices, a solar forecast) or a weather’s forecast — past to future with now marked, thresholds in their colours and the cheapest hours found. | `title`, `subtitle`, `span` (`4h`, `12h`, `24h`, `today`, `today+tomorrow`, `48h`, `7d`, `30d`), `variant` (`full`, `compact`, `tile`), `show_head`, `show_legend`, `highlight` (`none`, `min`, `max`, `both`), `highlight_hours`, `chart` (`classic`, `soft`, `glow`, `minimal`, `step`, `bars`, `columns`, `band`), `points` (`auto`, `5m`, `15m`, `30m`, `1h`), `curve` (`smooth`, `straight`, `step`), `fill` (`gradient`, `flat`, `none`), `line_width` (`thin`, `regular`, `bold`), `glow`, `show_points` (`none`, `end`, `all`), `show_grid` (`auto`, `none`, `x`, `y`, `both`), `show_axis`, `show_now`, `animate`, `series` (a list: `entity`, `name`, `source`, `attribute`, `time_key`, `value_key`, `stat`, `period`, `kind`, `curve`, `fill`, `tone`, `color`, `unit`, `decimals`), `thresholds` (a list: `tone`, `value`) | — |
| **Bars** | `custom:fluvy-bars-card` | Rows with a bar each: plants, batteries, strings, levels. | `title`, `subtitle`, `variant` (`full`, `compact`), `chart` (`classic`, `soft`), `badge_ok`, `badge_warn`, `empty_text`, `hide_empty`, `rows` (a list: `entity`, `name`, `icon`, `secondary`, `sub_entity`, `tone`, `color`, `min`, `max`, `low`, `high`, `plain`, `tap_action`) | `entities` → `rows` |
| **Distribution** | `custom:fluvy-distribution-card` | One stacked bar and a legend: who draws what. | `title`, `subtitle`, `max_rows`, `variant` (`stack`, `rows`), `chart` (`classic`, `soft`), `total`, `empty_text`, `hide_empty`, `entities` (a list: `entity`, `name`, `tone`, `color`) | — |
| **Humidity** | `custom:fluvy-humidity-card` | Humidity on a comfort band, with dew point and trend. | `subtitle`, `low`, `high`, `gauge` (`ticks`, `ruler`, `liquid`), `animate`, `temperature_entity`, `humidifier_entity`, `hours`, `show_trend` | `trend_hours` → `hours` |

## Time

| Card | Type | What it is | Options | Reads |
| --- | --- | --- | --- | --- |
| **Clock** | `custom:fluvy-clock-card` | Analog or digital, hero, side or tile, with or without weather. | `face` (`analog`, `digital`), `variant` (`hero`, `side`, `tile`), `numerals` (`none`, `quarters`, `all`), `title`, `show_seconds`, `hour12`, `show_date`, `show_week`, `weather`, `show_forecast`, `time_zone` | `variant` → `face`, `seconds` → `show_seconds`, `date` → `show_date`, `week` → `show_week`, `forecast` → `show_forecast` |
| **Calendar** | `custom:fluvy-calendar-card` | Agenda, month, week, month + day, timeline, upcoming or tile. | `variant` (`agenda`, `month`, `week`, `month-day`, `timeline`, `upcoming`, `tile`), `title`, `tile` (`date`, `next`), `first_weekday` (`language`, `today`, `sunday`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`), `days`, `start_hour`, `end_hour`, `calendars` (a list: `entity`, `name`, `tone`, `color`) | `entities` → `calendars` |

<!-- /generated:cards -->

## A minimal card

```yaml
type: custom:fluvy-tile-card
entity: light.living_room_lamp
```

Open the editor on it to see every option the tile offers — size, readouts, the tap action — with its default.

## Where they are used

The [automatic dashboard](automatic-dashboard.md) puts every one of these cards to use in a house that has one of
everything; its tests hold that promise. The [design language](../design/language.md) is what each card is built and
reviewed against.
