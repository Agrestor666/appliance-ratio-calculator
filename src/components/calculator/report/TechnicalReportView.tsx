import { formatPercent } from "@/lib/appliance-ratio";
import { formatNumber } from "@/lib/format";
import type { ReportPayloadOk, ReportSeverity } from "@/lib/report";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SEV_CLASS: Record<ReportSeverity, string> = {
  OK: "text-emerald-700",
  WARN: "text-amber-700",
  CRITICAL: "text-destructive",
};

function formatGeneratedAt(iso: string): string {
  return iso.replace("T", " ").replace("Z", " UTC");
}

interface TechnicalReportViewProps {
  payload: ReportPayloadOk;
  onClose: () => void;
}

export function TechnicalReportView({ payload, onClose }: TechnicalReportViewProps) {
  const rigLog = payload.riggingLog;
  const rigTotalKg = rigLog.reduce((a, e) => a + (Number.isFinite(e.subtotalKg) ? e.subtotalKg : 0), 0);
  const rigTotalTe = rigTotalKg / 1000;

  const crgLog = payload.cargoLog;
  const crgTotalKg = payload.cargoSumKg;

  return (
    <div className="bg-background min-h-screen">
      <div className="technical-report-actions border-border bg-card/90 sticky top-0 z-10 border-b backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-[980px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-foreground text-sm font-medium">Technical report</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Back to calculator
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                window.print();
              }}
            >
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>

      <article className="technical-report text-foreground mx-auto max-w-[980px] px-4 py-7 sm:px-6 sm:pb-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-foreground text-[22px] font-semibold tracking-wide">Technical Report</h1>
            <p className="text-muted-foreground mt-1.5 text-[13px] leading-snug">
              Notification Number: <span className="font-mono">{payload.meta.notificationNumber}</span>
              <br />
              Generated: <span className="font-mono">{formatGeneratedAt(payload.meta.generatedAt)}</span>
            </p>
          </div>
          <div className="border-border text-muted-foreground inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs">
            Status: <span className={cn("font-extrabold", SEV_CLASS[payload.severity])}>{payload.severity}</span>
          </div>
        </header>

        <hr className="border-border my-4" />

        <div className="grid gap-3.5 md:grid-cols-2">
          <section className="border-border rounded-xl border p-3.5">
            <h2 className="mb-2.5 text-sm font-semibold tracking-wide">Inputs</h2>
            <table className="w-full text-[13px]">
              <tbody>
                <Row label="Rigging Weight" value={`${formatNumber(payload.inputs.riggingWeightTe, 6)} Te`} />
                <Row label="Cargo Weight" value={`${formatNumber(payload.inputs.cargoWeightTe, 6)} Te`} />
                <Row label="Weight Contingencies" value={formatNumber(payload.inputs.contingencyFactor, 6)} />
                <Row label="DAF" value={formatNumber(payload.inputs.dafFactor, 6)} />
                <Row label="Appliance WLL at Radius" value={`${formatNumber(payload.inputs.wllTe, 6)} Te`} />
              </tbody>
            </table>
          </section>

          <section className="border-border rounded-xl border p-3.5">
            <h2 className="mb-2.5 text-sm font-semibold tracking-wide">Thresholds</h2>
            <table className="w-full text-[13px]">
              <tbody>
                <Row label="Enabled" value={payload.thresholds.enabled ? "Yes" : "No"} />
                <Row label="Warn" value={formatPercent(payload.thresholds.warnRatio)} />
                <Row label="Critical" value={formatPercent(payload.thresholds.critRatio)} />
              </tbody>
            </table>
          </section>

          <section className="border-border rounded-xl border p-3.5 md:col-span-2">
            <h2 className="mb-2.5 text-sm font-semibold tracking-wide">Results</h2>
            <table className="w-full text-[13px]">
              <tbody>
                <Row label="Total Weight" value={`${formatNumber(payload.outputs.totalWeightTe, 6)} Te`} />
                <Row label="Utilization Ratio" value={formatPercent(payload.outputs.utilizationRatio)} />
                <Row label="Used Capacity" value={formatPercent(payload.outputs.usedCapacityRatio)} />
                <Row label="Remaining Capacity" value={formatPercent(payload.outputs.remainingCapacityRatio)} />
              </tbody>
            </table>
          </section>
        </div>

        <section className="border-border mt-3.5 rounded-xl border p-3.5">
          <h2 className="mb-1 text-sm font-semibold tracking-wide">Rigging calculator log</h2>
          <p className="text-muted-foreground text-[13px]">
            Total: <span className="font-mono">{formatNumber(rigTotalKg, 3)} kg</span> ({formatNumber(rigTotalTe, 6)}{" "}
            Te)
          </p>
          <table className="mt-2 w-full text-[13px]">
            <thead>
              <tr className="text-muted-foreground border-border border-b text-left font-bold">
                <th className="px-2.5 py-2">Item</th>
                <th className="px-2.5 py-2 text-right">Qty</th>
                <th className="px-2.5 py-2 text-right">Unit (kg)</th>
                <th className="px-2.5 py-2 text-right">Subtotal (kg)</th>
              </tr>
            </thead>
            <tbody>
              {rigLog.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted-foreground px-2.5 py-2">
                    No rigging log entries.
                  </td>
                </tr>
              ) : (
                [...rigLog].reverse().map((e, i) => (
                  <tr key={`${e.ts}-${i}`} className="border-border border-b">
                    <td className="px-2.5 py-2 align-top font-mono">{e.label}</td>
                    <td className="px-2.5 py-2 text-right align-top font-mono">{e.qty}</td>
                    <td className="px-2.5 py-2 text-right align-top font-mono">{formatNumber(e.unitKg, 3)}</td>
                    <td className="px-2.5 py-2 text-right align-top font-mono">{formatNumber(e.subtotalKg, 3)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="border-border mt-3.5 rounded-xl border p-3.5">
          <h2 className="mb-1 text-sm font-semibold tracking-wide">Cargo calculator log</h2>
          <p className={cn("text-[13px]", payload.cargoTeMismatch ? "text-amber-800" : "text-muted-foreground")}>
            {payload.cargoSubtitle}
          </p>
          <table className="mt-2 w-full text-[13px]">
            <thead>
              <tr className="text-muted-foreground border-border border-b text-left font-bold">
                <th className="px-2.5 py-2">Component</th>
                <th className="px-2.5 py-2 text-right">Qty</th>
                <th className="px-2.5 py-2 text-right">Unit (kg)</th>
                <th className="px-2.5 py-2 text-right">Total (kg)</th>
              </tr>
            </thead>
            <tbody>
              {crgLog.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted-foreground px-2.5 py-2">
                    Cargo weight was not sent from the Cargo calculator (entered manually).
                  </td>
                </tr>
              ) : (
                crgLog.map((e) => (
                  <tr key={e.id} className="border-border border-b">
                    <td className="px-2.5 py-2 align-top font-mono">{e.label}</td>
                    <td className="px-2.5 py-2 text-right align-top font-mono">{e.qty}</td>
                    <td className="px-2.5 py-2 text-right align-top font-mono">{formatNumber(e.unitKg, 3)}</td>
                    <td className="px-2.5 py-2 text-right align-top font-mono">{formatNumber(e.totalKg, 3)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {crgLog.length > 0 ? (
            <p className="text-muted-foreground mt-2 text-xs">
              Log sum: <span className="font-mono">{formatNumber(crgTotalKg, 3)} kg</span>
            </p>
          ) : null}
        </section>

        <section className="border-border mt-3.5 rounded-xl border p-3.5">
          <h2 className="mb-2.5 text-sm font-semibold tracking-wide">Calculations</h2>
          <table className="w-full text-[13px]">
            <tbody>
              <tr className="border-border border-b">
                <th className="text-muted-foreground w-1/2 px-2.5 py-2 text-left align-top font-bold">Total Weight</th>
                <td className="px-2.5 py-2 text-right font-mono">
                  ({formatNumber(payload.inputs.cargoWeightTe, 6)} + {formatNumber(payload.inputs.riggingWeightTe, 6)})
                  × {formatNumber(payload.inputs.contingencyFactor, 6)} × {formatNumber(payload.inputs.dafFactor, 6)} ={" "}
                  {formatNumber(payload.outputs.totalWeightTe, 6)} Te
                </td>
              </tr>
              <tr>
                <th className="text-muted-foreground w-1/2 px-2.5 py-2 text-left align-top font-bold">Utilization</th>
                <td className="px-2.5 py-2 text-right font-mono">
                  {formatNumber(payload.outputs.totalWeightTe, 6)} ÷ {formatNumber(payload.inputs.wllTe, 6)} ={" "}
                  {formatPercent(payload.outputs.utilizationRatio)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="border-border mt-3.5 rounded-xl border p-2.5">
          <h2 className="mb-2.5 text-sm font-semibold tracking-wide">Chart</h2>
          <div className="mb-2 flex flex-wrap gap-2.5">
            <LegendItem
              color="oklch(0.55 0.09 195)"
              label="Used"
              value={formatPercent(payload.outputs.usedCapacityRatio)}
            />
            <LegendItem
              color="oklch(0.85 0.02 195)"
              label="Remaining"
              value={formatPercent(payload.outputs.remainingCapacityRatio)}
            />
          </div>
          {payload.chartPng ? (
            // Chart snapshot is a same-origin canvas data URL captured at report open.
            <img alt="Used vs Remaining chart" src={payload.chartPng} className="block h-auto max-w-full" />
          ) : (
            <p className="text-muted-foreground text-[13px]">Chart unavailable.</p>
          )}
        </section>
      </article>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-border border-b">
      <th className="text-muted-foreground w-[52%] px-2.5 py-2 text-left align-top font-bold">{label}</th>
      <td className="px-2.5 py-2 text-right align-top font-mono">{value}</td>
    </tr>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="border-border text-muted-foreground inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs">
      <span className="inline-block size-2.5 rounded-sm" style={{ background: color }} aria-hidden />
      {label}: <span className="font-mono">{value}</span>
    </div>
  );
}
