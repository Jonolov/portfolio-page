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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: INK,
          color: PAPER,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "26px 32px",
            borderBottom: "1px solid rgba(234,251,241,0.14)",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: "rgba(234,251,241,0.18)",
              display: "flex",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: "rgba(234,251,241,0.18)",
              display: "flex",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: "rgba(234,251,241,0.18)",
              display: "flex",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "56px 80px",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Martian Mono",
              fontSize: 28,
              color: "rgba(234,251,241,0.68)",
            }}
          >
            <span style={{ color: GREEN, display: "flex" }}>$&nbsp;</span>
            whoami
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Martian Mono",
              fontWeight: 800,
              fontSize: 84,
              lineHeight: 1.05,
              marginTop: 20,
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Archivo",
              fontSize: 34,
              color: "rgba(234,251,241,0.78)",
              marginTop: 22,
            }}
          >
            {profile.roleLine}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Archivo",
              fontSize: 26,
              color: "rgba(234,251,241,0.55)",
              marginTop: 18,
              maxWidth: 920,
            }}
          >
            {profile.heroHook}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: "auto",
              fontFamily: "Martian Mono",
              fontSize: 24,
              color: GREEN,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                backgroundColor: GREEN,
                display: "flex",
              }}
            />
            {profile.contact.statusLine}
          </div>
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
