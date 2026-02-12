export default function FoundationTestPage() {
  return (
    <div className="container-default py-8 space-y-8">

      <div className="surface p-6 space-y-4">
        <h1 className="heading-primary">Heading Primary</h1>
        <h2 className="heading-secondary">Heading Secondary</h2>
        <p className="text-body">
          Bu bir body metin örneğidir. Design token sistemi test ediliyor.
        </p>
        <p className="text-body-muted">
          Bu muted body metindir.
        </p>
        <span className="text-caption">Caption text örneği</span>
      </div>

      <div className="surface p-6 space-y-4">
        <button className="interactive surface px-4 py-2">
          Interactive Surface Button
        </button>

        <button className="interactive px-4 py-2 border rounded-md">
          Default Button
        </button>
      </div>

    </div>
  );
}
