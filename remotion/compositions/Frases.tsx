import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export type FrasesProps = {
  frase: string;
  marca: string;
  usuario: string;
  colorFondo: string;
  colorTexto: string;
};

export const frasesDefaults: FrasesProps = {
  frase: "La disciplina es el puente entre tus metas y tus logros.",
  marca: "Tu Marca",
  usuario: "@tumarca",
  colorFondo: "0EA5E9",
  colorTexto: "FFFFFF",
};

const toHex = (c: string) => (c.startsWith("#") ? c : `#${c}`);

function darken(hex: string, factor = 0.55): string {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.replace(/(.)/g, "$1$1") : c, 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export const Frases: React.FC<FrasesProps> = ({
  frase,
  marca,
  usuario,
  colorFondo,
  colorTexto,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const bg = toHex(colorFondo);
  const fg = toHex(colorTexto);
  const words = frase.split(/\s+/u).filter(Boolean);

  const outro = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const brandSpring = spring({ frame: frame - 30, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${bg} 0%, ${darken(bg)} 100%)`,
        fontFamily:
          "'Noto Sans', 'DejaVu Sans', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <AbsoluteFill style={{ opacity: outro }}>
        {/* Frase, palabra a palabra */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 110px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px 22px",
            }}
          >
            {words.map((w, i) => {
              const s = spring({
                frame: frame - (8 + i * 4),
                fps,
                config: { damping: 200 },
              });
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px)`,
                    opacity: s,
                    color: fg,
                    fontSize: 92,
                    fontWeight: 800,
                    lineHeight: 1.12,
                    letterSpacing: -1,
                    textShadow: "0 8px 40px rgba(0,0,0,0.28)",
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </AbsoluteFill>

        {/* Marca y usuario */}
        <div
          style={{
            position: "absolute",
            bottom: 150,
            width: "100%",
            textAlign: "center",
            color: fg,
            opacity: brandSpring,
            transform: `translateY(${interpolate(brandSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          {marca ? (
            <div style={{ fontSize: 48, fontWeight: 800 }}>{marca}</div>
          ) : null}
          {usuario ? (
            <div style={{ fontSize: 36, opacity: 0.85, marginTop: 6 }}>
              {usuario}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
