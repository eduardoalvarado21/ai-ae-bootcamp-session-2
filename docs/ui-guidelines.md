# UI Guidelines

UI guidelines for the TODO App.

## Design System

- Follow [Material Design](https://m3.material.io/) principles and the Material Theme (elevation, rounded corners, ripple/hover feedback, Roboto typography).
- Use Material-style components: filled/outlined buttons, text fields with floating labels, cards, list items, and icon buttons.

## Color Palette

Use a dark theme with the following colors.

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background | Dark blue | `#0D1B2A` | Page background |
| Surface | Navy | `#1B263B` | Cards, list items, inputs |
| Primary | Blue | `#1E3A8A` | Primary buttons, app bar, focus states |
| Success | Dark green | `#2E7D32` | Complete actions, success states |
| Error / Danger | Dark red | `#C62828` | Delete actions, validation errors, overdue dates |
| Text primary | Off-white | `#E0E6ED` | Main text |
| Text secondary | Gray-blue | `#9FB0C3` | Hints, secondary text |

Maintain a WCAG AA contrast ratio (4.5:1 for body text).

## Responsiveness

- Design mobile-first; scale up using breakpoints:
  - Mobile: up to 599px (single column, full-width controls)
  - Tablet: 600px - 1023px
  - Desktop: 1024px and above (centered content, max width ~800px)
- Use flexbox/grid and relative units (`rem`, `%`) instead of fixed pixel widths.
- Touch targets must be at least 44x44px.
- No horizontal scrolling at any viewport width.
- Include `<meta name="viewport" content="width=device-width, initial-scale=1">`.

## Component Guidelines

- **Add/Edit form**: Task title and due date fields stacked on mobile, inline on larger screens.
- **Task list**: Card-style items with elevation; show title, due date, and action buttons.
- **Actions**: Complete in green, delete in red, edit in blue. Use icons with accessible labels.
- **Due dates**: Display in a consistent format; highlight overdue tasks in red.
- **Sorting**: Tasks sorted by due date; the sort control must be easy to reach on mobile.
- **Empty state**: Show a friendly message when no tasks exist.

## Accessibility

- Provide visible focus indicators.
- Use semantic HTML and `aria-label`s for icon-only buttons.
- Do not rely on color alone to convey state (pair with icons or text).
