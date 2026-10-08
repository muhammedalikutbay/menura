import { AtSign, Globe, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import type { PublicRestaurant } from "../queries";
import { menuThemeVars } from "../theme";
import { instagramHandle, instagramUrl, mapsSearchUrl, safeHttpUrl, telHref } from "../links";
import { infoPillClass } from "./info-pill";
import { WifiDialog } from "./wifi-dialog";

const externalLink = { target: "_blank", rel: "noopener noreferrer" } as const;

export function MenuHeader({ restaurant }: { restaurant: PublicRestaurant }) {
  const { name, description, logoUrl, coverUrl, address, phone, instagram, website, wifiName, wifiPassword } =
    restaurant;
  const tel = phone ? telHref(phone) : null;
  const handle = instagram ? instagramHandle(instagram) : null;
  const site = website ? safeHttpUrl(website) : null;
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
            priority
            sizes="100vw"
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
        <h1 className={`${logoUrl ? "mt-3" : "mt-5"} text-3xl font-bold tracking-tight text-balance`}>{name}</h1>
        {description && <p className="mt-2 max-w-prose text-base text-fg-muted text-pretty">{description}</p>}

        {hasInfo && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Restoran bilgileri">
            {address && (
              <li className="max-w-full">
                <a href={mapsSearchUrl(address)} className={infoPillClass} {...externalLink}>
                  <MapPin aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  <span>{address}</span>
                  <span className="sr-only"> (haritada aç)</span>
                </a>
              </li>
            )}
            {tel && (
              <li>
                <a href={tel} className={infoPillClass}>
                  <Phone aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  <span>{phone}</span>
                </a>
              </li>
            )}
            {handle && (
              <li>
                <a href={instagramUrl(handle)} className={infoPillClass} {...externalLink}>
                  <AtSign aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  <span>
                    <span className="sr-only">Instagram: </span>
                    {handle}
                  </span>
                </a>
              </li>
            )}
            {site && (
              <li>
                <a href={site.href} className={infoPillClass} {...externalLink}>
                  <Globe aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
                  <span>{site.hostname.replace(/^www\./, "")}</span>
                </a>
              </li>
            )}
            {wifiName && (
              <li>
                <WifiDialog
                  name={wifiName}
                  password={wifiPassword}
                  themeStyle={menuThemeVars(restaurant.themeColor) as React.CSSProperties}
                />
              </li>
            )}
          </ul>
        )}
      </div>
    </header>
  );
}
