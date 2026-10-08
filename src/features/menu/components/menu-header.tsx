import { AtSign, Globe, MapPin, Phone, Wifi } from "lucide-react";
import type { PublicRestaurant } from "../types";
import { menuThemeVars } from "../theme";
import { instagramHandle, instagramUrl, mapsSearchUrl, safeHttpUrl, telHref } from "../links";
import { infoPillClass } from "./info-pill";
import { initials } from "./initials";
import { MenuImage } from "./menu-image";
import type { MenuMode } from "./menu-mode";
import { WifiDialog } from "./wifi-dialog";

const externalLink = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Soft accent gradient used when the restaurant has no cover photo. */
const COVER_FALLBACK =
  "radial-gradient(120% 90% at 100% 0%, color-mix(in oklab, var(--color-accent) 30%, var(--color-bg)) 0%, transparent 62%), " +
  "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 46%, var(--color-bg)), " +
  "color-mix(in oklab, var(--color-accent) 12%, var(--color-bg)))";

/**
 * One info pill. In the embedded preview it is a plain, non-navigating element: the phone must not
 * dial, open maps or leave the page it is shown on.
 */
function InfoLink({
  href,
  external = false,
  embedded,
  children,
}: {
  href: string;
  external?: boolean;
  embedded: boolean;
  children: React.ReactNode;
}) {
  if (embedded) return <span className={infoPillClass}>{children}</span>;
  return (
    <a href={href} className={infoPillClass} {...(external ? externalLink : {})}>
      {children}
    </a>
  );
}

export function MenuHeader({ restaurant, mode = "page" }: { restaurant: PublicRestaurant; mode?: MenuMode }) {
  const { name, description, logoUrl, coverUrl, address, phone, instagram, website, wifiName, wifiPassword } =
    restaurant;
  const embedded = mode === "embedded";
  // The host page already has its own h1 when the menu is only a preview.
  const Title = embedded ? "h2" : "h1";
  const tel = phone ? telHref(phone) : null;
  const handle = instagram ? instagramHandle(instagram) : null;
  const site = website ? safeHttpUrl(website) : null;
  const hasInfo = Boolean(address || tel || handle || site || wifiName);

  return (
    <header className="mx-auto max-w-2xl">
      {/* Inset, rounded cover (radius-xl, 12px from the screen edges) or an accent gradient block of the same shape. */}
      <div className="px-3 pt-3">
        <div
          className="relative h-[200px] overflow-hidden rounded-xl bg-surface-muted sm:h-60"
          style={coverUrl ? undefined : { background: COVER_FALLBACK }}
        >
          {coverUrl && (
            <MenuImage
              src={coverUrl}
              alt=""
              fill
              priority={!embedded}
              loading={embedded ? "eager" : undefined}
              sizes={embedded ? "390px" : "(min-width: 672px) 672px, 100vw"}
              className="object-cover"
            />
          )}
        </div>
      </div>

      <div className="px-4 pb-2">
        {/* Logo tile overlapping the cover by 24px. */}
        <div className="relative -mt-6 flex size-16 items-center justify-center overflow-hidden rounded-lg bg-surface shadow-float ring-4 ring-bg">
          {logoUrl ? (
            <MenuImage src={logoUrl} alt={`${name} logosu`} fill loading="eager" sizes="64px" className="object-cover" />
          ) : (
            <span
              aria-hidden="true"
              className="type-title flex size-full items-center justify-center bg-accent-soft text-(color:--menu-accent-text)"
            >
              {initials(name)}
            </span>
          )}
        </div>

        <Title className="type-title-lg mt-3 text-balance">{name}</Title>
        {description && <p className="type-body mt-1.5 max-w-prose text-fg-muted text-pretty">{description}</p>}

        {hasInfo && (
          <ul
            aria-label="Restoran bilgileri"
            className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1"
          >
            {address && (
              <li className="flex shrink-0">
                <InfoLink href={mapsSearchUrl(address)} external embedded={embedded}>
                  <MapPin aria-hidden="true" />
                  <span className="truncate">{address}</span>
                  {!embedded && <span className="sr-only"> (haritada aç)</span>}
                </InfoLink>
              </li>
            )}
            {tel && (
              <li className="flex shrink-0">
                <InfoLink href={tel} embedded={embedded}>
                  <Phone aria-hidden="true" />
                  <span>Ara</span>
                  <span className="sr-only">{phone}</span>
                </InfoLink>
              </li>
            )}
            {handle && (
              <li className="flex shrink-0">
                <InfoLink href={instagramUrl(handle)} external embedded={embedded}>
                  <AtSign aria-hidden="true" />
                  <span>
                    <span className="sr-only">Instagram: </span>
                    {handle}
                  </span>
                </InfoLink>
              </li>
            )}
            {site && (
              <li className="flex shrink-0">
                <InfoLink href={site.href} external embedded={embedded}>
                  <Globe aria-hidden="true" />
                  <span className="truncate">{site.hostname.replace(/^www\./, "")}</span>
                </InfoLink>
              </li>
            )}
            {wifiName && (
              <li className="flex shrink-0">
                {embedded ? (
                  <span className={infoPillClass}>
                    <Wifi aria-hidden="true" />
                    <span>Wi-Fi</span>
                  </span>
                ) : (
                  <WifiDialog
                    name={wifiName}
                    password={wifiPassword}
                    themeStyle={menuThemeVars(restaurant.themeColor) as React.CSSProperties}
                  />
                )}
              </li>
            )}
          </ul>
        )}
      </div>
    </header>
  );
}
