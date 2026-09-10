import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/cms";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1a1712";
const GREEN = "#d9825c";
const PAPER = "#f3efe7";

export default async function Image() {
  const profile = await getProfile();
  const [display, sans] = await Promise.all([
    fetch(
      "https://fonts.gstatic.com/s/familjengrotesk/v11/Qw3LZR9ZHiDnImG6-NEMQ41wby8WRnYsfkunR_eGfMFubizt.ttf",
    ).then((res) => res.arrayBuffer()),
    fetch(
      "https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTBjNp8A.ttf",
    ).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: INK,
        color: PAPER,
        padding: "80px",
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Familjen Grotesk",
          fontWeight: 700,
          textTransform: "uppercase",
          fontSize: 104,
          lineHeight: 0.92,
          letterSpacing: -3,
          color: GREEN,
        }}
      >
        {profile.name}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Archivo",
          fontSize: 36,
          color: "rgba(243,239,231,0.78)",
          marginTop: 26,
        }}
      >
        {profile.roleLine}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Archivo",
          fontSize: 27,
          color: "rgba(243,239,231,0.55)",
          marginTop: 20,
          maxWidth: 940,
        }}
      >
        {profile.heroHook}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Familjen Grotesk",
          data: display,
          weight: 700,
          style: "normal",
        },
        { name: "Archivo", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
}
