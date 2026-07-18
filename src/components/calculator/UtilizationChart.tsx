import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { ArcElement, Chart, DoughnutController, Legend, Tooltip } from "chart.js";

import type { AlertSeverity } from "@/lib/appliance-ratio";
import { cn } from "@/lib/utils";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

/** Status colors for light industrial UI — not legacy purple glass. */
const SEGMENT_COLORS: Record<AlertSeverity, { used: string; remaining: string }> = {
  none: { used: "oklch(0.55 0.09 195)", remaining: "oklch(0.92 0.01 195)" },
  warn: { used: "oklch(0.72 0.14 85)", remaining: "oklch(0.93 0.02 85)" },
  crit: { used: "oklch(0.58 0.2 25)", remaining: "oklch(0.93 0.02 25)" },
  input: { used: "oklch(0.65 0.02 250)", remaining: "oklch(0.92 0.01 250)" },
};

export interface UtilizationChartHandle {
  /** Best-effort PNG data URL for the technical report; null if chart not ready. */
  toPngDataUrl: () => string | null;
}

interface UtilizationChartProps {
  usedPercent: number;
  remainingPercent: number;
  severity: AlertSeverity;
  className?: string;
}

export const UtilizationChart = forwardRef<UtilizationChartHandle, UtilizationChartProps>(function UtilizationChart(
  { usedPercent, remainingPercent, severity, className },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<"doughnut"> | null>(null);

  useImperativeHandle(ref, () => ({
    toPngDataUrl: () => {
      const chart = chartRef.current;
      if (!chart) return null;
      try {
        return chart.toBase64Image("image/png", 1);
      } catch {
        return null;
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const colors = SEGMENT_COLORS[severity];
    const chart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["Used", "Remaining"],
        datasets: [
          {
            label: "Capacity",
            data: [usedPercent, remainingPercent],
            borderWidth: 1,
            borderColor: "oklch(1 0 0)",
            backgroundColor: [colors.used, colors.remaining],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "oklch(0.35 0 0)",
              boxWidth: 12,
              font: { size: 12 },
            },
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (ctx) => {
                const label = ctx.label || "";
                const v = typeof ctx.parsed === "number" ? ctx.parsed : Number.NaN;
                const pct = Number.isFinite(v) ? `${v.toFixed(1)}%` : "—";
                return `${label}: ${pct}`;
              },
            },
          },
        },
      },
    });

    chartRef.current = chart;

    return () => {
      chartRef.current = null;
      chart.destroy();
    };
  }, [usedPercent, remainingPercent, severity]);

  return (
    <div className={cn("mx-auto w-full max-w-[280px]", className)}>
      <canvas ref={canvasRef} aria-label="Utilization capacity chart" />
    </div>
  );
});
