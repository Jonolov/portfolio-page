import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#121815";
const PAPER = "#eafbf1";
const GREEN = "#3ddc84";

export default async function Image() {
  const [mono, sans] = await Promise.all([
    fetch(
      "https://fonts.gstatic.com/s/martianmono/v6/2V08KIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnQzaVMIE6j15dYY3qvM6W.ttf",
    ).then((res) => res.arrayBuffer()),
    fetch(
      "https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTBjNp8A.ttf",
    ).then((res) => res.arrayBuffer()),
  ]);

  const firstLetter = profile.name.slice(0, 1);
  const rest = profile.name.slice(1);

  return new ImageResponse(
    (
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
        <div style={{ display: "flex", flexDirection: "row", gap: 0 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Martian Mono",
              fontWeight: 800,
              fontSize: 92,
              lineHeight: 1.05,
              paddingBottom: 8,
              borderBottom: `10px solid ${GREEN}`,
            }}
          >
            {firstLetter}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Martian Mono",
              fontWeight: 800,
              fontSize: 92,
              lineHeight: 1.05,
              paddingBottom: 18,
            }}
          >
            {rest}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Archivo",
            fontSize: 36,
            color: "rgba(234,251,241,0.78)",
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
            color: "rgba(234,251,241,0.55)",
            marginTop: 20,
            maxWidth: 940,
          }}
        >
          {profile.heroHook}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Martian Mono", data: mono, weight: 800, style: "normal" },
        { name: "Archivo", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
}
