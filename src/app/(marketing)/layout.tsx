import { hasDemoMenu } from "@/features/menu/demo";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const showDemo = await hasDemoMenu();
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-surface px-4 py-2 text-sm font-medium shadow-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        İçeriğe geç
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter showDemo={showDemo} />
    </div>
  );
}
