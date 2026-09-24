# Avatar

> A person, as a circle — their initials, their photo, or a generic mark when
> neither is available.

| | |
|---|---|
| **Type** | Component |
| **Status** | In review |
| **Reference** | [spec.md](spec.md) · `packages/web/src/avatar/avatar.css` · `packages/react/src/avatar/Avatar.jsx` |
| **Figma** | Avatar (`414:834`) on page `2852:16707` |
| **Related standards** | NHS England "Avatar" · WCAG 2.2 AA |
| **Last updated** | 2026-09 |

---

## When to use

- **Attribution.** Who wrote this note, who made this change, who signed this
  off. The avatar sits beside the name and makes a long list scannable.
- **The signed-in user**, in the header, as the way into their own account.
- **Assignment.** Who a task or a patient is allocated to.
- **A small group of people** — a care team on a ward view — as a stack.

## When not to use

- **To identify a patient.** This is the one rule that matters clinically. A
  patient is identified by the [patient banner](../patient-banner/guidelines.md),
  which carries the NHS number, date of birth and the details that make
  identification safe.

  > **An avatar identifies a colleague. It never identifies a patient.**

- **As the only way to tell people apart.** Initials collide constantly — two
  A. Bowens on one ward is an ordinary Tuesday. The name goes beside it.
- **As a status light.** Presence is a dot on an avatar, not the avatar's job.
  If something has a clinical or workflow status, that is a
  [tag](../tags/guidelines.md) or a status indicator.
- **Decoratively, to fill space.** A circle of colour next to every row adds
  noise to exactly the dense tables clinical staff read fastest.
- **At small sizes with a photo.** At 32px a face is unrecognisable. If the
  photo cannot be read, initials carry more meaning.

## How it works

- **Three types, in order of preference: photo, initials, generic mark.** Each
  falls back to the next. A photo that fails to load shows initials rather than
  a broken image.
- **The generic mark is grey, not brand navy.** A generic mark on the brand fill
  reads as a real person who happens to have no photo. Grey says "we do not know
  who this is", which is the truth.
- **Initials are two characters**, from the first and last name, uppercase.
- **Three sizes.** SM 32 for rows and dense lists, MD 40 for headers and cards,
  LG 48 for a profile.
- **The presence dot means presence and nothing else** — signed in, available
  now. It is never a clinical state.

## Accessibility

- **Beside a visible name the avatar is decorative**, and must be hidden from
  assistive technology. Otherwise the name is read twice — once as the avatar's
  label, once as the text.
- **Standing alone it must name the person.** In the header, the avatar is the
  account control and needs a real accessible name.
- **Presence is never colour alone.** The dot's meaning belongs in the
  accessible name, and wherever presence is operationally significant it needs a
  visible text label too. Colour alone fails SC 1.4.1.
- **Initials sit on `interactive/primary` with `text/on-fill` — 8.04:1.** The
  Figma component used `Cyan/700` with `text/inverse`, which is **2.95:1** and
  fails. Do not restyle it back: `text/inverse` flips to near-black in dark
  mode, and the fill does not.

## Content

- Derive initials from the name the system holds; do not ask people to type
  them.
- A group's overflow count is real information — "+4" means four more people,
  and it should be reachable as text rather than only shown.

## Related

- [Patient banner](../patient-banner/guidelines.md) — identifying a **patient**
- [Header](../header/guidelines.md) — the signed-in user's avatar
- [Tags](../tags/guidelines.md) — for a status, which an avatar never carries

## Engineering

```html
<!-- Beside a visible name: decorative -->
<span class="sr-avatar" aria-hidden="true">
  <span class="sr-avatar__initials">AB</span>
</span>
<span>Dr Anwen Bowen</span>

<!-- Standing alone: names the person -->
<span class="sr-avatar sr-avatar--md" role="img" aria-label="Dr Anwen Bowen, active">
  <span class="sr-avatar__initials">AB</span>
  <span class="sr-avatar__status"></span>
</span>
```

```jsx
<Avatar name="Dr Anwen Bowen" decorative />
<Avatar name="Dr Anwen Bowen" size="md" status="active" />
<AvatarGroup max={3}>{team.map(p => <Avatar key={p.id} name={p.name} decorative />)}</AvatarGroup>
```
