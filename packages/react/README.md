# @dhcw/sr-react

React component library for the DHCW Single Record Design System.

Thin wrappers around `@dhcw/sr-web` HTML/CSS components, consuming `@dhcw/sr-tokens` CSS custom properties.

**Status:** In progress — Button is the first component.

## Usage

```jsx
import { Button } from '@dhcw/sr-react';

<Button type="primary" size="large">Save record</Button>
<Button type="destructive" size="default">Delete record</Button>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive'` | `'primary'` | Visual type |
| `size` | `'large' \| 'default' \| 'small'` | `'default'` | Height variant |
| `disabled` | `boolean` | `false` | Disabled state |
| `leadingIcon` | `ReactNode` | — | Optional leading icon |
| `trailingIcon` | `ReactNode` | — | Optional trailing icon |
| `children` | `ReactNode` | — | Button label text |
