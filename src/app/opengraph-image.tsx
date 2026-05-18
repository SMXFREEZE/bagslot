import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BagSlot — Find someone already flying there.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, #FBFAF9 0%, #F0EDE3 100%)",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#0A0A0F",
              color: "#FBFAF9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#0A0A0F" }}>BagSlot</div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#0A0A0F",
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
            }}
          >
            Find someone{" "}
            <span style={{ fontStyle: "italic", fontFamily: "Georgia, serif" }}>
              already flying
            </span>{" "}
            there.
          </div>
          <div style={{ fontSize: 28, color: "#5B5A55", maxWidth: 920, lineHeight: 1.35 }}>
            Peer-to-peer baggage marketplace. Send items with verified travelers. From $5.
            Payment protected until delivery.
          </div>
        </div>

        <div style={{ marginTop: 40, display: "flex", gap: 18, fontSize: 18, color: "#5B5A55" }}>
          <span>Verified travelers</span>
          <span>·</span>
          <span>Escrowed payment</span>
          <span>·</span>
          <span>No sealed packages</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
