import React from "react";

type ScreenWatermarkProps = {
  text: string;
  className?: string;
};

/**
 * ScreenWatermark displays a subtle, non-intrusive repeating anti-cheat/anti-leak watermark
 * across the background and screen during student test sessions.
 * 
 * It is non-interactive (pointer-events-none, user-select-none) so it never hinders
 * student interaction, scrolling, or answering questions.
 */
export function ScreenWatermark({ text, className = "" }: ScreenWatermarkProps) {
  if (!text) return null;

  // Sizing pattern width dynamically ensures longer student emails never collide or clip
  const patternWidth = Math.max(340, text.length * 11 + 60);
  const patternHeight = 170;

  return (
    <div
      aria-hidden="true"
      data-testid="screen-watermark"
      className={`pointer-events-none fixed inset-0 z-10 select-none overflow-hidden print:block [print-color-adjust:exact] [-webkit-print-color-adjust:exact] ${className}`}
    >
      <svg
        className="h-full w-full opacity-90"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="varadhi-test-watermark"
            width={patternWidth}
            height={patternHeight}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-22)"
          >
            <text
              x="24"
              y={patternHeight / 2}
              fill="#0f172a"
              fillOpacity="0.07"
              fontSize="13"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.04em"
            >
              {text}
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#varadhi-test-watermark)" />
      </svg>
    </div>
  );
}
