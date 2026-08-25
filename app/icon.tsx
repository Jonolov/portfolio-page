import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
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
            fontSize: 22,
            color: "#eafbf1",
            lineHeight: 1,
            display: "flex",
          }}
        >
          J
        </div>
        <div
          style={{
            width: 18,
            height: 3.5,
            backgroundColor: "#3ddc84",
            marginTop: 3,
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
