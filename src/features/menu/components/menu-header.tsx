import { AtSign, Globe, MapPin, Phone, Wifi } from "lucide-react";
import Image from "next/image";
import type { PublicRestaurant } from "../types";
import { menuThemeVars } from "../theme";
import { instagramHandle, instagramUrl, mapsSearchUrl, safeHttpUrl, telHref } from "../links";
import { infoPillClass } from "./info-pill";
import type { MenuMode } from "./menu-mode";
import { WifiDialog } from "./wifi-dialog";

const externalLink = { target: "_blank", rel: "noopener noreferrer" } as const;

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
  const tel = phone ? telHref(phone) : null;
  const handle = instagram ? instagramHandle(instagram) : null;
  const site = website ? safeHttpUrl(website) : null;
  // The host page already has its own h1 when the menu is only a preview.
  const Title = embedded ? "h2" : "h1";
  const hasInfo = Boolean(address || tel || handle || site || wifiName);

  return (
    <header>
      <div
        className={`relative w-full overflow-hidden ${coverUrl ? "h-48 sm:h-64" : "h-28 sm:h-36"}`}
        style={
          coverUrl
            ? undefined
            : {
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 42%, var(--color-bg)), " +
                  "color-mix(in oklab, var(--color-accent) 10%, var(--color-bg)))",
              }
        }
      >
        {coverUrl && (
          <Image
            src={coverUrl}
            alt=""
            fill
            priority={!embedded}
            loading={embedded ? "eager" : undefined}
            sizes={embedded ? "390px" : "100vw"}
            className="object-cover"
          />
        )}
        {/* Keeps the logo edge and the page background from clashing on bright photos. */}
        {coverUrl && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/25 to-transparent"
          />
        )}
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-2">
        {logoUrl && (
          <div className="relative -mt-10 size-20 overflow-hidden rounded-2xl border-4 border-bg bg-surface shadow-md">
            <Image src={logoUrl} alt={`${name} logosu`} fill loading="eager" sizes="80px" className="object-cover" />
          </div>
        )}
        <Title className={`${logoUrl ? "mt-3" : "mt-5"} text-3xl font-bold tracking-tight text-balance`}>{name}</Title>
        {description && <p className="mt-2 max-w-prose text-base text-fg-muted text-pretty">{description}</p>}

        {hasInfo && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Restoran bilgileri">
            {address && (
              <li className="max-w-full">
                <InfoLink href={mapsSearchUrl(address)} external embedded={embedded}>
                  <MapPin aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  <span>{address}</span>
                  {!embedded && <span className="sr-only"> (haritada aç)</span>}
                </InfoLink>
              </li>
            )}
            {tel && (
              <li>
                <InfoLink href={tel} embedded={embedded}>
                  <Phone aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  <span>{phone}</span>
                </InfoLink>
              </li>
            )}
            {handle && (
              <li>
                <InfoLink href={instagramUrl(handle)} external embedded={embedded}>
                  <AtSign aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  <span>
                    <span className="sr-only">Instagram: </span>
                    {handle}
                  </span>
                </InfoLink>
              </li>
            )}
            {site && (
              <li>
                <InfoLink href={site.href} external embedded={embedded}>
                  <Globe aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  <span>{site.hostname.replace(/^www\./, "")}</span>
                </InfoLink>
              </li>
            )}
            {wifiName && (
              <li>
                {embedded ? (
                  <span className={infoPillClass}>
                    <Wifi aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
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
