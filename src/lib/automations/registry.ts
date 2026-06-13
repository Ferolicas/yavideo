import type { AutomationDef } from "./types";

// Catálogo de los 19 servicios. yavideo es UNA app; cada servicio es una
// composición Remotion + su esquema de inputs + su handler en la cola.
// En v1 solo "frases" está activa; el resto se irán habilitando como plantillas.
export const automations: AutomationDef[] = [
  {
    key: "frases",
    name: "Frases motivacionales",
    description:
      "Sube una lista de frases y tu marca; recibe un vídeo vertical animado por cada frase.",
    category: "redes",
    enabled: true,
    composition: "frases",
  },
  {
    key: "catalogo-reels",
    name: "Catálogo → Reels",
    description:
      "Tu catálogo (recetas, productos, etc.) convertido en un Reel 9:16 por cada ítem.",
    category: "datos",
    enabled: false,
    composition: null,
  },
  {
    key: "subtitulos",
    name: "Subtítulos animados",
    description:
      "Sube tu vídeo o pega un enlace: subtítulos estilo Hormozi palabra a palabra.",
    category: "redes",
    enabled: false,
    composition: null,
    needsWhisper: true,
  },
  {
    key: "audiograma",
    name: "Audiogramas de podcast",
    description:
      "Convierte un episodio de audio en un clip visual con onda y subtítulos.",
    category: "redes",
    enabled: false,
    composition: null,
    needsWhisper: true,
  },
  {
    key: "ventas-personalizado",
    name: "Vídeos de venta por lead",
    description:
      "Un vídeo único por cada lead de tu CRM, con su nombre y sus datos.",
    category: "personalizado",
    enabled: false,
    composition: null,
  },
  {
    key: "invitaciones",
    name: "Invitaciones de eventos",
    description:
      "Invitación en vídeo personalizada por nombre para bodas y eventos.",
    category: "personalizado",
    enabled: false,
    composition: null,
  },
  {
    key: "cumpleanos",
    name: "Felicitaciones automáticas",
    description:
      "Cumpleaños y aniversarios de cliente felicitados solos cada día.",
    category: "personalizado",
    enabled: false,
    composition: null,
  },
  {
    key: "bienvenida",
    name: "Vídeos de bienvenida",
    description: "Onboarding en vídeo personalizado al registrarse o comprar.",
    category: "personalizado",
    enabled: false,
    composition: null,
  },
  {
    key: "wrapped",
    name: "Tu año en resumen",
    description:
      "Estilo Spotify Wrapped: los datos de cada cliente en escenas animadas.",
    category: "datos",
    enabled: false,
    composition: null,
  },
  {
    key: "graficas",
    name: "Gráficas e informes",
    description: "Informes mensuales convertidos en vídeo con gráficas animadas.",
    category: "datos",
    enabled: false,
    composition: null,
  },
  {
    key: "inmuebles",
    name: "Vídeos de inmuebles",
    description:
      "Cada propiedad (fotos + datos) en un vídeo con Ken Burns y mapa.",
    category: "datos",
    enabled: false,
    composition: null,
  },
  {
    key: "producto-ecommerce",
    name: "Vídeos de producto",
    description: "Tu catálogo de tienda en vídeos para anuncios y redes.",
    category: "datos",
    enabled: false,
    composition: null,
  },
  {
    key: "presupuestos",
    name: "Presupuestos en vídeo",
    description: "Tu cotización presentada en vídeo en lugar de un PDF gris.",
    category: "personalizado",
    enabled: false,
    composition: null,
  },
  {
    key: "deportes",
    name: "Resúmenes deportivos",
    description: "Previa y resumen con estadísticas, generados al instante.",
    category: "datos",
    enabled: false,
    composition: null,
  },
  {
    key: "noticias",
    name: "Noticias diarias",
    description: "“Las 5 claves de hoy en [nicho]” generado solo cada mañana.",
    category: "datos",
    enabled: false,
    composition: null,
  },
  {
    key: "ab-ads",
    name: "Variantes de anuncios A/B",
    description: "Decenas de variantes del mismo anuncio para testear creativos.",
    category: "publicidad",
    enabled: false,
    composition: null,
  },
  {
    key: "intros-outros",
    name: "Intros y outros",
    description: "Pack de intro, outro y cortinillas coherentes para tu canal.",
    category: "publicidad",
    enabled: false,
    composition: null,
  },
  {
    key: "mockups",
    name: "Mockups de apps",
    description: "Tu app dentro de un dispositivo 3D que rota y hace zoom.",
    category: "publicidad",
    enabled: false,
    composition: null,
  },
  {
    key: "certificados",
    name: "Certificados y diplomas",
    description: "Diploma animado por alumno, listo para compartir en redes.",
    category: "personalizado",
    enabled: false,
    composition: null,
  },
];

export function getAutomation(key: string): AutomationDef | undefined {
  return automations.find((a) => a.key === key);
}

export const enabledAutomations = automations.filter((a) => a.enabled);
