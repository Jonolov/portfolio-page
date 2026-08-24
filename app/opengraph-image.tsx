import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontData = await fetch(
    "https://github.com/vercel/geist-font/raw/main/packages/next/dist/fonts/geist-sans/Geist-Bold.ttf",
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0a0a",
          color: "#f5f5f5",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor: "#a78bfa",
              display: "flex",
            }}
          />
          <div style={{ fontSize: "28px", color: "#a78bfa", display: "flex" }}>
            {profile.contact.location} · {profile.contact.company}
          </div>
        </div>
        <div style={{ fontSize: "88px", fontWeight: 700, display: "flex" }}>
          {profile.name}
        </div>
        <div
          style={{
            fontSize: "36px",
            color: "#a1a1a1",
            marginTop: "24px",
            maxWidth: "980px",
            display: "flex",
          }}
        >
          {profile.roleLine}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
