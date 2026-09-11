# ConstruCenter interface

The store uses white surfaces, forest green headings and actions, and a restrained
leaf green highlight. The same palette and Plus Jakarta Sans family carry through
the catalog, checkout and administration. Existing product information and imagery
remain the source of content.

## Foundation

- Color values live in `src/styles/tokens.css`; Tailwind maps to these values.
- Forest: `#1a3b2b`; ink: `#1e3127`; secondary text: `#526559`.
- Surface: white; secondary surface: `#f2f7f3`; dividers: `#d8e4dc`.
- Leaf: `#64c832`, paired with forest text. Never white text on leaf green.
- Body copy uses 14–17px; page headings use 29–44px; the home heading reaches 58px.
- Cards use 16px corners; action buttons use 12px. Borders separate cards;
  shadows are reserved for overlays and the login panel.

## Ownership

- `src/styles/interface.css`: shared buttons, page introductions, form sizing,
  administration tables and modal presentation.
- `src/layouts/PublicLayout.css`: navigation and footer, independent of Home.
- `src/pages/public/Home.css`: hero, category and combo lists, contact area.
- `src/components/ui/ProductCard.css`: product image, metadata, price and actions.
- `Modal.tsx`: native modal focus containment, Escape and background isolation.

Use explicit component or utility classes. Do not redefine a color utility to
produce another color, target page sections by their position, or add global
overrides to correct a single component. Preserve validation, loading, empty and
error states. Keep hover motion brief and respect reduced motion.

## Verification

Run the production build and lint. Review populated and empty states at desktop
and mobile sizes. Browser fixtures belong only in local verification tools and
must never be introduced as live catalog records.
