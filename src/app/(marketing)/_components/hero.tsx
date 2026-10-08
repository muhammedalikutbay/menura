import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FloatingCard } from "@/components/ui/card";
import { Overline } from "@/components/ui/overline";
import { cn } from "@/lib/cn";
import { HeroPhone } from "./hero-phone";
import { MiniBars, QrGlyph } from "./sample-ui";

const GRID_MASK = "radial-gradient(ellipse at 50% 0%, black 30%, transparent 72%)";
const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
  backgroundSize: "56px 56px",
  maskImage: GRID_MASK,
  WebkitMaskImage: GRID_MASK,
};

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

/** A floating sample-UI card with the gentle bob. The outer element positions, the inner one moves. */
function Float({
  className,
  bobDelay,
  children,
}: {
  className: string;
  bobDelay: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("absolute", className)}>
      <FloatingCard className="animate-bob" style={{ animationDelay: bobDelay }}>
        {children}
      </FloatingCard>
    </div>
  );
}

export function Hero({ showDemo, signedIn }: { showDemo: boolean; signedIn: boolean }) {
  const ctaHref = (signedIn ? "/dashboard" : "/register") as Route;
  const ctaLabel = signedIn ? "Panele git" : "Ücretsiz başla";

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-60" style={GRID_STYLE} />

      <div className="mx-auto flex max-w-[1120px] flex-col items-center px-4 pt-16 text-center sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="animate-reveal">
          <Overline>Restoran ve kafeler için QR menü</Overline>
        </div>
        <h1
          id="hero-title"
          style={delay(60)}
          className="type-display-xl animate-reveal mt-6 text-balance"
        >
          <span className="block">Menünüz,</span>
          <span className="block">
            <span className="font-display-accent">tek bir QR&nbsp;kod</span> uzağında.
          </span>
        </h1>
        <p
          style={delay(120)}
          className="type-body-lg animate-reveal mt-5 max-w-[560px] text-pretty text-fg-muted"
        >
          Dakikalar içinde şık bir dijital menü hazırlayın, fiyatları anında güncelleyin. Misafirleriniz uygulama
          indirmeden, telefonundan okutup açsın.
        </p>
        <div
          style={delay(180)}
          className="animate-reveal mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
        >
          <Link href={ctaHref} className={buttonVariants({ variant: "brand", size: "lg" })}>
            {ctaLabel}
            <ArrowRight aria-hidden="true" />
          </Link>
          {showDemo && (
            <Link href={"/m/demo" as Route} className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Demo menüyü gör
            </Link>
          )}
        </div>
      </div>

      {/* Stage: the real phone on a half-circle glow. Everything decorative is clipped by the stage. */}
      <div style={delay(240)} className="animate-reveal relative mt-12 h-[500px] overflow-hidden sm:mt-16 sm:h-[620px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="gradient-brand absolute bottom-0 left-1/2 size-[520px] -translate-x-1/2 translate-y-1/2 rounded-full opacity-45 blur-3xl sm:size-[760px]" />
          <div className="absolute bottom-0 left-1/2 size-[640px] -translate-x-1/2 translate-y-1/2 rounded-full border border-border sm:size-[960px]" />
          <div className="absolute bottom-0 left-1/2 size-[900px] -translate-x-1/2 translate-y-1/2 rounded-full border border-border/70 sm:size-[1360px]" />
        </div>

        <div className="relative mx-auto flex h-full max-w-[1120px] justify-center pt-4">
          <HeroPhone />

          {/* Sample UI, not real data. Hidden from assistive tech: the phone carries the content. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <Float className="top-[88px] left-2 md:top-[72px] md:left-[3%] lg:left-[9%]" bobDelay="0s">
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-text">
                  <Check className="size-4" strokeWidth={2.5} />
                </span>
                <div className="text-left">
                  <p className="type-caption text-fg">Fiyat güncellendi</p>
                  <p className="type-caption text-fg-muted">az önce</p>
                </div>
              </div>
              <p className="type-caption tabular mt-3 hidden border-t border-border pt-3 text-left text-fg-muted sm:block">
                Mercimek çorbası · ₺120
              </p>
            </Float>

            <Float className="top-[330px] right-2 md:right-auto md:left-[4%] lg:left-[12%]" bobDelay="-2s">
              <p className="type-caption text-left text-fg-muted">Alerjenler</p>
              <div className="mt-2 flex gap-1.5">
                <Badge>Gluten</Badge>
                <Badge>Süt</Badge>
              </div>
            </Float>

            <Float className="top-[64px] right-[4%] hidden md:block lg:right-[11%]" bobDelay="-3s">
              <div className="flex items-center gap-3">
                <QrGlyph className="size-14 text-fg" />
                <div className="text-left">
                  <p className="type-caption text-fg-muted">QR kod</p>
                  <p className="type-title">Masa 12</p>
                </div>
              </div>
            </Float>

            <Float className="top-[320px] right-[3%] hidden w-[200px] md:block lg:right-[9%]" bobDelay="-1s">
              <p className="type-caption text-left text-fg-muted">Bugün (örnek)</p>
              <p className="tabular mt-1 text-left text-[22px] leading-tight font-semibold tracking-[-0.02em]">
                128 görüntülenme
              </p>
              <MiniBars className="mt-3 h-9" values={[34, 48, 40, 62, 52, 70, 58, 80, 66, 100]} />
            </Float>
          </div>
        </div>
      </div>
    </section>
  );
}
