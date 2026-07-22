import { useRef, useState } from "react";
import { Scale } from "lucide-react";

import { CargoSheet } from "@/components/calculator/cargo/CargoSheet";
import { LiftDiagram } from "@/components/calculator/LiftDiagram";
import { RiggingSheet } from "@/components/calculator/rigging/RiggingSheet";
import { TechnicalReportView } from "@/components/calculator/report/TechnicalReportView";
import { ThresholdControls, type ThresholdFormState } from "@/components/calculator/ThresholdControls";
import { UtilizationChart, type UtilizationChartHandle } from "@/components/calculator/UtilizationChart";
import { VisualAlerts } from "@/components/calculator/VisualAlerts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { CargoLogEntry } from "@/lib/cargo";
import { formatKg, formatNumber } from "@/lib/format";
import type { RiggingLogEntry } from "@/lib/rigging";
import { buildReportPayload, type ReportPayloadOk } from "@/lib/report";
import {
  chartPercentsFromUtilization,
  computeFromFormStrings,
  defaultsAsFormStrings,
  defaultsAsThresholdFormStrings,
  evaluateAlerts,
  formatPercent,
  formatTe,
  parseThresholdForm,
} from "@/lib/appliance-ratio";
import { cn } from "@/lib/utils";

type FormFields = ReturnType<typeof defaultsAsFormStrings>;
type FieldKey = keyof FormFields;

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</div>
      <div className="text-foreground text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          className={cn(suffix && "pr-10")}
          autoComplete="off"
        />
        {suffix ? (
          <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function CalculatorShell() {
  const [fields, setFields] = useState<FormFields>(defaultsAsFormStrings);
  const [thresholdForm, setThresholdForm] = useState<ThresholdFormState>(defaultsAsThresholdFormStrings);
  const [notificationNumber, setNotificationNumber] = useState("Input");
  const [cargoLog, setCargoLog] = useState<CargoLogEntry[]>([]);
  const [cargoSentLog, setCargoSentLog] = useState<CargoLogEntry[]>([]);
  const [cargoSentSumKg, setCargoSentSumKg] = useState<number | null>(null);
  const [riggingLog, setRiggingLog] = useState<RiggingLogEntry[]>([]);
  const [reportPayload, setReportPayload] = useState<ReportPayloadOk | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const chartRef = useRef<UtilizationChartHandle>(null);

  const result = computeFromFormStrings(fields);
  const thresholdParse = parseThresholdForm(thresholdForm);
  const { severity, items: alertItems } = thresholdParse.ok
    ? evaluateAlerts(result, thresholdParse.thresholds)
    : { severity: "input" as const, items: [{ level: "input" as const, text: thresholdParse.error }] };
  const thresholds = thresholdParse.ok ? thresholdParse.thresholds : null;
  const { usedPercent, remainingPercent, overCapacity } = chartPercentsFromUtilization(
    result.ok ? result.utilization : null,
  );

  const setField = (key: FieldKey, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setFields(defaultsAsFormStrings());
    setThresholdForm(defaultsAsThresholdFormStrings());
    setNotificationNumber("Input");
    setCargoLog([]);
    setCargoSentLog([]);
    setCargoSentSumKg(null);
    setRiggingLog([]);
    setReportPayload(null);
    setReportError(null);
  };

  const openReport = () => {
    if (!thresholdParse.ok) {
      setReportError(thresholdParse.error);
      return;
    }

    const chartPng = chartRef.current?.toPngDataUrl() ?? null;
    const payload = buildReportPayload({
      fields,
      thresholds: thresholdParse.thresholds,
      alertSeverity: severity,
      notificationNumber,
      cargoSentLog,
      cargoSentSumKg,
      riggingLog,
      chartPng,
    });

    if (!payload.ok) {
      setReportError(payload.error);
      return;
    }

    setReportError(null);
    setReportPayload(payload);
  };

  const utilizationDisplay = result.ok ? formatPercent(result.utilization) : "—";
  const totalWeightDisplay = result.ok ? `${formatTe(result.totalWeightTe)} Te` : "—";
  const remainingDisplay = result.ok ? formatPercent(result.remaining) : "—";

  const cargoHint =
    cargoLog.length > 0
      ? `${cargoLog.length} item(s) · ${formatKg(cargoLog.reduce((s, e) => s + e.totalKg, 0))} kg total`
      : cargoSentSumKg != null
        ? `Last send: ${formatNumber(cargoSentSumKg / 1000, 6)} Te (${cargoSentLog.length} items)`
        : undefined;

  const riggingSumKg = riggingLog.reduce((s, e) => s + e.subtotalKg, 0);
  const riggingHint = riggingLog.length > 0 ? `Rigging log sum: ${formatNumber(riggingSumKg / 1000, 6)} Te` : undefined;

  if (reportPayload) {
    return (
      <TechnicalReportView
        payload={reportPayload}
        onClose={() => {
          setReportPayload(null);
        }}
      />
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border bg-card/80 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="border-border bg-secondary flex size-9 items-center justify-center rounded-md border">
              <Scale className="text-foreground size-4" aria-hidden />
            </div>
            <div>
              <p className="text-foreground text-base font-semibold tracking-tight sm:text-lg">
                Appliance Ratio Calculator
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm">Lifting planner · cargo, rigging, utilization</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/help">Help</a>
            </Button>
            <Badge variant="outline">Workspace</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-2 lg:gap-6">
        <section aria-labelledby="results-heading" className="order-1 lg:order-2">
          <Card className="sticky top-4 gap-4 py-5 lg:static">
            <CardHeader className="border-border border-b pb-4">
              <CardTitle id="results-heading">Live results</CardTitle>
              <CardDescription>Utilization and metrics update as you edit inputs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div
                className={cn(
                  "rounded-lg border px-4 py-5",
                  severity === "crit" && "border-destructive/50 bg-destructive/5",
                  severity === "warn" && "border-amber-500/40 bg-amber-500/5",
                  severity !== "crit" && severity !== "warn" && "border-border bg-muted/30",
                )}
              >
                <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Utilization</div>
                <div className="text-foreground mt-2 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {utilizationDisplay}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  {result.ok
                    ? thresholds == null
                      ? thresholdParse.error
                      : thresholds.enabled
                        ? `Warn ${formatPercent(thresholds.warn)} · Crit ${formatPercent(thresholds.crit)}`
                        : "Threshold alerts disabled"
                    : result.error}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Metric label="Total weight" value={totalWeightDisplay} />
                <Metric label="Appliance ratio" value={utilizationDisplay} />
                <Metric label="Used" value={utilizationDisplay} />
                <Metric label="Remaining" value={remainingDisplay} />
              </div>

              <Separator />

              <ThresholdControls value={thresholdForm} onChange={setThresholdForm} />

              <Separator />

              <div className="space-y-2">
                <div className="text-foreground text-sm font-medium">Visual alerts</div>
                <VisualAlerts severity={severity} items={alertItems} />
              </div>

              <div className="space-y-2">
                <div className="text-foreground text-sm font-medium">Capacity chart</div>
                <div className="border-border bg-card rounded-md border px-3 py-4">
                  <UtilizationChart
                    ref={chartRef}
                    usedPercent={usedPercent}
                    remainingPercent={remainingPercent}
                    severity={severity}
                  />
                </div>
                {overCapacity ? (
                  <p className="text-destructive text-xs font-medium">
                    Over capacity — utilization exceeds 100% (chart Used shows actual %).
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Button type="button" variant="outline" className="w-full" disabled={!result.ok} onClick={openReport}>
                  Generate technical report
                </Button>
                {reportError ? <p className="text-destructive text-xs">{reportError}</p> : null}
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="inputs-heading" className="order-2 flex flex-col gap-4 lg:order-1">
          <Card className="gap-4 py-5">
            <CardHeader className="border-border border-b pb-4">
              <CardTitle id="inputs-heading">Inputs</CardTitle>
              <CardDescription>Cargo, rigging, and lift factors for Appliance Ratio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="notification-number">Notification number</Label>
                <Input
                  id="notification-number"
                  type="text"
                  value={notificationNumber}
                  onChange={(e) => {
                    setNotificationNumber(e.target.value);
                  }}
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <CargoSheet
                  log={cargoLog}
                  onLogChange={setCargoLog}
                  hint={cargoHint}
                  onSend={({ te, sentLog, sentSumKg }) => {
                    setCargoSentLog(sentLog);
                    setCargoSentSumKg(sentSumKg);
                    setField("cargoTe", formatNumber(te, 6));
                  }}
                />
                <RiggingSheet
                  log={riggingLog}
                  onLogChange={setRiggingLog}
                  hint={riggingHint}
                  onSend={(te) => {
                    setField("riggingTe", formatNumber(te, 6));
                  }}
                />
              </div>

              {cargoHint != null || riggingHint != null ? (
                <div className="text-muted-foreground space-y-1 text-xs">
                  {cargoHint != null ? <p>{cargoHint}</p> : null}
                  {riggingHint != null ? <p>{riggingHint}</p> : null}
                </div>
              ) : null}

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="cargo-weight"
                  label="Cargo weight"
                  value={fields.cargoTe}
                  onChange={(v) => {
                    setField("cargoTe", v);
                  }}
                  suffix="Te"
                />
                <NumberField
                  id="rigging-weight"
                  label="Rigging weight"
                  value={fields.riggingTe}
                  onChange={(v) => {
                    setField("riggingTe", v);
                  }}
                  suffix="Te"
                />
                <NumberField
                  id="contingency"
                  label="Contingency"
                  value={fields.contingency}
                  onChange={(v) => {
                    setField("contingency", v);
                  }}
                />
                <NumberField
                  id="daf"
                  label="DAF"
                  value={fields.daf}
                  onChange={(v) => {
                    setField("daf", v);
                  }}
                />
                <NumberField
                  id="wll"
                  label="WLL"
                  value={fields.wll}
                  onChange={(v) => {
                    setField("wll", v);
                  }}
                  suffix="Te"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={reset}>
                  Reset to defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex min-h-0 flex-1 flex-col gap-3 py-4">
            <CardHeader className="shrink-0 pb-0">
              <CardTitle className="text-sm font-medium">Lift overview</CardTitle>
              <CardDescription>Cargo vs rigging on a typical pipe lift.</CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              <div className="border-border bg-muted/20 flex min-h-[220px] flex-1 items-center justify-center rounded-md border px-3 py-3 lg:min-h-0">
                <LiftDiagram className="h-full w-full" />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
