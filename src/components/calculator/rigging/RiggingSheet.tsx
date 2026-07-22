import { useMemo, useState } from "react";

import { ChainBlockIcon } from "@/components/calculator/icons/ChainBlockIcon";
import { QtyStepper } from "@/components/calculator/QtyStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatKg, formatNumber } from "@/lib/format";
import {
  computeSelectionSumKg,
  confirmSelectionsToLog,
  defaultLengthM,
  loadRiggingSheets,
  selectionKey,
  sheetNeedsLength,
  sumRiggingLogKg,
  unitKgForSelection,
  type RiggingLogEntry,
  type RiggingSelection,
} from "@/lib/rigging";

const SHEETS = loadRiggingSheets();

export function RiggingSheet({
  log,
  onLogChange,
  onSend,
  hint,
}: {
  log: RiggingLogEntry[];
  onLogChange: (log: RiggingLogEntry[]) => void;
  onSend: (te: number) => void;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState(() => SHEETS.at(0)?.name ?? "");
  const [selections, setSelections] = useState<Map<string, RiggingSelection>>(() => new Map());

  const sheet = useMemo(() => SHEETS.find((s) => s.name === activeSheet) ?? SHEETS.at(0), [activeSheet]);

  const selectionSumKg = computeSelectionSumKg(sheet ?? null, selections);
  const logSumKg = sumRiggingLogKg(log);

  const togglePick = (key: string, picked: boolean) => {
    setSelections((prev) => {
      const next = new Map(prev);
      if (picked) {
        const parts = key.split("::");
        const sheetName = parts[0] ?? "";
        const target = SHEETS.find((s) => s.name === sheetName) ?? sheet;
        next.set(key, { qty: 1, lengthM: target != null ? defaultLengthM(target) : 3 });
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const updateSelection = (key: string, patch: Partial<RiggingSelection>) => {
    setSelections((prev) => {
      const cur = prev.get(key) ?? { qty: 1, lengthM: 3 };
      const next = new Map(prev);
      next.set(key, { ...cur, ...patch });
      return next;
    });
  };

  const confirm = () => {
    if (sheet == null) return;
    const entries = confirmSelectionsToLog(sheet, selections);
    if (entries.length === 0) return;
    onLogChange([...log, ...entries]);
    setSelections(new Map());
  };

  const send = () => {
    if (logSumKg == null) return;
    onSend(logSumKg / 1000);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          <ChainBlockIcon className="size-4" />
          Rigging
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-4xl">
        <SheetHeader className="border-border border-b">
          <SheetTitle>Rigging weight calculator</SheetTitle>
          <SheetDescription>Pick catalog rows, confirm into the log, then Send to Rigging Weight.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 px-4 py-4">
          {SHEETS.length === 0 ? (
            <p className="text-destructive text-sm">No rigging catalog sheets found.</p>
          ) : (
            <Tabs
              value={activeSheet}
              onValueChange={(name) => {
                setActiveSheet(name);
                setSelections(new Map());
              }}
            >
              <TabsList className="flex h-auto w-full flex-wrap justify-start">
                {SHEETS.map((s) => (
                  <TabsTrigger key={s.name} value={s.name}>
                    {s.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {SHEETS.map((s) => {
                const sheetNeedsLen = sheetNeedsLength(s);
                const cols = s.columns;
                return (
                  <TabsContent key={s.name} value={s.name} className="mt-3 space-y-3">
                    <ScrollArea className="h-[min(40vh,320px)] rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Pick</TableHead>
                            {cols.map((c) => (
                              <TableHead key={c}>{c}</TableHead>
                            ))}
                            <TableHead className="w-28">Qty</TableHead>
                            {sheetNeedsLen ? <TableHead className="w-28">Len (m)</TableHead> : null}
                            <TableHead className="w-24 text-right">Unit kg</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {s.rows.map((row, idx) => {
                            const key = selectionKey(s.name, idx);
                            const sel = selections.get(key);
                            const unitKg = sel != null ? unitKgForSelection(s, row, sel) : null;
                            return (
                              <TableRow
                                key={key}
                                data-state={sel != null ? "selected" : undefined}
                                onDoubleClick={(e) => {
                                  // Qty/Len steppers: rapid + clicks synthesize dblclick and
                                  // would otherwise uncheck the row via this handler.
                                  if (
                                    (e.target as HTMLElement).closest(
                                      'button, input, textarea, select, a, label, [role="checkbox"]',
                                    )
                                  ) {
                                    return;
                                  }
                                  togglePick(key, sel == null);
                                }}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={sel != null}
                                    onCheckedChange={(v) => {
                                      togglePick(key, v === true);
                                    }}
                                    aria-label={`Pick row ${idx + 1}`}
                                  />
                                </TableCell>
                                {cols.map((c) => (
                                  <TableCell key={c} className="tabular-nums">
                                    {row[c] == null ? "—" : String(row[c])}
                                  </TableCell>
                                ))}
                                <TableCell>
                                  {sel != null ? (
                                    <QtyStepper
                                      value={sel.qty}
                                      min={1}
                                      onChange={(n) => {
                                        updateSelection(key, { qty: n });
                                      }}
                                      aria-label="Rigging quantity"
                                    />
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                {sheetNeedsLen ? (
                                  <TableCell>
                                    {sel != null ? (
                                      <QtyStepper
                                        value={sel.lengthM}
                                        min={0}
                                        step={1}
                                        allowDecimal
                                        onChange={(n) => {
                                          updateSelection(key, { lengthM: n });
                                        }}
                                        aria-label="Length meters"
                                      />
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </TableCell>
                                ) : null}
                                <TableCell className="text-right tabular-nums">
                                  {unitKg == null ? "—" : formatKg(unitKg)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </TabsContent>
                );
              })}
            </Tabs>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="tabular-nums">
              {selectionSumKg == null
                ? "Selection: —"
                : `Selection: ${formatKg(selectionSumKg)} kg (${formatNumber(selectionSumKg / 1000, 6)} Te)`}
            </Badge>
            <Button type="button" size="sm" onClick={confirm} disabled={selections.size === 0}>
              Confirm &amp; add to log
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selections.size === 0}
              onClick={() => {
                setSelections(new Map());
              }}
            >
              Clear selection
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={log.length === 0}
              onClick={() => {
                onLogChange([]);
              }}
            >
              Clear log
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Rigging log</div>
              <Badge variant="outline" className="tabular-nums">
                {logSumKg == null ? "Log: —" : `Log: ${formatKg(logSumKg)} kg (${formatNumber(logSumKg / 1000, 6)} Te)`}
              </Badge>
            </div>
            <div className="border-border rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-16 text-right">Qty</TableHead>
                    <TableHead className="w-24 text-right">Unit (kg)</TableHead>
                    <TableHead className="w-28 text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground text-center">
                        No log entries yet. Pick rows and confirm.
                      </TableCell>
                    </TableRow>
                  ) : (
                    [...log].reverse().map((e, i) => (
                      <TableRow key={`${e.ts}-${e.label}-${i}`}>
                        <TableCell className="max-w-[280px] whitespace-normal">{e.label}</TableCell>
                        <TableCell className="text-right tabular-nums">{e.qty}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKg(e.unitKg)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKg(e.subtotalKg)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {logSumKg == null ? "—" : formatKg(logSumKg)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>

          {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
        </div>

        <SheetFooter className="border-border border-t">
          <Button type="button" disabled={logSumKg == null} onClick={send}>
            Send to Rigging Weight
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
