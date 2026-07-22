import { cn } from "@/lib/utils";

/**
 * Schematic lift diagram: pipe cargo + typical rigging (slings, shackles, chain block).
 * Colors follow the calculator’s industrial teal / muted steel palette.
 */
export function LiftDiagram({ className }: { className?: string }) {
  return (
    <figure
      className={cn("text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2", className)}
      aria-label="Schematic: pipe lift showing cargo weight and rigging weight"
    >
      <svg
        viewBox="0 0 220 200"
        className="h-full max-h-full w-full max-w-md object-contain"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-hidden
      >
        <title>Pipe lift schematic</title>
        <defs>
          <linearGradient id="lift-pipe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.03 220)" />
            <stop offset="100%" stopColor="oklch(0.55 0.04 220)" />
          </linearGradient>
          <linearGradient id="lift-sling" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.55 0.09 195)" />
            <stop offset="100%" stopColor="oklch(0.45 0.08 195)" />
          </linearGradient>
          <marker id="lift-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="oklch(0.45 0.06 195)" />
          </marker>
        </defs>

        {/* Soft ground / workspace */}
        <ellipse cx="110" cy="188" rx="78" ry="6" fill="oklch(0.94 0.01 220)" />

        {/* Crane hook eye */}
        <path d="M110 8 v10" stroke="oklch(0.4 0.02 250)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="110" cy="26" r="8" fill="none" stroke="oklch(0.4 0.02 250)" strokeWidth="2.5" />
        <circle cx="110" cy="26" r="3" fill="oklch(0.55 0.02 250)" />

        {/* Master link / shackle under hook */}
        <path
          d="M102 34 Q110 42 118 34"
          fill="none"
          stroke="oklch(0.45 0.03 85)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <rect
          x="106"
          y="38"
          width="8"
          height="10"
          rx="1.5"
          fill="oklch(0.72 0.08 85)"
          stroke="oklch(0.5 0.1 85)"
          strokeWidth="1"
        />

        {/* Chain block body */}
        <rect
          x="96"
          y="48"
          width="28"
          height="22"
          rx="3"
          fill="oklch(0.55 0.09 195)"
          stroke="oklch(0.4 0.08 195)"
          strokeWidth="1.2"
        />
        <rect x="101" y="53" width="18" height="8" rx="1" fill="oklch(0.88 0.02 195)" />
        <text
          x="110"
          y="67"
          textAnchor="middle"
          fontSize="5.5"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fill="oklch(0.98 0 0)"
          fontWeight="600"
        >
          CHAIN
        </text>

        {/* Load chain down to lower shackle */}
        <g stroke="oklch(0.42 0.04 250)" strokeWidth="1.8" fill="none">
          <path d="M110 70 v4" />
          <circle cx="110" cy="78" r="2.2" />
          <circle cx="110" cy="84" r="2.2" />
          <circle cx="110" cy="90" r="2.2" />
        </g>

        {/* Lower shackle / master link */}
        <path
          d="M102 94 Q110 104 118 94"
          fill="none"
          stroke="oklch(0.45 0.03 85)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="110" cy="98" r="3.5" fill="oklch(0.72 0.08 85)" stroke="oklch(0.5 0.1 85)" strokeWidth="1" />

        {/* Two-leg wire rope slings */}
        <path
          d="M108 101 Q70 125 52 148"
          fill="none"
          stroke="url(#lift-sling)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M112 101 Q150 125 168 148"
          fill="none"
          stroke="url(#lift-sling)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Soft sling wraps (webbing) around pipe ends */}
        <path
          d="M44 148 Q52 138 60 148 Q52 158 44 148"
          fill="oklch(0.55 0.09 195 / 0.35)"
          stroke="oklch(0.45 0.08 195)"
          strokeWidth="1.2"
        />
        <path
          d="M160 148 Q168 138 176 148 Q168 158 160 148"
          fill="oklch(0.55 0.09 195 / 0.35)"
          stroke="oklch(0.45 0.08 195)"
          strokeWidth="1.2"
        />

        {/* End shackles on sling legs */}
        <g fill="oklch(0.72 0.08 85)" stroke="oklch(0.5 0.1 85)" strokeWidth="1">
          <circle cx="52" cy="148" r="4" />
          <circle cx="168" cy="148" r="4" />
        </g>
        <circle cx="52" cy="148" r="1.6" fill="oklch(0.45 0.08 85)" />
        <circle cx="168" cy="148" r="1.6" fill="oklch(0.45 0.08 85)" />

        {/* Pipe bundle (cargo) */}
        <g>
          <ellipse
            cx="110"
            cy="152"
            rx="52"
            ry="10"
            fill="url(#lift-pipe)"
            stroke="oklch(0.42 0.03 220)"
            strokeWidth="1.2"
          />
          <rect
            x="58"
            y="152"
            width="104"
            height="18"
            fill="url(#lift-pipe)"
            stroke="oklch(0.42 0.03 220)"
            strokeWidth="1.2"
          />
          <ellipse
            cx="110"
            cy="170"
            rx="52"
            ry="10"
            fill="oklch(0.5 0.035 220)"
            stroke="oklch(0.42 0.03 220)"
            strokeWidth="1.2"
          />
          {/* Pipe bore hints */}
          <ellipse
            cx="70"
            cy="161"
            rx="5"
            ry="6"
            fill="oklch(0.88 0.01 220)"
            stroke="oklch(0.55 0.03 220)"
            strokeWidth="0.8"
          />
          <ellipse
            cx="90"
            cy="161"
            rx="5"
            ry="6"
            fill="oklch(0.88 0.01 220)"
            stroke="oklch(0.55 0.03 220)"
            strokeWidth="0.8"
          />
          <ellipse
            cx="110"
            cy="161"
            rx="5"
            ry="6"
            fill="oklch(0.88 0.01 220)"
            stroke="oklch(0.55 0.03 220)"
            strokeWidth="0.8"
          />
          <ellipse
            cx="130"
            cy="161"
            rx="5"
            ry="6"
            fill="oklch(0.88 0.01 220)"
            stroke="oklch(0.55 0.03 220)"
            strokeWidth="0.8"
          />
          <ellipse
            cx="150"
            cy="161"
            rx="5"
            ry="6"
            fill="oklch(0.88 0.01 220)"
            stroke="oklch(0.55 0.03 220)"
            strokeWidth="0.8"
          />
        </g>

        {/* Cargo weight label (right) — leader points at pipe bundle */}
        <g>
          <rect
            x="172"
            y="158"
            width="44"
            height="22"
            rx="3"
            fill="oklch(0.55 0.09 195 / 0.12)"
            stroke="oklch(0.55 0.09 195)"
            strokeWidth="1"
          />
          <text
            x="194"
            y="167"
            textAnchor="middle"
            fontSize="6"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fill="oklch(0.4 0.06 195)"
            fontWeight="600"
          >
            Cargo
          </text>
          <text
            x="194"
            y="175"
            textAnchor="middle"
            fontSize="5.5"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fill="oklch(0.45 0.05 195)"
          >
            weight
          </text>
          <path d="M172 169 H164" stroke="oklch(0.45 0.06 195)" strokeWidth="1.2" markerEnd="url(#lift-arrow)" />
        </g>

        {/* Rigging weight bracket (left) — spans hook → lower shackle */}
        <g>
          <path d="M34 48 V98" stroke="oklch(0.55 0.1 85)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M30 48 H38" stroke="oklch(0.55 0.1 85)" strokeWidth="1.2" />
          <path d="M30 98 H38" stroke="oklch(0.55 0.1 85)" strokeWidth="1.2" />
          <rect
            x="2"
            y="58"
            width="26"
            height="30"
            rx="3"
            fill="oklch(0.72 0.12 85 / 0.15)"
            stroke="oklch(0.62 0.12 85)"
            strokeWidth="1"
          />
          <text
            x="15"
            y="70"
            textAnchor="middle"
            fontSize="5.5"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fill="oklch(0.45 0.1 75)"
            fontWeight="600"
          >
            Rigging
          </text>
          <text
            x="15"
            y="80"
            textAnchor="middle"
            fontSize="5"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fill="oklch(0.48 0.08 75)"
          >
            weight
          </text>
          <path d="M28 73 H33" stroke="oklch(0.55 0.1 85)" strokeWidth="1.2" markerEnd="url(#lift-arrow)" />
        </g>

        {/* Tiny part callouts */}
        <text x="142" y="58" fontSize="5" fontFamily="ui-sans-serif, system-ui, sans-serif" fill="oklch(0.5 0.02 250)">
          block
        </text>
        <path d="M138 58 L124 58" stroke="oklch(0.7 0.01 250)" strokeWidth="0.8" />
        <text x="148" y="118" fontSize="5" fontFamily="ui-sans-serif, system-ui, sans-serif" fill="oklch(0.5 0.02 250)">
          sling
        </text>
        <path d="M145 120 L132 112" stroke="oklch(0.7 0.01 250)" strokeWidth="0.8" />
        <text x="38" y="138" fontSize="5" fontFamily="ui-sans-serif, system-ui, sans-serif" fill="oklch(0.5 0.02 250)">
          shackle
        </text>
        <path d="M48 140 L50 146" stroke="oklch(0.7 0.01 250)" strokeWidth="0.8" />
      </svg>
    </figure>
  );
}
