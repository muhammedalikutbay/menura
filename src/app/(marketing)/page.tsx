import type { Metadata, Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChartColumn,
  ChevronDown,
  Leaf,
  ListPlus,
  Printer,
  QrCode,
  Receipt,
  Smartphone,
  UserPlus,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { hasDemoMenu } from "@/features/menu/demo";
import { getSession } from "@/server/session";
import { Hero } from "./_components/hero";

const TITLE = "Menura — Restoran ve kafeler için QR menü";
const DESCRIPTION =
  "Restoranınız veya kafeniz için dakikalar içinde şık bir dijital menü hazırlayın, QR kodla masalara taşıyın ve fiyatları anında güncelleyin. Baskı maliyeti yok, uygulama indirmek yok.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
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

const FEATURES: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: Zap,
    title: "Anında güncelleme",
    text: "Fiyatı değiştirin, ürünü tükendi olarak işaretleyin; menünüz saniyeler içinde güncellenir. Yeniden baskıya gerek kalmaz.",
  },
  {
    icon: QrCode,
    title: "QR kod tasarımı",
    text: "Renkleri, nokta ve köşe stilini seçin, logonuzu ortaya ekleyin. PNG veya SVG olarak indirin, hazır masa kartlarını yazdırın.",
  },
  {
    icon: Leaf,
    title: "Alerjen ve etiketler",
    text: "Alerjenleri ve vegan, glutensiz gibi diyet etiketlerini ürün başına belirtin; misafirleriniz doğru seçimi kolayca yapsın.",
  },
  {
    icon: Smartphone,
    title: "Çoklu cihaz uyumu",
    text: "Menü telefonda, tablette ve bilgisayarda hızlı açılır ve ekran boyutuna uyum sağlar. Uygulama indirmek gerekmez.",
  },
  {
    icon: ChartColumn,
    title: "Görüntülenme istatistikleri",
    text: "Menünüzün bugün, bu hafta ve toplamda kaç kez açıldığını gerçek verilerle takip edin.",
  },
  {
    icon: Receipt,
    title: "KDV ve fiyat notu",
    text: "Fiyatların altında “KDV dahildir” notunu isterseniz gösterin, isterseniz gizleyin. Fiyatlar seçtiğiniz para birimine uygun biçimde gösterilir.",
  },
];

const STEPS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: UserPlus,
    title: "Hesabınızı oluşturun",
    text: "E-posta adresinizle kaydolun, restoranınızın adını ve menü adresinizi seçin.",
  },
  {
    icon: ListPlus,
    title: "Menünüzü hazırlayın",
    text: "Kategorilerinizi ve ürünlerinizi fotoğraf, fiyat ve açıklamalarıyla ekleyin. Hazır olunca yayınlayın.",
  },
  {
    icon: Printer,
    title: "QR kodu masalara koyun",
    text: "Tasarladığınız QR kodu indirin veya masa kartlarını yazdırın. Misafirler okutur, menü anında açılır.",
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
      "Menünüz siz yayınlayana kadar taslak olarak kalır. Taslak menüyü okutan kişi “Menü bulunamadı” sayfasını görür. Hazır olduğunuzda Ayarlar bölümünden yayınlayabilirsiniz.",
  },
  {
    question: "Alerjen bilgilerini ve fiyatlardaki KDV notunu yönetebilir miyim?",
    answer:
      "Evet. Her ürün için alerjenleri ve diyet etiketlerini seçebilir, “KDV dahildir” notunu ayarlardan açıp kapatabilirsiniz. Bilgilerin doğruluğundan işletme olarak siz sorumlusunuz.",
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

const primaryCta = buttonVariants({ size: "lg" });

export default async function LandingPage() {
  const showDemo = await hasDemoMenu();
  const session = await getSession().catch(() => null);
  const ctaHref = (session ? "/dashboard" : "/register") as Route;
  const ctaLabel = session ? "Panele git" : "Ücretsiz başla";

  return (
    <>
      <Hero showDemo={showDemo} signedIn={Boolean(session)} />

      {/* Features */}
      <section id="ozellikler" aria-labelledby="features-title" className="scroll-mt-20 bg-surface-muted">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto flex max-w-2xl flex-col gap-3 text-center">
            <h2 id="features-title" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              İhtiyacınız olan her şey, sade bir panelde.
            </h2>
            <p className="text-lg text-fg-muted">
              Menünüzü yönetmek için teknik bilgiye gerek yok. Her özellik, günlük işleyişinizi hızlandırmak için
              tasarlandı.
            </p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 shadow-xs">
                <span className="flex size-11 items-center justify-center rounded-md bg-accent-soft text-accent-text">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="text-base text-fg-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="nasil-calisir" aria-labelledby="steps-title" className="scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto flex max-w-2xl flex-col gap-3 text-center">
            <h2 id="steps-title" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Üç adımda yayında.
            </h2>
            <p className="text-lg text-fg-muted">Kurulum için tasarımcıya veya yazılımcıya ihtiyacınız yok.</p>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="flex flex-col items-center gap-4 text-center">
                <span className="relative flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                  <Icon aria-hidden="true" className="size-7" />
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-fg"
                  >
                    {index + 1}
                  </span>
                </span>
                <h3 className="text-lg font-semibold tracking-tight">
                  <span className="sr-only">{index + 1}. adım: </span>
                  {title}
                </h3>
                <p className="max-w-xs text-base text-fg-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section id="sss" aria-labelledby="faq-title" className="scroll-mt-20 bg-surface-muted">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <h2
            id="faq-title"
            className="text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Sık sorulan sorular
          </h2>
          <div className="mt-10 flex flex-col gap-3">
            {FAQ.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-lg border border-border bg-surface shadow-xs open:shadow-sm"
              >
                <summary className="flex min-h-14 list-none items-center justify-between gap-4 rounded-lg px-5 py-3 text-left text-base font-medium [&::-webkit-details-marker]:hidden">
                  {question}
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 text-fg-muted transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="px-5 pb-5 text-base text-fg-muted">{answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section aria-labelledby="cta-title">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="flex flex-col items-center gap-6 rounded-xl bg-accent-soft px-6 py-14 text-center sm:px-12">
            <h2 id="cta-title" className="max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Menünüzü bugün hazırlamaya başlayın.
            </h2>
            <p className="max-w-lg text-lg text-fg-muted">
              İlk menünüzü dakikalar içinde oluşturun, QR kodunuzu indirip masalarınıza yerleştirin.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href={ctaHref} className={primaryCta}>
                {ctaLabel}
                <ArrowRight aria-hidden="true" />
              </Link>
              {showDemo && (
                <Link href={"/m/demo" as Route} className={buttonVariants({ variant: "outline", size: "lg", className: "bg-surface" })}>
                  Demo menüyü gör
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
