import { permanentRedirect } from "next/navigation";

export async function generateStaticParams() {
  return [
    { slug: "telangana-police-constable-recruitment-2026" },
    { slug: "telangana-police-constable-notification-2026" },
    { slug: "telangana-police-constable" },
  ];
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ExamSlugRedirectPage({ params }: Props) {
  const { slug } = await params;
  if (slug.includes("police") || slug.includes("constable")) {
    permanentRedirect("/mock-tests/telangana/police-constable-free-mock-test");
  }
  permanentRedirect("/mock-tests");
}
