import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ThresholdFormState {
  warn: string;
  crit: string;
  enabled: boolean;
}

interface ThresholdControlsProps {
  value: ThresholdFormState;
  onChange: (next: ThresholdFormState) => void;
}

export function ThresholdControls({ value, onChange }: ThresholdControlsProps) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-foreground text-sm font-medium">Utilization thresholds</div>
        <p className="text-muted-foreground text-xs">Rule of thumb: keep utilization below 90%.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="th-warn">Warn (ratio)</Label>
          <Input
            id="th-warn"
            type="text"
            inputMode="decimal"
            value={value.warn}
            onChange={(e) => {
              onChange({ ...value, warn: e.target.value });
            }}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="th-crit">Critical (ratio)</Label>
          <Input
            id="th-crit"
            type="text"
            inputMode="decimal"
            value={value.crit}
            onChange={(e) => {
              onChange({ ...value, crit: e.target.value });
            }}
            autoComplete="off"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={value.enabled}
              onCheckedChange={(checked) => {
                onChange({ ...value, enabled: checked === true });
              }}
            />
            Enabled
          </label>
        </div>
      </div>
    </div>
  );
}
