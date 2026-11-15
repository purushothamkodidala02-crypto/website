import { ImageResponse } from "next/og";
import { resolvePublicRoute } from "@/lib/public-route-data";

export const alt = "Varadhi Prep competitive exam mock test series";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 604800; // Cache 7 days on Edge CDN

export default async function ExamOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string; exam: string }>;
}) {
  const { id, exam } = await params;
  const context = await resolvePublicRoute({ stateSlug: id, examSlug: exam });

  const stateName = context?.state?.name || "Andhra Pradesh";
  const examName = context?.exam?.name || "Endowment Officer";
  const displayTitle = examName.toLowerCase().includes("appsc") || examName.toLowerCase().includes("tgpsc")
    ? examName
    : `${stateName.includes("Andhra") ? "APPSC" : "TGPSC"} ${examName}`;

  const paperNames = context?.catalog?.papers
    ?.filter((p) => p.exam_group_id === context.exam?.id)
    ?.map((p) => p.name)
    ?.slice(0, 2)
    ?.join(" & ");

  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "linear-gradient(135deg, #041311 0%, #082823 45%, #0f766e 100%)",
        color: "white",
        display: "flex",
        height: "100%",
        padding: "60px 70px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
        {/* Top Header Bar */}
        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <div style={{ alignItems: "center", display: "flex" }}>
            <div
              style={{
                alignItems: "center",
                background: "#2dd4bf",
                borderRadius: 16,
                color: "#041311",
                display: "flex",
                fontSize: 36,
                fontWeight: 900,
                height: 58,
                justifyContent: "center",
                width: 58,
              }}
            >
              V
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 16 }}>
              <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.5px" }}>Varadhi Prep</div>
              <div style={{ color: "#2dd4bf", fontSize: 13, fontWeight: 800, letterSpacing: 2.5, marginTop: 2 }}>
                GOVERNMENT EXAM PREPARATION
              </div>
            </div>
          </div>
          <div
            style={{
              background: "rgba(45, 212, 191, 0.15)",
              border: "1px solid rgba(45, 212, 191, 0.4)",
              borderRadius: 30,
              color: "#99f6e4",
              display: "flex",
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 2,
              padding: "8px 20px",
            }}
          >
            {stateName.toUpperCase()}
          </div>
        </div>

        {/* Center Exam Hero Block */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 50 }}>
          <div
            style={{
              color: "#5eead4",
              display: "flex",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            ONLINE MOCK TEST SERIES · BILINGUAL
          </div>
          <div
            style={{
              fontSize: 58,
              fontWeight: 900,
              lineHeight: 1.12,
              marginTop: 14,
              maxWidth: 1050,
            }}
          >
            {displayTitle}
          </div>
          {paperNames ? (
            <div
              style={{
                color: "#cbd5e1",
                display: "flex",
                fontSize: 24,
                fontWeight: 600,
                marginTop: 18,
              }}
            >
              Covers {paperNames}
            </div>
          ) : null}

          {/* Feature Badges */}
          <div style={{ alignItems: "center", display: "flex", gap: 16, marginTop: 32 }}>
            <div
              style={{
                background: "#2dd4bf",
                borderRadius: 12,
                color: "#041311",
                display: "flex",
                fontSize: 22,
                fontWeight: 900,
                padding: "10px 22px",
              }}
            >
              100% Free Practice Tests
            </div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: 12,
                color: "#f1f5f9",
                display: "flex",
                fontSize: 20,
                fontWeight: 700,
                padding: "10px 20px",
              }}
            >
              Real Exam Timer & Solutions
            </div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: 12,
                color: "#f1f5f9",
                display: "flex",
                fontSize: 20,
                fontWeight: 700,
                padding: "10px 20px",
              }}
            >
              తెలుగు & English
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 24,
          }}
        >
          <div style={{ color: "#99f6e4", display: "flex", fontSize: 20, fontWeight: 800 }}>
            varadhiprep.in
          </div>
          <div style={{ color: "#64748b", display: "flex", fontSize: 16, fontWeight: 600 }}>
            Free Tests · Immediate Evaluation · Performance Analytics
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
