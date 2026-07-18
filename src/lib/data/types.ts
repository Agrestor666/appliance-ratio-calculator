export interface FillMediaItem {
  id: string;
  label: string;
  densityKgPerM3: number;
  source?: string;
  notes?: string;
}

export interface FillMediaCatalog {
  version: number;
  unit: string;
  items: FillMediaItem[];
}

export interface CatalogItem {
  nps: string;
  od?: number;
  wt: number;
  t?: number;
}

/** Flange class value: flat NPS list, or schedule → NPS nest (Weld Neck). */
export type FlangeClassValue = CatalogItem[] | Record<string, CatalogItem[]>;

export interface PipingCatalog {
  pipes: Record<string, CatalogItem[]>;
  fittings: Record<string, Record<string, CatalogItem[]>>;
  flanges: Record<string, Record<string, FlangeClassValue>>;
  valves: Record<string, Record<string, CatalogItem[]>>;
}

export type RiggingCatalogRow = Record<string, string | number | undefined>;

export interface RiggingCatalogSheetRaw {
  name: string;
  rows: RiggingCatalogRow[];
}

export interface RiggingCatalog {
  version: number;
  sheets: RiggingCatalogSheetRaw[];
}
