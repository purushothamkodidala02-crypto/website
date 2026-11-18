import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";
import { getActiveSurvey, getSurveyById, checkSurveyEligibilityAction } from "@/app/actions/surveys";
import { SurveyForm } from "./SurveyForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student Survey | VaradhiPrep",
  description: "Share your exam preparation needs and feedback to help us build better mock tests.",
};

export default async function SurveyPage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const surveyId = params?.id;

  const survey = surveyId ? await getSurveyById(surveyId) : await getActiveSurvey();
  const eligibility = survey ? await checkSurveyEligibilityAction(survey.id) : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <PublicHeader />

      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        {survey ? (
          eligibility && !eligibility.eligible ? (
            eligibility.reason === "not_logged_in" ? (
              <div className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xs sm:p-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
                  🔒
                </div>
                <h1 className="mt-5 font-display text-2xl font-black text-slate-900">
                  Student Sign In Required
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 sm:text-base">
                  {eligibility.isApEndowment
                    ? "This survey is exclusively for candidates who attended the AP Endowment Officer exam. Please sign in to verify your exam attendance."
                    : "Please sign in with your student account to access this survey."}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/login?next=${encodeURIComponent(surveyId ? `/survey?id=${surveyId}` : "/survey")}`}
                    className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-teal-800"
                  >
                    Sign In to Continue
                  </Link>
                  <Link
                    href="/mock-tests/andhra-pradesh/appsc-endowment-officer-mock-test"
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Browse AP Endowment Mocks
                  </Link>
                </div>
              </div>
            ) : eligibility.reason === "no_exam_attempts" ? (
              <div className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xs sm:p-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
                  ✍️
                </div>
                <h1 className="mt-5 font-display text-2xl font-black text-slate-900">
                  Exam Attendance Required
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 sm:text-base">
                  {eligibility.isApEndowment
                    ? "This feedback survey is only available to students who have attended an AP Endowment Officer mock exam on Varadhi Prep."
                    : "You must attend the respective mock exam before accessing this survey."}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/mock-tests/andhra-pradesh/appsc-endowment-officer-mock-test"
                    className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-teal-800"
                  >
                    Take AP Endowment Mock Test
                  </Link>
                  <Link
                    href="/"
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            ) : eligibility.reason === "already_submitted" ? (
              <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xs sm:p-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
                  ✓
                </div>
                <h1 className="mt-5 font-display text-2xl font-black text-slate-900">
                  Survey Already Submitted
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 sm:text-base">
                  Thank you! You have already submitted your response for this survey.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/mock-tests"
                    className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-teal-800"
                  >
                    Browse Mock Tests
                  </Link>
                  <Link
                    href="/"
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs sm:p-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                  ⏳
                </div>
                <h1 className="mt-5 font-display text-2xl font-black text-slate-900">
                  Survey Unavailable
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 sm:text-base">
                  This survey is currently inactive or has ended.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/"
                    className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-teal-800"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            )
          ) : (
            <>
              <div className="mb-8 text-center">
                <span className="inline-block rounded-full bg-teal-100 px-3.5 py-1 text-xs font-bold text-teal-800">
                  Student Feedback
                </span>
                <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {survey.title}
                </h1>
                {survey.description ? (
                  <p className="mt-3 text-base text-slate-600 sm:text-lg">
                    {survey.description}
                  </p>
                ) : (
                  <p className="mt-3 text-base text-slate-600 sm:text-lg">
                    Help us build the exact mock tests and study materials you need for your exams.
                  </p>
                )}
              </div>

              <SurveyForm survey={survey} />
            </>
          )
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
              📋
            </div>
            <h1 className="mt-5 font-display text-2xl font-black text-slate-900">
              No Active Survey Available
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 sm:text-base">
              There is currently no active survey being conducted. Please check back soon or browse our full catalogue of mock tests!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/mock-tests"
                className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
              >
                Browse Mock Tests
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
