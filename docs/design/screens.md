# Menura screens and information architecture (v2.1)

Companion to `design-language.md`. Wireframes are structural; spacing and styling follow the
design language. UI copy below is final unless marked *(örnek)*.

## 1. Information architecture

### Routes
| Route | Screen | Nav label |
|---|---|---|
| `/` | Landing | — |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/onboarding` | Auth | — |
| `/dashboard` | Overview | Genel bakış |
| `/dashboard/menu` | Menu builder (categories + products) | Menü |
| `/dashboard/restaurant` | Restaurant profile | Restoran |
| `/dashboard/appearance` | Menu & appearance settings | Görünüm |
| `/dashboard/qr` (+ `/print`) | QR codes | QR kod |
| `/dashboard/account` | Account (from the user menu only) | — |
| `/m/[slug]` | Guest menu | — |

### Permanent redirects (308, `next.config.ts` `redirects()`)
| From | To |
|---|---|
| `/dashboard/categories` | `/dashboard/menu` |
| `/dashboard/products` | `/dashboard/menu` (query `category=<id>` → `/dashboard/menu#cat-<id>` is not possible server-side; keep `?category=<id>`, the builder scrolls to it) |
| `/dashboard/products/new` | `/dashboard/menu?new=product` |
| `/dashboard/products/:id` | `/dashboard/menu?product=:id` (opens the editor sheet) |
| `/dashboard/settings` | `/dashboard/restaurant` |

### Dashboard header (replaces the sidebar entirely)
```
╭──────────────────────────────────────────────────────────────────────────────╮
│ [◎ Menura] · Şükrü'nün Çay Bahçesi ●Yayında   Genel bakış  Menü  Restoran   │
│                                                Görünüm  QR kod   [↗ Menüyü gör] [☾] (MA)│
╰──────────────────────────────────────────────────────────────────────────────╯
```
- Floating pill header (design-language §4), sticky. Left: logo + restaurant name + status dot
  (green "Yayında" / grey "Taslak", links to `/dashboard/appearance`). Center: nav links, active =
  ink text + 2 px underline pill. Right: "Menüyü gör" (opens `/m/<slug>` in a new tab), ThemeToggle,
  avatar button.
- Avatar menu: name + email · "Hesap ayarları" → `/dashboard/account` · "Çıkış yap".
- < 1024 px: logo + status + "Menüyü gör" icon + ThemeToggle + menu button → bottom sheet with
  the nav, then account links.
- Page body: `canvas` background, container 1200 px, page title (title-lg) + one-line description
  + optional primary action on the right.

## 2. Landing (`/`)
Sections top to bottom (one idea each):

1. **Header** — floating pill: logo · center links (Özellikler, Nasıl çalışır, SSS) · right:
   ThemeToggle, "Giriş yap" (ghost), "Ücretsiz başla" (primary). Signed in: "Panele git".
2. **Hero** — centered:
   - Overline chip: "Restoran ve kafeler için QR menü"
   - H1 (display-xl, two lines): "Menünüz, *tek bir QR kod* uzağında." (*italic serif accent*)
   - Sub (body-lg, max 560): "Dakikalar içinde şık bir dijital menü hazırlayın, fiyatları anında
     güncelleyin. Misafirleriniz uygulama indirmeden, telefonundan okutup açsın."
   - CTAs: "Ücretsiz başla" (brand) · "Demo menüyü gör" (secondary, only when the demo exists)
   - Stage: the **3D phone** (§6) centered on a soft half-circle brand glow + 2 faint concentric
     arcs; 4 floating cards *(örnek UI)* around it, hidden below 768 px except two:
     - top-left: "Fiyat güncellendi · az önce" toast with a check
     - bottom-left: allergen chip card "Alerjenler: Gluten, Süt"
     - top-right: small QR card "Masa 12"
     - bottom-right: mini bar chart "Bugün 128 görüntülenme" *(örnek)*
3. **Facts band** (dark StatsBand, honest facts, no growth claims):
   "14 yasal alerjen" · "Saniyeler içinde güncelleme" · "Uygulama gerekmez".
4. **Feature splits** ×3 (alternating text/visual; each visual is real UI composed from kit parts):
   - "Menünüzü tek ekranda kurun" — fragment of the menu builder (category card with 3 rows).
   - "Markanıza uyan QR kod" — QR card with color dots and "PNG / SVG" chips.
   - "Ne kadar ilgi gördüğünüzü bilin" — 14-day bars card.
5. **Feature grid** — 3 cards: "Alerjen ve etiketler", "Açık ve koyu tema", "KDV ve fiyat notu".
6. **Nasıl çalışır** — StepList: 1 Hesabını aç · 2 Menünü kur · 3 QR'ı masalara koy · 4 Güncelle, anında yansısın.
7. **SSS** — `<details>` accordion, 5 questions (existing copy).
8. **Final CTA** — card on canvas with glow: "İlk menünüzü bugün yayınlayın." + primary CTA.
9. **Footer** — ink background, radius-xl top corners; left tagline "Daha iyi menüler, daha az
   baskı."; link columns (Ürün, Yasal); bottom row © + links; giant "Menura" wordmark (clamp
   80–220 px, semibold, ink-fg at 12 % → 100 % gradient), cropped at the bottom edge.

## 3. Menu builder (`/dashboard/menu`)
```
Menü                                                  [⌕ Ürünlerde ara      ] [Tümü▾] [+ Kategori]
Kategorileri ve ürünleri tek ekrandan yönetin.

┌ Kategoriler ┐  ┌───────────────────────────────────────────────────────────────┐
│ ⠿ Başlangıç 8│  │ ⠿  Başlangıçlar            8 ürün   [Menüde ● ]   ⋯            │
│ ⠿ Ana yemek 8│  │ ─────────────────────────────────────────────────────────────  │
│ ⠿ Tatlılar  6│  │ ☐ ⠿ [img] Bruschetta   Domates, sarımsak…   Vejetaryen  ₺110  [●] ⋯│
│   …          │  │ ☐ ⠿ [img] Kalamar      Tarator sos…   ₺290 ₺246,50       [●] ⋯│
│ + Kategori   │  │ + Ürün ekle                                                    │
└─────────────┘  └───────────────────────────────────────────────────────────────┘
                 ┌ Ana yemekler … ┐
                                   ╭ 2 seçili · Stokta yap · Tükendi · Taşı · Sil ╮  (floating)
```
- Left index (≥ 1024 px, sticky): category list with counts, click = scroll to section, drag to
  reorder categories. Below 1024 px the index becomes a horizontal chip scroller under the title.
- Each category = Card. Header: drag handle, inline-editable name (click → input, Enter saves),
  product count, "Menüde" switch (isActive), ⋯ menu (Düzenle → sheet with description + image,
  Sil → confirm with product count).
- Product row (64 px): checkbox (visible on hover/focus or when any selected), drag handle,
  48 px thumb, name + 1-line description, tags, price (discount shows both), availability switch,
  ⋯ (Düzenle, Kopyala, Sil). Click on the row opens the editor sheet.
- Drag & drop: dnd-kit multiple containers; products can move **between categories** (moveProducts
  then reorderProducts) and reorder within; keyboard sensor + Turkish announcements (reuse
  `components/ui/sortable.tsx`).
- "+ Ürün ekle" at the bottom of each category opens the editor sheet with that category preset.
- Editor sheet: a **floating** right panel (480 px, 16 px inset from the viewport edges and below the
  header, radius-xl, shadow-float; the page stays visible and scrollable) / bottom sheet on mobile.
  The existing ProductForm fields, grouped:
  Temel bilgiler · Fiyat · Görsel · Alerjen ve etiketler · Detaylar; sticky footer
  "Vazgeç" / "Kaydet". Unsaved-changes confirm on close. URL reflects state: `?product=<id>`,
  `?new=product&category=<id>` (so links and back button work).
- Search filters rows across categories (Turkish-normalized) and hides empty categories; filter
  menu: Tümü / Stokta / Tükendi / Öne çıkanlar. Drag is disabled while filtering.
- Bulk bar floats at the bottom center (pill, shadow-float).
- Empty state: centered card "İlk kategorinizi oluşturun" with an inline name input.

## 4. Settings split

### Restoran (`/dashboard/restaurant`)
Cards: **Kimlik** (ad, açıklama, logo, kapak) · **İletişim** (telefon, adres, Instagram, web) ·
**Wi-Fi** (ağ adı, şifre + visibility hint). One sticky "Değişiklikleri kaydet" bar appears when dirty.

### Görünüm (`/dashboard/appearance`)
Two columns ≥ 1024 px: settings left, **live phone preview** right (sticky, §6 component fed with
the restaurant's real menu data + unsaved form values).
Cards: **Yayın durumu** (switch + explanation) · **Menü adresi** (slug field + QR warning) ·
**Tema** (theme color swatches + custom) · **Fiyat ve içerik** (para birimi, KDV notu,
tükenenleri gizle).

### Hesap (`/dashboard/account`)
Cards: **Profil** (ad; e-posta read-only) · **Şifre** (change password) · **Tehlikeli bölge**
(delete account). Reached from the avatar menu.

## 5. Guest menu (`/m/[slug]`)
```
╭ cover image, radius-xl, inset 12 px from screen edges, 200 px ╮
│                                               [☾]             │  ← ThemeToggle on the cover (blurred chip)
╰───────────────────────────────────────────────────────────────╯
 (logo) Lezzet Durağı                         ← title-lg, overlaps cover bottom by 24 px
 Mahallenin sıcak mutfağı…                     ← body, fg-muted
 [⌖ Atakum] [☏ Ara] [◎ Instagram] [Wi-Fi]      ← info pills, horizontal scroll
━━ sticky: [⌕] (Öne çıkanlar) (Başlangıçlar) (Ana yemekler) … ━━   ← chips, active = accent fill
 Öne çıkanlar   → horizontal cards 160 px
 Başlangıçlar
   Bruschetta                              [img 88]
   Domates, sarımsak…  · Vejetaryen
   ₺110
 …
 footer: KDV notu · alerjen notu · "Menura ile hazırlandı"
```
- No cover → soft accent gradient block of the same shape.
- Active chip uses the restaurant accent with `--color-accent-fg`; prices use `--menu-accent-text`.
- Product sheet unchanged in behavior; restyled per kit.
- ThemeToggle shares `menura-theme` with the rest of the site.

## 6. 3D phone preview (contract shared by landing, appearance page and future builder preview)

### Refactor
1. Move `PublicMenu`, `PublicRestaurant`, `PublicCategory`, `PublicProduct` types from
   `features/menu/queries.ts` (server-only) to `features/menu/types.ts` (shared); queries re-export.
2. Extract `MenuView` (`features/menu/components/menu-view.tsx`):
   `MenuView({ menu, mode }: { menu: PublicMenu; mode: "page" | "embedded" })` renders header,
   browser (sticky bar + sections), footer and product sheet. `/m/[slug]/page.tsx` becomes metadata
   + JSON-LD + beacon + `<MenuView mode="page" />`.
3. Embedded mode: the menu's own scroll container is the root element (not `window`); scroll-spy,
   sticky bar and "scroll to section" use that container; the product sheet renders inside the
   root (absolute, no portal, no `history.pushState`); no global `document` listeners (delegate on
   the root ref); no view beacon; outbound links (phone, maps, Instagram, website, Wi-Fi) are
   rendered as non-navigating elements, while chips, search and product rows stay interactive. The preview is a labelled region (`aria-label="Örnek menü
   önizlemesi"`) with real, keyboard-reachable controls; it is not hidden from assistive tech.

### Component
`MenuPhonePreview({ menu, tilt = true, size = "lg", className })` in
`features/menu/preview/menu-phone-preview.tsx` (client):
- Screen 390 × 844 logical px, scaled via CSS `scale` to fit `size` (`lg` 360 px wide on desktop,
  `md` 300 px, `sm` 260 px); content is crisp (scale on the frame, not a bitmap).
- Frame: 3D via `perspective: 1800px`; resting pose `rotateX(6deg) rotateY(-14deg) rotateZ(1deg)`;
  layered bezel (titanium gradient border 12 px, inner black 3 px), radius 56 px outer / 44 px
  screen, dynamic island, side buttons (pseudo-elements), glass reflection overlay (linear
  gradient, 8 % opacity), soft ground shadow (blurred ellipse below).
- Pointer tilt ±6° with spring easing; resets on leave; disabled for reduced motion and touch.
- Content: `<MenuView mode="embedded" menu={menu} />`, starts scrolled to top; auto-scroll demo
  is NOT used.
- Sample data: `features/menu/preview/sample-menu.ts` — static `PublicMenu` (restaurant "Lezzet
  Durağı", 3 categories, 7 products with tags/allergens, one discount) using local images in
  `public/preview/*.webp` (6 files ≤ 60 KB each, taken from the seed's Unsplash set, re-encoded).
- Landing uses the sample data; the appearance page passes the real restaurant data.
