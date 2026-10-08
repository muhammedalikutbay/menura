import { TriangleAlert } from "lucide-react";

export type LegalSection = {
  title: string;
  /** Paragraphs. */
  body: string[];
  /** Optional bullet list shown after the paragraphs. */
  items?: string[];
};

/** Shared layout of the legal template pages (KVKK notice, terms of use). */
export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <article className="mx-auto w-full max-w-[640px] px-4 py-14 sm:px-6 sm:py-20">
      <div role="note" className="mb-10 flex gap-3 rounded-lg bg-warning-soft p-4 text-warning-text">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <p className="type-body font-medium">
          Bu metin şablondur; yayına almadan önce hukuki danışmanınıza kontrol ettirin.
        </p>
      </div>

      <h1 className="type-display text-balance">{title}</h1>
      <p className="type-body-lg mt-5 text-pretty text-fg-muted">{intro}</p>

      <div className="mt-12 flex flex-col gap-10">
        {sections.map((section, index) => (
          <section key={section.title} aria-labelledby={`legal-${index}`} className="flex flex-col gap-3 border-t border-border pt-8">
            <h2 id={`legal-${index}`} className="type-title">
              {index + 1}. {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="type-body-lg text-pretty text-fg-muted">
                {paragraph}
              </p>
            ))}
            {section.items && (
              <ul className="type-body-lg list-disc space-y-2 pl-6 text-fg-muted marker:text-fg-subtle">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
