import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: "#154734", // Poly Green
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "8px", // Rounded corners (Startup vibe)
          position: "relative",
          fontWeight: 900,
          fontFamily: 'serif', // Matches your Playfair Display vibe
        }}
      >
        {/* The Letter P */}
        <div style={{ position: 'relative', top: -1 }}>P</div>
        
        {/* The Gold Dot (Accent) */}
        <div
          style={{
            position: "absolute",
            bottom: 6,
            right: 6,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#C69214", // Poly Gold
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}