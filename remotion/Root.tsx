import React from "react";
import { Composition } from "remotion";
import { Frases, frasesDefaults } from "./compositions/Frases";

// Cada automatización del catálogo registra aquí su composición.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="frases"
        component={Frases}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={frasesDefaults}
      />
    </>
  );
};
