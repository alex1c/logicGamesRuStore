# RuStore screenshot plan / План скриншотов

Screenshots are **not** produced in this doc phase — capture only on final release prep.

**Before capture:** verify **current** RuStore image size / aspect-ratio requirements in the RuStore console or help center. ForestMusic prior releases used store-ready dimensions from the start (no chaotic crop later).

---

## Product claims (allowed / banned)

**OK:** logic puzzles, daily short workouts (~5 minutes), progress, categories, matchsticks.

**Banned on creatives and captions:** IQ claims, medical / brain-training treatment claims, “increase IQ”, diagnostics.

App is **not** an IQ test.

---

## Planned set (7)

| # | Screen | Caption (RU) | What to show |
|---|--------|--------------|--------------|
| 1 | Today | **Новая головоломка каждый день** | Real Daily card / start state |
| 2 | Logic puzzle | **Проверьте свою логику** | In-progress logic puzzle (clean UI) |
| 3 | Matchsticks | **Переставьте одну спичку** | Matchstick equation mid-solve |
| 4 | Sequence / Attention | **Находите закономерности** | Sequence or attention puzzle |
| 5 | Play | **7 видов головоломок** | Category list with all seven |
| 6 | Result | **Около 5 минут для ума каждый день** | Session result summary |
| 7 | Progress | **Следите за своим прогрессом** | Skills / streak / achievements |

---

## Capture requirements

### Before

- [ ] Confirm RuStore required width × height (or aspect) for the current console year
- [ ] Configure emulator/device capture to that size (or a safe exact multiple)
- [ ] Hide debug / Dev Menu / system chrome noise where possible
- [ ] No on-screen keyboard
- [ ] Pick good real puzzle states (readable, not empty placeholders)
- [ ] Light theme preferred for storefront consistency unless product is dark-only

### After (each file)

- [ ] Dimensions match RuStore requirement
- [ ] Aspect ratio correct
- [ ] Format accepted (typically PNG/JPEG per store rules)
- [ ] Visual content matches the plan row
- [ ] No debug overlays, watermarks, or personal data
- [ ] No second “marketing mock” inventing UI that the app does not have

Do not rely on later random rescale/crop to fix wrong aspect ratios.

---

## Naming suggestion

```text
release-artifacts/screenshots/
  01-today.png
  02-logic.png
  03-matchsticks.png
  04-sequence-attention.png
  05-play.png
  06-result.png
  07-progress.png
```

Binaries stay out of git unless the team explicitly decides otherwise.
