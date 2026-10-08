import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, children = "Ürünler" }: { href: string; children?: React.ReactNode }) {
  return (
    <Link
      href={href as Route}
      className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-accent-text hover:underline"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      {children}
    </Link>
  );
}
