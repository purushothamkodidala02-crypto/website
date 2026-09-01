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
    <ol aria-label="Catalogue progress" className="grid grid-cols-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
      {steps.map((step, index) => {
        const content = (
          <>
            <span className={`mx-auto grid h-6 w-6 place-items-center rounded-full text-[11px] font-black ${completed[index] ? "bg-emerald-600 text-white" : index === activeIndex ? "bg-slate-950 text-teal-200" : "bg-slate-100 text-slate-400"}`}>{completed[index] ? "✓" : index + 1}</span>
            <span className="mt-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500 sm:text-xs">{step.label}</span>
            {step.value && <span className="mt-0.5 hidden truncate text-xs font-semibold text-slate-900 sm:block">{step.value}</span>}
          </>
        );

        return (
          <li key={step.label} className={`relative text-center ${index > 0 ? "border-l" : ""} ${index === activeIndex ? "bg-teal-50" : ""}`}>
            {step.href ? (
              <Link href={step.href} aria-label={`Change ${step.label.toLowerCase()}`} className="group block h-full px-3 py-4 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-700 sm:px-5" title={`Change ${step.label.toLowerCase()}`}>
                {content}
              </Link>
            ) : (
              <div className="h-full px-3 py-4 sm:px-5">{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
