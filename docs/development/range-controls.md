# Range controls

`src/shared/ui/range.tsx` owns the shared native range appearance, correctly
positioned numeric ticks, logical keyboard steps and accessible values/units.
There is no CSS transition on thumb position or track fill. Native pointer/touch
interaction is retained; React only updates the logical value. Ordinary controls
keep native min/max/step values and a linear scale.

| Tool / control | Logical domain | Step | Center behavior |
| --- | --- | --- | --- |
| JWT secret bits | 32-512 | 8 | Explicit center anchor: 256 |
| Password length | 8-128 | 1 | Linear: 68 |
| Passphrase words | 3-12 | 1 | Linear: 7.5, snaps to 8 |
| UUID quantity | 1-100 | 1 | Linear: 50.5, snaps to 51 |
| Slug maximum length | 16-160 | 1 | Linear: 88 |

The JWT scale has a deliberate, labelled 256-bit center. It maps the first half
proportionally from 32 to 256 and the second from 256 to 512, snapping to 8-bit
steps. A linear 32-512 range has midpoint 272; its previous equally spaced tick
labels incorrectly suggested 256 at the center. Ticks now use the same mapping
as the thumb; for example 128 is at about 21.43%, not 25%.

The center-anchored input uses normalized native pointer coordinates and exposes
logical bits through aria-valuemin/max/now/valuetext. Keyboard arrows change one
logical step, Page Up/Down ten steps, Home/End reach bounds. Test screen-reader
increment actions on physical devices before extending custom center scales to
other controls. Do not apply a non-linear scale to an ordinary range silently.

All five controls are covered by real Chromium mouse/touch drags and logical
keyboard checks on desktop/phone. Numerical round-trip tests cover every legal
value. These are correctness checks, not performance benchmark measurements.

Slug output has a fixed-height, keyboard-scrollable reading area so changing its
length cannot move the options slider under the pointer. Preserve that stability
when redesigning the layout. Keep generation local and never weaken existing
cryptographic defaults to make a slider domain more convenient.
