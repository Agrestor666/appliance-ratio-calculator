/** Typed catalog exports for the Astro calculator — no `window.*` globals. */

import { FILL_MEDIA_CATALOG as fillRaw } from "./fill-media-catalog.js";
import { PIPING_CATALOG as pipingRaw } from "./piping-catalog.js";
import { RIGGING_CATALOG as riggingRaw } from "./rigging-catalog.js";

import type { FillMediaCatalog, PipingCatalog, RiggingCatalog } from "./types";

export type {
  CatalogItem,
  FillMediaCatalog,
  FillMediaItem,
  FlangeClassValue,
  PipingCatalog,
  RiggingCatalog,
  RiggingCatalogRow,
  RiggingCatalogSheetRaw,
} from "./types";

export const FILL_MEDIA_CATALOG = fillRaw as FillMediaCatalog;
export const PIPING_CATALOG = pipingRaw as PipingCatalog;
export const RIGGING_CATALOG = riggingRaw as RiggingCatalog;
