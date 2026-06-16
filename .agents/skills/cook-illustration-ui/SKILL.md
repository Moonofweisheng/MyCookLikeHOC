---
name: cook-illustration-ui
description: Apply and extend the cook-cook illustrated UI style for uni-app pages, new features, and reusable components. Use when building or redesigning pages, cards, forms, loading states, empty states, buttons, inputs, category shortcuts, recipe detail sections, tab/navigation surfaces, or any UI that should follow the thick-outline sticker-like illustration style already used in this repository.
---

# Cook Illustration UI

## Goal

Extend the app with a sticker-like illustrated UI: thick ink borders, chunky offset shadows, warm paper backgrounds, saturated accent colors, and readable recipe-first layouts.

Use existing tokens and classes before adding new styles:

- Tokens live in `src/App.vue`: `--cook-ink`, `--cook-paper`, `--cook-primary`, `--cook-yellow`, `--cook-blue-soft`, `--cook-shadow-pop`, `--cook-radius-illo`.
- Utility classes live in `src/App.vue`: `cook-illo-page`, `cook-illo-card`, `cook-illo-card-soft`, `cook-illo-pill`, `cook-illo-button`, `cook-illo-tag`, `cook-illo-status`, `cook-pressable`.
- Reusable components already carry the style: `RecipeCard`, `CategoryShortcut`, `EmptyState`, `SkeletonBlock`, `RecipeCardSkeleton`, `CategoryShortcutSkeleton`, `AppSectionHeader`.

## Workflow

1. Start with page-level containers: set the page background to `var(--cook-bg)` or a light grid/paper background, then wrap important hero panels in `cook-illo-card`.
2. Convert interactive elements to sticker controls: use thick ink borders, saturated fills, and `cook-pressable` on search buttons, load-more buttons, history chips, category shortcuts, and action buttons.
3. Keep recipe content readable: use the illustrated style on containers and labels, but keep long ingredient and step text on calm paper surfaces.
4. Prefer the existing reusable components. Do not fork a new recipe card, empty state, skeleton, or section header unless the component boundary truly differs.
5. Cover every state of the feature: initial, loading/skeleton, populated, empty, error, pagination/end, and destructive/confirmation states when present.
6. Validate both H5 and mini-program builds after CSS changes, because uni-app selectors and pseudo behavior can differ.

## New Page Checklist

When creating a new page or major feature, include all of these unless the page genuinely does not need them:

- Use `cook-illo-page` as the root visual background.
- Add a compact hero or title panel with `cook-illo-card` when the page has a clear subject, filter, search, or summary.
- Use `AppSectionHeader` for section titles instead of custom title rows.
- Use `RecipeCard`, `CategoryShortcut`, `EmptyState`, and skeleton components where their data shape matches.
- Use `cook-illo-button` for primary actions and `cook-illo-pill` or `cook-illo-tag` for filters, badges, chips, and metadata.
- Add an empty state and error retry path with `EmptyState`.
- Add a loading state that uses `SkeletonBlock` or existing skeleton components instead of raw `wd-skeleton`.
- Keep bottom padding large enough for `tabbar` pages.
- Add or update `scripts/smoke-ui.ts` checks for new critical style contracts.

## Visual Rules

- Use `3-5rpx` ink borders on mobile UI. Use `cook-illo-card` for primary panels and `cook-illo-card-soft` for repeated list items.
- Use offset shadows, not soft blurred shadows, for illustrated surfaces.
- Use warm light backgrounds with small amounts of green, blue, yellow, or red accents.
- Use bold Chinese typography for titles and buttons: usually `font-800` or `font-900`.
- Keep cards at stable dimensions. Avoid dynamic content changing card height unpredictably unless it is a text content section.
- Do not add decorative gradient orbs, glassmorphism, or large marketing hero layouts.
- Avoid complex selectors such as `:has()` and fragile pseudo-element stacking for mini-program compatibility.
- Avoid raw `bg-white`, gray utility-heavy panels, and default Wot UI visual surfaces when the element is part of the page's main experience.
- Keep text inside buttons and chips short. If labels may grow, use truncation or a flexible layout before shrinking font size.

## Component Rules

- Extend reusable components before duplicating page-local card, empty, image, skeleton, or title patterns.
- If a new UI pattern appears in two places, add a reusable class in `src/App.vue` or a small component under `src/components`.
- Wrap Wot UI components with local containers or `custom-class` and style the wrapper; do not globally override all Wot internals unless the change is truly app-wide.
- Keep component props semantic, such as `variant`, `tone`, `actionText`, and `icon`, rather than passing raw color or border values.
- For image placeholders, preserve the illustrated placeholder style and keep the actual recipe image inspectable.

## State Patterns

- **Loading**: use illustrated skeleton cards that match the final layout.
- **Empty**: use `EmptyState` with a short title, useful description, and optional action.
- **Error**: use `EmptyState` with retry/back action and avoid leaving a blank panel.
- **Pagination**: use an illustrated load-more button or a `cook-illo-status` end message.
- **Forms/search**: use thick outlined input wrappers and make clear controls pressable.
- **Dialogs/toasts**: keep Wot behavior, but make trigger buttons and surrounding page context match the illustrated style.

## Page Patterns

- **Home**: hero card, illustrated search, recommended recipe card, category sticker grid.
- **Search**: hero card with thick input, history chips as pills, result summary as small sticker panel, load-more as illustrated button.
- **Category**: category hero card, count badge, grid recipe cards, illustrated end-state message.
- **Recipe detail**: framed hero image, title panel, ingredient stickers, step timeline cards, tip card, horizontal recommended mini cards.
- **About**: logo badge, app info card, action rows as pressable illustrated rows.

For new pages, start from the closest page pattern above, then adapt only the content structure.

## Mini-Program Compatibility

- Prefer simple class selectors and scoped styles.
- Do not rely on `:has()`, deep pseudo-element layering, viewport-scaled font sizes, or browser-only CSS.
- Use `rpx` dimensions for app UI and keep fixed-format controls stable across mobile widths.
- Run both H5 and `mp-weixin` builds when adding selectors, animations, or Wot UI overrides.

## Verification

Run the existing checks after changes:

```bash
pnpm smoke:ui
pnpm type-check
pnpm lint
CHOKIDAR_USEPOLLING=1 pnpm build:h5
CHOKIDAR_USEPOLLING=1 pnpm build:mp-weixin
```

For visual QA, inspect mobile H5 at `390x844` and verify:

- no horizontal overflow,
- no console errors,
- text stays inside buttons/cards,
- illustrated style appears on page hero, primary controls, list cards, empty/loading states.
