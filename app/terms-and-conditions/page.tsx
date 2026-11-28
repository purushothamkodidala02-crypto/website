import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Review the terms and conditions for using Varadhi Prep free online mock tests, student accounts, practice question sets, and voluntary platform support.",
  alternates: { canonical: "/terms-and-conditions" },
};

const updated = "28 November 2026";

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader compact />
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Varadhi Prep policies</p>
          <h1 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">Terms and Conditions</h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: {updated}</p>

          <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700">
            <section>
              <h2 className="text-lg font-black text-slate-950">1. Our service</h2>
              <p className="mt-2">
                Varadhi Prep provides online practice mock tests, detailed question explanations, and study analytics for students preparing for competitive examinations. It is an educational practice service; it does not represent or guarantee selection, employment, examination results, or affiliation with any recruiting authority.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-slate-950">2. Student accounts</h2>
              <p className="mt-2">
                Keep your login details private and use your own account. Do not share account sessions, scrape or redistribute platform content for commercial use, attempt to bypass access controls, or interfere with the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-slate-950">3. Free mock tests and open access</h2>
              <p className="mt-2">
                Varadhi Prep is built to support aspirants rather than to charge them — all syllabus-aligned mock tests, answer keys, mistake reviews, and bookmarks are provided completely free of cost and ad-free. We do not lock mock tests behind commercial paywalls or operate this service for profit. If an optional paid Exam Series is ever enabled, any included tests and validity terms will always be clearly disclosed beforehand while free mock tests remain open under platform rules.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-slate-950">4. Payments and pricing</h2>
              <p className="mt-2">
                There is no mandatory fee or subscription pricing to study or attempt mock tests on Varadhi Prep. However, if you find the platform helpful and wish to encourage our work, you are welcome to make a completely voluntary contribution of any amount in Indian Rupees (INR) through our{" "}
                <Link href="/help-us-to-grow" className="font-bold text-teal-700 underline">
                  Help Us Grow
                </Link>{" "}
                page to help cover server, database, and bilingual question-curation costs. All voluntary contributions (and any optional series fees displayed in Indian Rupees (INR)) are processed securely via Cashfree or authorized UPI methods—never as a requirement to use free tests.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-slate-950">5. Availability and changes</h2>
              <p className="mt-2">
                We work to keep the service reliable and accurate, and may update mock tests, questions, features, or these terms as needed. Any updates will not revoke previously granted account access or active supporter benefits before their stated duration unless required for security, legal compliance, or misuse prevention.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-slate-950">6. Support</h2>
              <p className="mt-2">
                For account, voluntary contribution, or study-platform help, contact us at{" "}
                <a className="font-bold text-teal-700 underline" href="mailto:support@varadhiprep.in">
                  support@varadhiprep.in
                </a>
                . Our Refunds and Cancellations policy explains payment-related requests.
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
            <Link href="/refunds-and-cancellations" className="font-bold text-teal-700 underline">
              Read Refunds and Cancellations →
            </Link>
            <Link href="/help-us-to-grow" className="font-bold text-teal-700 underline">
              Support Varadhi Prep →
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
