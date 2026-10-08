import type { Metadata, Route } from "next";
import Link from "next/link";
import { ArrowRight, Leaf, Palette, Plus, Receipt, type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatsBand } from "@/components/ui/stats-band";
import { StepList } from "@/components/ui/step-list";
import { cn } from "@/lib/cn";
import { hasDemoMenu } from "@/features/menu/demo";
import { serializeJsonLd } from "@/features/menu/json-ld";
import { getSession } from "@/server/session";
import { BuilderVisual, QrVisual, StatsVisual } from "./_components/feature-visuals";
import { Hero } from "./_components/hero";
import { Reveal } from "./_components/reveal";

const TITLE = "Menura — Restoran ve kafeler için QR menü";
const DESCRIPTION =
  "Restoranınız veya kafeniz için dakikalar içinde şık bir dijital menü hazırlayın, QR kodla masalara taşıyın ve fiyatları anında güncelleyin. Baskı maliyeti yok, uygulama indirmek yok.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: ["QR menü", "dijital menü", "restoran menüsü", "kafe menüsü", "QR kod menü"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Menura",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

const FACTS = [
  { value: "14", label: "yasal alerjen" },
  { value: "Saniyeler", label: "içinde güncelleme" },
  { value: "Uygulama", label: "gerekmez" },
];

const GRID_FEATURES: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: Leaf,
    title: "Alerjen ve etiketler",
    text: "Yasal 14 alerjeni ve vegan, glutensiz gibi diyet etiketlerini ürün başına belirtin; misafirleriniz doğru seçimi kolayca yapsın.",
  },
  {
    icon: Palette,
    title: "Markanızın rengi",
    text: "Menünün vurgu rengini markanıza uyarlayın. Kategori çubuğu, etiketler ve fiyatlar seçtiğiniz renge bürünür.",
  },
  {
    icon: Receipt,
    title: "KDV ve fiyat notu",
    text: "Fiyatların altında “KDV dahildir” notunu isterseniz gösterin, isterseniz gizleyin. Fiyatlar seçtiğiniz para birimine uygun biçimde yazılır.",
  },
];

const STEPS = [
  {
    title: "Hesabınızı açın",
    description: "E-posta adresi yeterli. Restoranın adı ve menü adresi birkaç dakikada hazır.",
  },
  {
    title: "Menünüzü kurun",
    description: "Kategoriler ve ürünler fotoğraf, fiyat ve açıklamalarıyla eklenir. Hazır olunca yayınlanır.",
  },
  {
    title: "QR kodu masalara koyun",
    description: "QR kod indirilir ya da masa kartları yazdırılır. Misafir okutur, menü anında açılır.",
  },
  {
    title: "Güncelleyin, anında yansısın",
    description: "Fiyat ya da ürün değişince QR aynı kalır; menü kaydedildiği anda güncellenir.",
  },
];

const FAQ: Array<{ question: string; answer: React.ReactNode }> = [
  {
    question: "Menura ücretli mi?",
    answer: "Hesap oluşturup menünüzü hazırlamaya ücretsiz başlayabilirsiniz.",
  },
  {
    question: "Misafirlerin uygulama indirmesi gerekir mi?",
    answer:
      "Hayır. Misafirleriniz telefonunun kamerasıyla QR kodu okutur ve menü doğrudan tarayıcıda açılır.",
  },
  {
    question: "Menüyü değiştirdiğimde QR kodu yeniden basmam gerekir mi?",
    answer:
      "Hayır. QR kodunuz menü adresinize bağlıdır ve aynı kalır. Fiyat, ürün veya kategori değişiklikleri kaydedildiği anda menüde görünür.",
  },
  {
    question: "Menüyü ne zaman misafirler görebilir?",
    answer:
      "Menünüz siz yayınlayana kadar taslak olarak kalır. Taslak menüyü okutan kişi “Menü bulunamadı” sayfasını görür. Hazır olduğunuzda panelden yayınlayabilirsiniz.",
  },
  {
    question: "Alerjen bilgilerini ve fiyatlardaki KDV notunu yönetebilir miyim?",
    answer:
      "Evet. Her ürün için alerjenleri ve diyet etiketlerini seçebilir, “KDV dahildir” notunu Görünüm sayfasından açıp kapatabilirsiniz. Bilgilerin doğruluğundan işletme olarak siz sorumlusunuz.",
  },
  {
    question: "Verilerim nasıl işleniyor?",
    answer: (
      <>
        Kişisel verileriniz 6698 sayılı KVKK kapsamında işlenir. Ayrıntılar için{" "}
        <Link href={"/privacy" as Route} className="font-medium text-accent-text underline underline-offset-4">
          aydınlatma metnimizi
        </Link>{" "}
        okuyabilirsiniz.
      </>
    ),
  },
];

const CONTAINER = "mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8";

/** One feature: text on one side, a UI visual on the other; `reverse` swaps them from 768px up. */
function Split({
  id,
  title,
  text,
  visual,
  reverse = false,
}: {
  id: string;
  title: string;
  text: string;
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section aria-labelledby={id} className={cn(CONTAINER, "py-12 md:py-20")}>
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <Reveal className={cn(reverse && "md:order-2")}>
          <h2 id={id} className="type-display text-balance">
            {title}
          </h2>
          <p className="type-body-lg mt-5 max-w-[480px] text-pretty text-fg-muted">{text}</p>
        </Reveal>
        <Reveal delay={80} className={cn(reverse && "md:order-1")}>
          {visual}
        </Reveal>
      </div>
    </section>
  );
}

export default async function LandingPage() {
  const showDemo = await hasDemoMenu();
  const session = await getSession().catch(() => null);
  const signedIn = Boolean(session);
  const ctaHref = (signedIn ? "/dashboard" : "/register") as Route;
  const ctaLabel = signedIn ? "Panele git" : "Ücretsiz başla";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Menura",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            inLanguage: "tr",
            description: DESCRIPTION,
          }),
        }}
      />

      <Hero showDemo={showDemo} signedIn={signedIn} />

      {/* Facts: honest product facts only, no customer counts or growth claims. */}
      <section aria-label="Menura kısaca" className="relative z-10 -mt-10">
        <div className={CONTAINER}>
          <Reveal>
            <StatsBand items={FACTS} />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <div id="ozellikler" className="scroll-mt-24 pt-20 pb-6 md:pt-32 md:pb-10">
        <Split
          id="split-builder"
          title="Menünüzü tek ekranda kurun"
          text="Kategorileri ve ürünleri tek ekrandan yönetin: sürükleyerek sıralayın, fiyatı değiştirin, biten ürünü tek dokunuşla kapatın."
          visual={<BuilderVisual />}
        />
        <Split
          id="split-qr"
          title="Markanıza uyan QR kod"
          text="Renkleri, nokta ve köşe stilini seçin, logonuzu ortaya ekleyin. PNG veya SVG olarak indirin, hazır masa kartlarını yazdırın."
          visual={<QrVisual />}
          reverse
        />
        <Split
          id="split-stats"
          title="Ne kadar ilgi gördüğünüzü bilin"
          text="Menünüzün bugün, bu hafta ve toplamda kaç kez açıldığını gerçek verilerle takip edin. Ziyaretçileri tanımlayan hiçbir bilgi tutulmaz."
          visual={<StatsVisual />}
        />
      </div>

      {/* Feature grid */}
      <section aria-labelledby="grid-title" className={cn(CONTAINER, "py-20 md:py-28")}>
        <Reveal>
          <h2 id="grid-title" className="type-display mx-auto max-w-[720px] text-center text-balance">
            Ayrıntılar da düşünüldü
          </h2>
        </Reveal>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {GRID_FEATURES.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="flex">
              <Reveal delay={index * 60} className="flex w-full">
                <Card className="w-full gap-4 px-5 py-6 sm:px-6 sm:py-8">
                  <span className="flex size-11 items-center justify-center rounded-md bg-surface-muted text-fg">
                    <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="type-title">{title}</h3>
                  <p className="type-body text-fg-muted">{text}</p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section id="nasil-calisir" aria-labelledby="steps-title" className="scroll-mt-24 py-12 md:py-20">
        <div className={cn(CONTAINER, "grid items-start gap-10 md:grid-cols-2 md:gap-16")}>
          <Reveal className="md:sticky md:top-28">
            <h2 id="steps-title" className="type-display text-balance">
              Dört adımda yayında
            </h2>
            <p className="type-body-lg mt-5 max-w-[480px] text-pretty text-fg-muted">
              Kurulum için tasarımcıya ya da yazılımcıya ihtiyaç yok.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <Card className="px-6 py-8 sm:px-8 sm:py-10">
              <StepList steps={STEPS} />
            </Card>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="sss" aria-labelledby="faq-title" className="scroll-mt-24 py-20 md:py-28">
        <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6">
          <Reveal>
            <h2 id="faq-title" className="type-display text-center text-balance">
              Sık sorulan sorular
            </h2>
          </Reveal>
          <Reveal delay={80} className="mt-10">
            <div className="divide-y divide-border overflow-hidden rounded-lg bg-surface shadow-hairline">
              {FAQ.map(({ question, answer }) => (
                <details key={question} className="group">
                  <summary className="type-body flex min-h-14 list-none items-center justify-between gap-4 px-5 py-3 text-left font-medium transition-colors hover:bg-surface-muted/60 sm:px-6 [&::-webkit-details-marker]:hidden">
                    {question}
                    <Plus
                      aria-hidden="true"
                      className="size-5 shrink-0 text-fg-muted transition-transform duration-200 group-open:rotate-45"
                    />
                  </summary>
                  <div className="type-body px-5 pt-1 pb-5 text-fg-muted sm:px-6">{answer}</div>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section aria-labelledby="cta-title" className="bg-canvas py-20 md:py-28">
        <div className={CONTAINER}>
          <Reveal>
            <Card className="relative isolate items-center overflow-hidden px-6 py-16 text-center sm:px-12 sm:py-24">
              <div
                aria-hidden="true"
                className="gradient-brand absolute bottom-0 left-1/2 -z-10 h-[360px] w-[640px] max-w-[160%] -translate-x-1/2 translate-y-1/2 rounded-full opacity-45 blur-3xl"
              />
              <h2 id="cta-title" className="type-display max-w-[640px] text-balance">
                İlk menünüzü bugün yayınlayın.
              </h2>
              <p className="type-body-lg max-w-[480px] text-pretty text-fg-muted">
                Dakikalar içinde hazırlayın, QR kodunuzu masalara koyun.
              </p>
              <Link href={ctaHref} className={buttonVariants({ size: "lg", className: "mt-2" })}>
                {ctaLabel}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Card>
          </Reveal>
        </div>
      </section>
    </>
  );
}
