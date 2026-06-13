import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yavideo.olcas.app"),
  title: {
    default: "yavideo — Contenido en vídeo a escala con plantillas",
    template: "%s · yavideo",
  },
  description:
    "Rellena tus datos y genera vídeos para redes a escala con plantillas automatizadas. Frases, reels de catálogo, subtítulos y más, sin grabar ni editar.",
  applicationName: "yavideo",
  openGraph: {
    title: "yavideo — Contenido en vídeo a escala",
    description:
      "Genera vídeos para redes a escala con plantillas automatizadas. Sin editor de vídeo.",
    url: "https://yavideo.olcas.app",
    siteName: "yavideo",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
