# Menura design language (v2.1)

Single source of truth for every UI task in phase 5 (Beads epic `mnr-s8p`). If code and this
document disagree, this document wins; if this document is wrong, change it first.

Direction (Muhammed, 2026-10-08): **high abstraction, plain, clean.** References: three shots he
supplied (SalesAI landing, reel.ai hero, Deflexai SaaS pages) and apple.com.

## 1. What we take from the references

| Reference | Take | Leave |
|---|---|---|
| SalesAI | Floating pill header; huge two-line headline with one *italic* accent word; dark rounded stats band; numbered steps with gradient dots; dark footer with a giant wordmark | Stock-photo people, fake metrics |
| reel.ai | Product (phone) as the hero, a soft half-circle glow behind it, small floating cards around it; dark pill + outline pill CTA pair | Logo wall of customers we don't have |
| Deflexai | Very light canvas, hairline borders, soft blue/lavender glows behind cards, concentric orbit lines, stacked notification cards | Dense marketing copy |
| apple.com | Scale contrast (very big headline, quiet body), one idea per section, generous vertical rhythm (96–160 px), product does the talking | — |

Rules that follow from this:
1. **One idea per section, one primary action per screen.** Fewer elements, more space.
2. **The product is the illustration.** We show real Menura UI (menu, QR, cards), never stock people.
3. **No fake numbers.** Example UI cards may show sample values but must read as interface
   samples (no "10.000+ restoran", no customer logos).
4. **Color is rare.** Neutral surfaces; the brand gradient appears only as glow, highlight and focus.

## 2. Tokens

Defined in `src/app/globals.css` (`@theme`). Components use tokens only — never raw hex.

### Color — light (default)
| Token | Value | Use |
|---|---|---|
| `--color-canvas` | `#F7F7F9` | App/page background |
| `--color-bg` | `#FFFFFF` | Marketing background, guest menu background |
| `--color-surface` | `#FFFFFF` | Cards, header, sheets |
| `--color-surface-muted` | `#F2F2F5` | Inset areas, chips, input fill on hover |
| `--color-fg` | `#0B0B0F` | Primary text |
| `--color-fg-muted` | `#62626C` | Secondary text (≥ 4.5:1 on white) |
| `--color-fg-subtle` | `#8E8E98` | Placeholders, meta (large/≥14px medium only) |
| `--color-border` | `#E9E9EE` | Hairlines |
| `--color-border-strong` | `#C9C9D2` | Inputs, focusable outlines (≥ 3:1) |
| `--color-ink` | `#111114` | Primary pill buttons (bg), stats band |
| `--color-ink-fg` | `#FFFFFF` | Text on ink |
| `--color-accent` | `#6E56CF` | Brand violet: links, focus, selected states |
| `--color-success / warning / danger` | `#1F9D55 / #B45309 / #D92D20` | Status text; `-soft` variants for tints |

### Color — dark (manual toggle only)
| Token | Value |
|---|---|
| canvas | `#09090B` |
| bg / surface | `#0E0E11` / `#141418` |
| surface-muted | `#1C1C21` |
| fg / fg-muted / fg-subtle | `#F4F4F6` / `#A1A1AB` / `#71717A` |
| border / border-strong | `#24242B` / `#3A3A44` |
| ink / ink-fg | `#F4F4F6` / `#0B0B0F` (primary pill inverts) |
| accent | `#9E8CFC` |

### Brand gradient (decorative only)
`--gradient-brand: linear-gradient(120deg, #B9A6FF 0%, #F3A8DC 50%, #FFC79A 100%)`
Uses: hero glow (as blurred radial blobs at 25–35 % opacity), step-number dots, highlight CTA on
the landing hero, gauge rings, focus halo on the landing only. Never behind body text.

### Restaurant accent (guest menu and previews)
The restaurant's `themeColor` keeps working exactly as today (`menuThemeVars` →
`--color-accent`, `--color-accent-fg`, `--menu-accent-text`) in **both** themes.

### Typography
- UI and body: **Inter** (already loaded, latin + latin-ext), `font-feature-settings: "ss01", "cv11"`.
- Display accent: **Instrument Serif Italic** (next/font/google, latin + latin-ext), used for at most
  one emphasized word or phrase per headline (SalesAI's italic "Conversions"). Never for body text.

| Style | Size / line-height / tracking / weight |
|---|---|
| display-xl (landing hero) | clamp(44px, 7vw, 88px) / 1.0 / -0.04em / 600 |
| display (section titles) | clamp(36px, 5vw, 56px) / 1.05 / -0.035em / 600 |
| title-lg (page titles in app) | 32px / 1.15 / -0.025em / 600 |
| title (card titles) | 20px / 1.3 / -0.015em / 600 |
| body-lg | 18px / 1.55 / -0.005em / 400 |
| body | 15px / 1.55 / 0 / 400 |
| caption | 13px / 1.45 / 0 / 500 |
| overline | 12px / 1.3 / 0.04em / 600, sentence case (no ALL CAPS) |

Numbers in prices and stats use `font-variant-numeric: tabular-nums`.

### Radius
`--radius-sm 10px` (chips, small buttons) · `--radius-md 14px` (inputs, menu items) ·
`--radius-lg 20px` (cards) · `--radius-xl 28px` (sections, sheets, hero frames) · `--radius-pill 9999px`.

### Elevation
- `--shadow-hairline`: `0 0 0 1px var(--color-border)` — default card edge (prefer over shadows).
- `--shadow-float`: `0 1px 2px rgb(0 0 0 / .04), 0 8px 24px -6px rgb(17 17 20 / .10), 0 24px 48px -12px rgb(17 17 20 / .08)` — floating cards, header, popovers.
- `--shadow-sheet`: stronger float for drawers and dialogs.
- Dark theme: shadows drop to near zero; edges come from `border`.

### Spacing & layout
4 px base. Section rhythm: 96 px mobile / 144 px desktop between landing sections; 32 px between
app page blocks. Containers: marketing `max-w-[1120px]`, app `max-w-[1200px]`, reading text
`max-w-[640px]`. Gutters 16 px mobile, 24 px tablet, 32 px desktop.

### Motion
- Default transition 180 ms `cubic-bezier(.2,.8,.2,1)`; sheets 260 ms.
- Reveal on scroll: fade + 12 px rise, once, staggered 60 ms; disabled under `prefers-reduced-motion`.
- Floating cards may bob ±4 px over 6 s; phone tilt follows the pointer ±6°. Both off for reduced motion.
- No parallax on text, no auto-playing carousels.

## 3. Theme
- Default **light**, regardless of OS setting. Dark only via the toggle; choice persisted.
- Implementation: `next-themes` with `attribute="data-theme"`, `defaultTheme="light"`,
  `enableSystem={false}`, `storageKey="menura-theme"`, `disableTransitionOnChange`, and the CSP
  nonce from the `x-nonce` request header (set by `src/proxy.ts`) passed to `ThemeProvider`.
- Tailwind: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));` and dark
  tokens under `[data-theme="dark"]`. Remove the `prefers-color-scheme` block. `color-scheme`
  follows the active theme.
- `ThemeToggle` (`src/components/ui/theme-toggle.tsx`): icon button, sun/moon, `aria-label`
  "Koyu temaya geç" / "Açık temaya geç", `aria-pressed`. Placed in: marketing header, dashboard
  header, guest menu top bar.
- Print views always render light.

## 4. Components (inventory and look)

| Component | Look |
|---|---|
| Button | Pill. `primary` = ink bg; `secondary` = surface + hairline; `ghost`; `destructive`; `brand` = brand gradient (landing hero CTA only). Heights 36 / 44 / 52. |
| IconButton | 40 px circle, ghost by default |
| Input / Textarea / Select | 44 px, radius-md, `surface` fill, `border-strong` 1 px, focus = 3 px accent ring at 25 % + border accent |
| Card | surface, radius-lg, hairline; `padding 24` (16 on mobile) |
| FloatingCard | surface, radius-lg, `shadow-float`, used around hero objects |
| Badge / Chip | radius-sm, `surface-muted`, caption text; status variants tint only |
| Sheet (new) | Right drawer ≥ 768 px (width 480), bottom sheet below; sticky header + footer actions; focus trap; Esc closes |
| Dialog | Centered, radius-xl, max 520 px; bottom sheet on mobile |
| Header (new) | Floating pill: `max-w-[1120px]`, 64 px tall, `surface/80` + backdrop blur + `shadow-float`, 12 px from top, sticky |
| StatsBand | ink background, radius-xl, 3 columns divided by hairlines (white 12 %) |
| StepList | Numbered rows with 28 px gradient dots |
| Gauge | Dashed ring (used for honest numbers only, e.g. "14 alerjen") |
| ThemeToggle | see §3 |
| Toast | sonner, top-center, surface + shadow-float |

Iconography: lucide, 1.75 stroke, 20 px in UI, 16 px inline.

## 5. Accessibility floor
Contrast AA in both themes (body 4.5:1, large/UI 3:1); visible focus ring on every control;
touch targets ≥ 44 px; every icon-only control has a Turkish `aria-label`; motion respects
`prefers-reduced-motion`; no information by color alone.
