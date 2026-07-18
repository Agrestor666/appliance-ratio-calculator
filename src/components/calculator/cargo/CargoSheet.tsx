import { useMemo, useState } from "react";
import { Package, Trash2 } from "lucide-react";

import { QtyStepper } from "@/components/calculator/QtyStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CARGO_CATEGORIES,
  buildCargoLogEntry,
  calcUnitKg,
  findFillMedia,
  findItem,
  getCargoCategory,
  getClassList,
  getFillMediaItems,
  getNpsList,
  getScheduleList,
  getTypeList,
  parseLengthMeters,
  pipeUnitMass,
  sumCargoLogKg,
  type CargoCategoryId,
  type CargoLogEntry,
} from "@/lib/cargo";
import { formatKg, formatNumber } from "@/lib/format";

function FieldSelect({
  id,
  label,
  value,
  options,
  disabled,
  onValueChange,
  placeholder = "—",
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onValueChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value === "" ? undefined : value}
        disabled={disabled === true || options.length === 0}
        onValueChange={onValueChange}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function pickOrFirst(current: string, options: string[]): string {
  if (options.includes(current)) return current;
  return options[0] ?? "";
}

export function CargoSheet({
  log,
  onLogChange,
  onSend,
  hint,
}: {
  log: CargoLogEntry[];
  onLogChange: (log: CargoLogEntry[]) => void;
  onSend: (payload: { te: number; sentLog: CargoLogEntry[]; sentSumKg: number }) => void;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [catId, setCatId] = useState<CargoCategoryId>("pipe");
  const [typeId, setTypeId] = useState(() => getTypeList("pipe")[0] ?? "");
  const [classId, setClassId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [nps, setNps] = useState("");
  const [lenRaw, setLenRaw] = useState("1");
  const [savedLen, setSavedLen] = useState("1");
  const [fillId, setFillId] = useState("empty");
  const [qty, setQty] = useState(1);

  const cat = getCargoCategory(catId);
  const types = useMemo(() => getTypeList(catId), [catId]);
  const effectiveType = pickOrFirst(typeId, types);

  const classes = useMemo(
    () => (cat.hasClass ? getClassList(catId, effectiveType) : []),
    [cat.hasClass, catId, effectiveType],
  );
  const effectiveClass = cat.hasClass ? pickOrFirst(classId, classes) : "";

  const schedules = useMemo(
    () => getScheduleList(catId, effectiveType, effectiveClass),
    [catId, effectiveType, effectiveClass],
  );
  const effectiveSchedule =
    schedules.length === 0
      ? ""
      : schedules.includes(scheduleId)
        ? scheduleId
        : schedules.includes("STD")
          ? "STD"
          : (schedules[0] ?? "");

  const npsItems = useMemo(
    () => getNpsList(catId, effectiveType, effectiveClass, effectiveSchedule),
    [catId, effectiveType, effectiveClass, effectiveSchedule],
  );
  const npsOptions = npsItems.map((i) => i.nps);
  const effectiveNps = pickOrFirst(nps, npsOptions);

  const fillItems = useMemo(() => getFillMediaItems(), []);

  const lenM = cat.hasLength ? parseLengthMeters(lenRaw) : 1;
  const item = findItem(catId, effectiveType, effectiveClass, effectiveNps, effectiveSchedule);
  const unitKg = calcUnitKg(item, catId, lenM, fillId);
  const fill = findFillMedia(fillId);

  let preview = "—";
  if (!(cat.hasLength && !(lenM > 0)) && unitKg != null && Number.isFinite(unitKg) && item) {
    if (cat.hasLength) {
      const density = fill?.densityKgPerM3 ?? 0;
      const mass = pipeUnitMass(item, lenM, density);
      let text = `${formatKg(item.wt)} kg/m × ${lenM} m`;
      if (density > 0) {
        text += !mass.geometryOk
          ? ` = ${formatKg(mass.unitKg)} kg/pc (fill geometry unavailable)`
          : ` + ${fill?.label ?? fillId} = ${formatKg(mass.unitKg)} kg/pc`;
      } else {
        text += ` = ${formatKg(mass.unitKg)} kg/pc`;
      }
      preview = text;
    } else {
      preview = `${formatKg(unitKg)} kg/pc`;
    }
  }

  const totalKg = sumCargoLogKg(log);
  const canAdd = Boolean(item) && qty >= 1 && (!cat.hasLength || lenM > 0) && unitKg != null && Number.isFinite(unitKg);

  const applyCategory = (next: CargoCategoryId) => {
    const nextCat = CARGO_CATEGORIES.find((c) => c.id === next);
    if (cat.hasLength && !nextCat?.hasLength) {
      setSavedLen(lenRaw === "—" ? savedLen : lenRaw);
    }
    setCatId(next);
    const nextTypes = getTypeList(next);
    const nextType = nextTypes[0] ?? "";
    setTypeId(nextType);
    const nextClasses = nextCat?.hasClass ? getClassList(next, nextType) : [];
    const nextClass = nextClasses[0] ?? "";
    setClassId(nextClass);
    const nextSchedules = getScheduleList(next, nextType, nextClass);
    const nextSch = nextSchedules.includes("STD") ? "STD" : (nextSchedules[0] ?? "");
    setScheduleId(nextSch);
    const nextNps = getNpsList(next, nextType, nextClass, nextSch)[0]?.nps ?? "";
    setNps(nextNps);
    if (nextCat?.hasLength) {
      setLenRaw(savedLen === "" ? "1" : savedLen);
    } else {
      setLenRaw("—");
    }
  };

  const addItem = () => {
    const entry = buildCargoLogEntry({
      catId,
      typeId: effectiveType,
      classId: effectiveClass,
      scheduleId: effectiveSchedule,
      nps: effectiveNps,
      lenM,
      fillId,
      qty,
      classEnabled: cat.hasClass,
      lengthEnabled: cat.hasLength,
    });
    if (!entry) return;
    onLogChange([...log, entry]);
  };

  const send = () => {
    if (totalKg == null) return;
    onSend({
      te: totalKg / 1000,
      sentLog: log.map((e) => ({ ...e })),
      sentSumKg: totalKg,
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          <Package className="size-4" aria-hidden />
          Cargo
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="border-border border-b">
          <SheetTitle>Cargo weight calculator</SheetTitle>
          <SheetDescription>
            Build a fill-aware component list, then Send to Cargo Weight. Manual Te edits on the main form stay allowed
            after Send.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldSelect
              id="cargo-cat"
              label="Category"
              value={catId}
              options={CARGO_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
              onValueChange={(v) => {
                applyCategory(v as CargoCategoryId);
              }}
            />

            <FieldSelect
              id="cargo-type"
              label={catId === "pipe" ? "Schedule" : "Type"}
              value={effectiveType}
              options={types.map((t) => ({ value: t, label: t }))}
              onValueChange={(v) => {
                setTypeId(v);
                const nextClasses = cat.hasClass ? getClassList(catId, v) : [];
                const nextClass = nextClasses[0] ?? "";
                setClassId(nextClass);
                const nextSchedules = getScheduleList(catId, v, nextClass);
                const nextSch = nextSchedules.includes("STD") ? "STD" : (nextSchedules[0] ?? "");
                setScheduleId(nextSch);
                setNps(getNpsList(catId, v, nextClass, nextSch)[0]?.nps ?? "");
              }}
            />

            <FieldSelect
              id="cargo-class"
              label={catId === "fitting" ? "Schedule" : "Class / Rating"}
              value={effectiveClass}
              options={classes.map((c) => ({ value: c, label: c }))}
              disabled={!cat.hasClass}
              onValueChange={(v) => {
                setClassId(v);
                const nextSchedules = getScheduleList(catId, effectiveType, v);
                const nextSch = nextSchedules.includes("STD") ? "STD" : (nextSchedules[0] ?? "");
                setScheduleId(nextSch);
                setNps(getNpsList(catId, effectiveType, v, nextSch)[0]?.nps ?? "");
              }}
            />

            <FieldSelect
              id="cargo-sch"
              label="Flange schedule"
              value={effectiveSchedule}
              options={schedules.map((s) => ({ value: s, label: s }))}
              disabled={schedules.length === 0}
              onValueChange={(v) => {
                setScheduleId(v);
                setNps(getNpsList(catId, effectiveType, effectiveClass, v)[0]?.nps ?? "");
              }}
            />

            <FieldSelect
              id="cargo-nps"
              label="NPS"
              value={effectiveNps}
              options={npsOptions.map((n) => ({ value: n, label: n }))}
              onValueChange={setNps}
            />

            <div className="space-y-1.5">
              <Label htmlFor="cargo-len">Length (m)</Label>
              <Input
                id="cargo-len"
                type="text"
                inputMode="decimal"
                disabled={!cat.hasLength}
                value={cat.hasLength ? lenRaw : "—"}
                onChange={(e) => {
                  setLenRaw(e.target.value);
                }}
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cargo-fill">Fill media</Label>
              <Select value={fillId} disabled={catId !== "pipe"} onValueChange={setFillId}>
                <SelectTrigger id="cargo-fill" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fillItems.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <QtyStepper value={qty} onChange={setQty} min={1} aria-label="Cargo quantity" />
            </div>
          </div>

          <div className="border-border bg-muted/30 rounded-md border px-3 py-2 text-sm">
            <span className="text-muted-foreground">Preview: </span>
            <span className="font-medium tabular-nums">{preview}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={!canAdd} onClick={addItem}>
              Add to list
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
              Clear list
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Cargo list</div>
              <Badge variant="outline" className="tabular-nums">
                {totalKg == null
                  ? "Total: —"
                  : `Total: ${formatKg(totalKg)} kg (${formatNumber(totalKg / 1000, 4)} Te)`}
              </Badge>
            </div>
            <div className="border-border rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="w-20 text-right">Unit</TableHead>
                    <TableHead className="w-14 text-right">Qty</TableHead>
                    <TableHead className="w-20 text-right">Total</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground text-center">
                        No items yet. Select a component and click Add.
                      </TableCell>
                    </TableRow>
                  ) : (
                    log.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="max-w-[220px] whitespace-normal">{entry.label}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKg(entry.unitKg)}</TableCell>
                        <TableCell className="text-right tabular-nums">{entry.qty}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKg(entry.totalKg)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label="Remove item"
                            onClick={() => {
                              onLogChange(log.filter((e) => e.id !== entry.id));
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
        </div>

        <SheetFooter className="border-border border-t">
          <Button type="button" disabled={totalKg == null} onClick={send}>
            Send to Cargo Weight
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
