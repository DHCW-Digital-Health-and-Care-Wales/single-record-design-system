# Avatar

**Status:** Shipped — `.sr-avatar` in `@dhcw/sr-web`, `Avatar` / `AvatarGroup` in `@dhcw/sr-react`
**Last updated:** 2026-09-22

---

## Purpose

Identifies a **person** — a clinician, a user, the author of a note — as a
circle carrying their initials, their photo, or a generic mark.

It is **not** a patient identifier. A patient is identified by the
[patient banner](../patient-banner/spec.md), which carries the NHS number and
the details that make identification safe. A face in a circle is not safe
identification.

---

## Anatomy

```
     ┌────────┐
     │   AB   │ ●     ← .sr-avatar, with an optional .sr-avatar__status dot
     └────────┘
```

| Part | Class | Notes |
|---|---|---|
| Circle | `.sr-avatar` | `radius-full`, `interactive/primary` fill |
| Initials | `.sr-avatar__initials` | `text/on-fill`, uppercase |
| Photo | `.sr-avatar__image` | `object-fit: cover`; falls back to initials on error |
| Generic mark | `.sr-avatar--icon` + `.sr-avatar__icon` | Neutral, not brand — see below |
| Presence dot | `.sr-avatar__status` | `status/success`, ringed in the surface colour |
| Stack | `.sr-avatar-group` | Overlap, plus a `+n` overflow count |

---

## Variants

| Property | Values | Class |
|---|---|---|
| Size | SM 32 · MD 40 · LG 48 | `.sr-avatar--md`, `.sr-avatar--lg` |
| Type | Initials · Image · Icon | content-driven; `.sr-avatar--icon` for the generic mark |
| Status | None · Active | `.sr-avatar__status` |

Matches the Figma `Avatar` set (`414:834`): Size × Type × Status = 18 variants,
plus an `Initials` text property.

---

## The contrast correction

The Figma component drew the initials avatar as a **`Cyan/700` fill with
`Text/Inverse` text**. Two defects, both fixed on 2026-09-22:

| | Was | Is | Why |
|---|---|---|---|
| Fill | `Cyan/700` `#12a3c9` | `interactive/primary` `#325083` | White on Cyan/700 is **2.95:1** — below the 4.5:1 SC 1.4.3 requires for 14px text. On `interactive/primary` it is **8.04:1** |
| Text | `Text/Inverse` | `text/on-fill` | `text/inverse` is relative to the MODE and flips to near-black in dark; an avatar fill stays saturated in both. The token's own description says not to use it on a saturated fill |

Two further bindings were raw hex rather than tokens, and one was stale:

- The presence dot was `#007f3b` — **`Green/600`**, the value `status/success`
  was raised *away from* for AA contrast. Now bound to `status/success`.
- The image and icon placeholder circles were `#d4d8e2`, a raw `Blue/200`.

`Text/On Fill` **did not exist as a Figma variable at all** — the code token
`--sr-color-text-on-fill` had shipped without a design-side counterpart. It was
created as part of this fix.

**The header was already right.** `.sr-header__avatar` has used
`interactive/primary` since it was written, so this was Figma drifting from
code rather than the reverse.

**Prevented by:** `check:contrast` asserts `text/on-fill` on
`interactive/primary` at 4.5:1, and `text/secondary` on `surface/subtle` for the
icon variant.

---

## Accessibility

- **Beside a visible name, the avatar is decorative.** Pass `decorative` (React)
  or `aria-hidden="true"`, so a screen reader does not read the name twice.
- **Standing alone it must name the person** — `role="img"` with an
  `aria-label` of the person's name. The React component does this by default.
- **Presence is never carried by the dot alone.** Colour alone fails SC 1.4.1;
  the dot's meaning goes in the accessible name (`statusLabel`), and anywhere
  presence matters operationally it needs a text label too.
- **Initials are not an identifier.** Two people share initials all the time.
- A photo that fails to load falls back to initials rather than a broken image.

---

## Related

- [Patient banner](../patient-banner/spec.md) — how a **patient** is identified
- [Header](../header/guidelines.md) — the header's own avatar
- `guidelines.md` — when to use one, and when not to
