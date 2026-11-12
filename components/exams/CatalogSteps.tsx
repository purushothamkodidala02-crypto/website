import Link from "next/link";

export type CatalogStepSelection = {
  value: string;
  href: string;
};

export function CatalogSteps({
  state,
  exam,
  paper,
}: {
  state?: CatalogStepSelection;
  exam?: CatalogStepSelection;
  paper?: CatalogStepSelection;
}) {
  const steps = [
    { label: "State", value: state?.value, href: state?.href },
    { label: "Exam", value: exam?.value, href: exam?.href },
    { label: "Paper", value: paper?.value, href: paper?.href },
    { label: "Mock test", value: undefined, href: undefined },
  ];
  const completed = [Boolean(state), Boolean(exam), Boolean(paper), false];
  const activeIndex = paper ? 3 : exam ? 2 : state ? 1 : 0;

  return (
    <ol
      aria-label="Catalogue progress"
      className="grid grid-cols-2 sm:grid-cols-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs"
    >
      {steps.map((step, index) => {
        const isDone = completed[index];
        const isActive = index === activeIndex;
        const content = (
          <>
            <div className="flex items-center justify-center gap-1.5 sm:flex-col sm:gap-1">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                  isDone || isActive
                    ? "bg-teal-800 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? "✓" : index + 1}
              </span>
              <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                {step.label}
              </span>
            </div>
            {step.value && (
              <span className="mt-1 block text-[11px] sm:text-xs font-semibold leading-snug text-slate-900 line-clamp-2 break-words">
                {step.value}
              </span>
            )}
          </>
        );

        const borderClasses = [
          index >= 2 ? "border-t border-slate-200 sm:border-t-0" : "",
          index % 2 === 1 ? "border-l border-slate-200" : "",
          index > 0 && index % 2 === 0 ? "sm:border-l sm:border-slate-200" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li
            key={step.label}
            className={`relative text-center ${borderClasses} ${isActive ? "bg-teal-50/45" : ""}`}
          >
            {step.href ? (
              <Link
                href={step.href}
                prefetch={false}
                aria-label={`Change ${step.label.toLowerCase()}`}
                className="group flex h-full flex-col justify-center px-2.5 py-2.5 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-slate-700 sm:px-4 sm:py-3.5"
                title={`Change ${step.label.toLowerCase()}`}
              >
                {content}
              </Link>
            ) : (
              <div className="flex h-full flex-col justify-center px-2.5 py-2.5 sm:px-4 sm:py-3.5">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
