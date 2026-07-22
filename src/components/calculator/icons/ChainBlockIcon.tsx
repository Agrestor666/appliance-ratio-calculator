import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

/** Lucide-style chain block / hoist icon (24×24, stroke 2). */
export function ChainBlockIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
      aria-hidden
      {...props}
    >
      {/* Top suspension eye */}
      <circle cx="12" cy="3.5" r="1.5" />
      {/* Block housing */}
      <rect x="7" y="6" width="10" height="7" rx="1.5" />
      {/* Sheave / wheel */}
      <circle cx="12" cy="9.5" r="2" />
      {/* Load chain */}
      <path d="M12 13v3.5" />
      <circle cx="12" cy="17.5" r="1.25" />
      {/* Bottom hook */}
      <path d="M12 18.75v1" />
      <path d="M9.5 21.5a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}
