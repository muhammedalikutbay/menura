import { Button } from "@/components/ui/button";

export default function FoundationTestPage() {
  return (
    <div className="container-default py-8 space-y-8">
      <div className="surface p-6 space-y-4">
        <h1 className="heading-primary">Heading Primary</h1>
        <h2 className="heading-secondary">Heading Secondary</h2>
        <p className="text-body">
          This is a body text example. Design token system is being tested.
        </p>
        <p className="text-body-muted">This is muted body text.</p>
        <span className="text-caption">Caption text example</span>
      </div>

      <div className="surface p-6 space-y-4">
        <button className="interactive surface px-4 py-2">
          Interactive Surface Button
        </button>

        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="ghost">Ghost Button</Button>

        <Button variant="primary" disabled>
          Disabled Primary Button
        </Button>
        <Button variant="secondary" disabled>
          Disabled Secondary Button
        </Button>
        <Button variant="ghost" disabled>
          Disabled Ghost Button
        </Button>
      </div>
    </div>
  );
}
