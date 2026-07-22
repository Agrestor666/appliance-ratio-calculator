import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  step = 1,
  disabled = false,
  allowDecimal = false,
  className,
  "aria-label": ariaLabel = "Quantity",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
  disabled?: boolean;
  allowDecimal?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const clamp = (n: number) => {
    if (!Number.isFinite(n)) return min;
    return Math.max(min, allowDecimal ? n : Math.floor(n));
  };

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onDoubleClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8 shrink-0"
        disabled={disabled || value <= min}
        onClick={() => {
          onChange(clamp(value - step));
        }}
        aria-label={`Decrease ${ariaLabel}`}
      >
        <Minus className="size-3.5" />
      </Button>
      <Input
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        disabled={disabled}
        aria-label={ariaLabel}
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value.trim().replace(",", ".");
          const n = Number(raw);
          if (raw === "" || !Number.isFinite(n)) return;
          onChange(clamp(n));
        }}
        className="h-8 w-14 px-1 text-center tabular-nums"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8 shrink-0"
        disabled={disabled}
        onClick={() => {
          onChange(clamp(value + step));
        }}
        aria-label={`Increase ${ariaLabel}`}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
