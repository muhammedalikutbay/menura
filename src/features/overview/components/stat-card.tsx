import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string;
  /** Secondary line, e.g. "5 aktif". */
  detail?: string;
  className?: string;
};

export function StatCard({ label, value, detail, className }: StatCardProps) {
  return (
    <Card className={cn("gap-1.5 px-5 sm:px-6", className)}>
      <p className="type-caption text-fg-muted">{label}</p>
      <p className="tabular text-[32px] leading-tight font-semibold tracking-[-0.03em] sm:text-4xl">{value}</p>
      {detail && <p className="type-caption text-fg-muted">{detail}</p>}
    </Card>
  );
}
