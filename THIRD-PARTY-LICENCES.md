# Third-Party Licences

This file documents the open-source licences for dependencies used in the DHCW Single Record Design System.

---

## Lucide Icons

**Source:** [lucide-icons/lucide](https://github.com/lucide-icons/lucide)

**Licence:** ISC (with Feather Icons / Cole Bemis MIT component)

**Usage:** Icon library used throughout the design system

**Licence text:** See [`foundations/iconography/LICENSE-lucide.txt`](foundations/iconography/LICENSE-lucide.txt)

**Notice:** The ISC licence requires the copyright and permission notice to be retained when the source SVGs are redistributed. The licence is included in the repository.

---

## Design System Dependencies

For production dependencies, see each package's `package.json`:

- `@dhcw/sr-tokens` — Design token build tooling
- `@dhcw/sr-icons` — Icon library (planned)
- `packages/storybook` — Storybook 9 for component documentation (dev)
- `packages/web` — HTML/CSS reference implementation
- `packages/react` — React component library (planned)
- `packages/blazor` — Blazor component library (planned)
- `packages/maui` — .NET MAUI component library (planned)

Run `npm list` in each package directory and refer to `LICENSE` / `LICENCE` files in individual `node_modules` for complete attribution.

---

## Healthcare Context

This design system is used in NHS Wales products. All dependencies must be compatible with NHS-approved security and compliance standards. See the main README for current platform support and version constraints.
