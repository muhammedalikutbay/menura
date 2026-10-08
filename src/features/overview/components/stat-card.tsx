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
    <Card className={cn("gap-1 px-5 sm:px-6", className)}>
      <p className="text-sm font-medium text-fg-muted">{label}</p>
      <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {detail && <p className="text-sm text-fg-muted">{detail}</p>}
    </Card>
  );
}
