import { inferExamKind } from "@/lib/exam-catalog";

type SymbolProps = { className?: string };

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function StateSymbol({ slug, className = "h-6 w-6" }: SymbolProps & { slug: string }) {
  const normalized = (slug || "").toLowerCase().replace(/_/g, "-");

  if (normalized === "central") {
    return (
      <svg {...svgProps} className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3.5 12h17M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21M12 3C9.8 5.4 8.7 8.4 8.7 12S9.8 18.6 12 21" />
      </svg>
    );
  }

  if (normalized === "telangana" || normalized === "tg") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M4.1 20.1L4 18.6L4.4 18.4L3 17.8L3.9 17L4 15.4L3.4 14.8L4.1 13.6L4.8 13.5L3.8 13L4.6 11.5L4.1 9.4L5.8 7.7L5.1 7L5.5 5.7L6.7 6L7.3 5L7.3 3L9.5 3.7L9.9 4.6L10.9 5L11.1 4.3L12 4.8L13.3 4.4L14.1 5.2L13.6 6.5L13.9 7.9L16.8 9L17.2 10.5L18.2 10.5L18.5 12.2L21.5 11.9L20.6 12.4L20 14L18 14.6L17.6 15.4L16.5 14.9L15.8 15.2L15.8 15.7L16.6 15.8L16.5 16.5L14.9 15.3L14.2 15.9L14.5 16.3L14 17.1L13.2 16.7L11.2 17.4L11 18.8L10.2 18.7L9.2 19.7L7.7 19.4L6.6 20.5L4.1 20.1Z" />
      </svg>
    );
  }

  if (normalized === "andhra-pradesh" || normalized === "ap") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3.9 12.5L5.5 12.7L5.7 12.2L7 12.2L8.2 11.6L8.3 10.8L10 10.6L10.6 9.5L11.5 10.3L11 9.5L12.2 9.6L13.7 8.7L14.6 7.2L15.8 7.1L16.3 5.6L16.6 6.4L17 5.9L17.7 6.1L17.6 5.4L19.2 4L20.3 5.1L22 4.2L20.3 6.3L15.9 9.5L15.7 10.9L13.3 11.5L12.4 13L11.5 12.6L10.8 13.1L10.2 14.8L10.9 18.9L10.5 18.2L10.2 18.5L10.9 19.1L10.1 18.6L9.5 19.5L8.5 19.2L8.5 19.7L6.7 20L6 21L5.7 20.4L6.2 20.4L6.5 19.3L6 19.1L6.1 18.5L5.3 18.4L5.4 17.8L4.6 17.6L3.7 18.3L3 17.7L2.6 18.1L2.3 17L3.7 17.7L3.4 17.4L3.9 16.8L2.4 16.8L2 14.7L3 14.6L2.7 12.6L3.9 12.5Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
      <path d="M9 3v15M15 6v15" />
    </svg>
  );
}

export function ExamSymbol({ name, className = "h-6 w-6" }: SymbolProps & { name: string }) {
  const kind = inferExamKind(name);

  if (kind === "police") {
    return (
      <svg {...svgProps} className={className}>
        <path d="M12 3 5.5 5.8v5.6c0 4.1 2.6 7.7 6.5 9.6 3.9-1.9 6.5-5.5 6.5-9.6V5.8L12 3Z" />
        <path d="m12 7 1.2 2.4 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4L12 7Z" />
      </svg>
    );
  }

  if (kind === "education") {
    return (
      <svg {...svgProps} className={className}>
        <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
        <path d="M6.5 10.2v5.1c3.3 2.3 7.7 2.3 11 0v-5.1M21 8.5V14" />
      </svg>
    );
  }

  if (kind === "engineering") {
    return (
      <svg {...svgProps} className={className}>
        <path d="M4 20h16M6 20V9l6-5 6 5v11" />
        <path d="M9 20v-6h6v6M9 10h.01M15 10h.01" />
      </svg>
    );
  }

  if (kind === "administration") {
    return (
      <svg {...svgProps} className={className}>
        <path d="m3 9 9-5 9 5M5 10h14M6.5 10v7M10.2 10v7M13.8 10v7M17.5 10v7M4 20h16M5 17h14" />
      </svg>
    );
  }

  return (
    <svg {...svgProps} className={className}>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}

export function PaperSymbol({ className = "h-6 w-6" }: SymbolProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M7 3.5h7l3 3V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V7h3M9 11h6M9 14.5h6M9 18h3" />
    </svg>
  );
}

export function MockSymbol({ className = "h-6 w-6" }: SymbolProps) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2M8 3.9 6.5 2.5M16 3.9l1.5-1.4" />
    </svg>
  );
}
