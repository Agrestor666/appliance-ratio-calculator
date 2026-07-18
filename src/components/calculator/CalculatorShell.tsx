import { Package, Scale, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function PlaceholderField({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="space-y-1.5">
      <div className="text-foreground text-sm font-medium">{label}</div>
      <div
        className={cn(
          "border-border bg-muted/40 flex h-9 items-center rounded-md border border-dashed px-3",
          "text-muted-foreground text-sm",
        )}
      >
        {hint}
      </div>
    </div>
  );
}

function MetricPlaceholder({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</div>
      <div className="text-foreground text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function CalculatorShell() {
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
          <Badge variant="outline">Workspace</Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-2 lg:gap-6">
        {/* Mobile: results first so utilization is never buried */}
        <section aria-labelledby="results-heading" className="order-1 lg:order-2">
          <Card className="sticky top-4 gap-4 py-5 lg:static">
            <CardHeader className="border-border border-b pb-4">
              <CardTitle id="results-heading">Live results</CardTitle>
              <CardDescription>Utilization and metrics update as you edit inputs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="border-border bg-muted/30 rounded-lg border px-4 py-5">
                <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Utilization</div>
                <div className="text-foreground mt-2 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  —
                </div>
                <p className="text-muted-foreground mt-2 text-sm">Hero metric · Phase 2 wires live compute</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <MetricPlaceholder label="Total weight" value="—" />
                <MetricPlaceholder label="Appliance ratio" value="—" />
                <MetricPlaceholder label="Used" value="—" />
                <MetricPlaceholder label="Remaining" value="—" />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-foreground text-sm font-medium">Visual alerts</div>
                <div className="border-border bg-muted/20 text-muted-foreground rounded-md border border-dashed px-3 py-3 text-sm">
                  Threshold alerts appear here in a later phase.
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-foreground text-sm font-medium">Chart</div>
                <div className="border-border bg-muted/20 text-muted-foreground flex h-40 items-center justify-center rounded-md border border-dashed text-sm">
                  Utilization chart placeholder
                </div>
              </div>

              <Button variant="outline" className="w-full" disabled>
                Generate technical report
              </Button>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="inputs-heading" className="order-2 space-y-4 lg:order-1">
          <Card className="gap-4 py-5">
            <CardHeader className="border-border border-b pb-4">
              <CardTitle id="inputs-heading">Inputs</CardTitle>
              <CardDescription>Cargo, rigging, and lift factors for Appliance Ratio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" disabled>
                  <Package className="size-4" aria-hidden />
                  Cargo
                </Button>
                <Button type="button" variant="secondary" size="sm" disabled>
                  <Wrench className="size-4" aria-hidden />
                  Rigging
                </Button>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <PlaceholderField label="Cargo weight" hint="Te · placeholder" />
                <PlaceholderField label="Rigging weight" hint="Te · placeholder" />
                <PlaceholderField label="Contingency" hint="factor · placeholder" />
                <PlaceholderField label="DAF" hint="factor · placeholder" />
                <PlaceholderField label="WLL" hint="Te · placeholder" />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" disabled>
                  Reset to defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
