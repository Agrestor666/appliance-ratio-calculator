import { Badge } from "@/components/ui/badge";
import type { AlertItem, AlertSeverity } from "@/lib/appliance-ratio";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<AlertItem["level"], string> = {
  warn: "WARN",
  crit: "CRITICAL",
  input: "INPUT",
};

interface VisualAlertsProps {
  severity: AlertSeverity;
  items: AlertItem[];
}

export function VisualAlerts({ severity, items }: VisualAlertsProps) {
  if (items.length === 0) {
    return (
      <div className="border-border bg-muted/20 text-muted-foreground rounded-md border border-dashed px-3 py-3 text-sm">
        No threshold alerts. Utilization is within configured limits.
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-md border px-3 py-3 text-sm",
        severity === "warn" && "animate-pulse border-amber-500/50 bg-amber-500/10",
        severity === "crit" && "border-destructive/60 bg-destructive/10",
        severity === "input" && "border-border bg-muted/40",
      )}
    >
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={`${item.level}-${item.text}`} className="flex flex-wrap items-start gap-2">
            <Badge
              variant={item.level === "crit" ? "destructive" : "outline"}
              className={cn(
                item.level === "warn" && "border-amber-600/40 bg-amber-500/15 text-amber-950",
                item.level === "input" && "border-border bg-secondary text-secondary-foreground",
              )}
            >
              {LEVEL_LABEL[item.level]}
            </Badge>
            <span className="text-foreground min-w-0 flex-1 leading-snug">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
