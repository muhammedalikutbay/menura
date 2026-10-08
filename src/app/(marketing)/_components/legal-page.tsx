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
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div role="note" className="mb-8 flex gap-3 rounded-lg bg-warning-soft p-4 text-warning">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <p className="text-sm font-medium">
          Bu metin şablondur; yayına almadan önce hukuki danışmanınıza kontrol ettirin.
        </p>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
      <p className="mt-4 text-lg text-fg-muted">{intro}</p>

      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section, index) => (
          <section key={section.title} aria-labelledby={`legal-${index}`} className="flex flex-col gap-3">
            <h2 id={`legal-${index}`} className="text-xl font-semibold tracking-tight">
              {index + 1}. {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-base text-fg-muted">
                {paragraph}
              </p>
            ))}
            {section.items && (
              <ul className="list-disc space-y-1.5 pl-6 text-base text-fg-muted marker:text-fg-muted">
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
