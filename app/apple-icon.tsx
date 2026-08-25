import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const fontData = await fetch(
    "https://fonts.gstatic.com/s/martianmono/v6/2V08KIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnQzaVMIE6j15dYY3qvM6W.ttf",
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#121815",
        }}
      >
        <div
          style={{
            fontFamily: "Martian Mono",
            fontWeight: 800,
            fontSize: 108,
            color: "#eafbf1",
            lineHeight: 1,
            display: "flex",
          }}
        >
          J
        </div>
        <div
          style={{
            width: 92,
            height: 16,
            backgroundColor: "#3ddc84",
            marginTop: 14,
            display: "flex",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Martian Mono",
          data: fontData,
          weight: 800,
          style: "normal",
        },
      ],
    },
  );
}
