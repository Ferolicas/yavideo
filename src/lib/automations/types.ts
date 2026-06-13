export type AutomationCategory =
  | "redes"
  | "datos"
  | "personalizado"
  | "publicidad";

export interface AutomationDef {
  key: string;
  name: string;
  description: string;
  category: AutomationCategory;
  /** Si está disponible para usar en v1 (false = "próximamente"). */
  enabled: boolean;
  /** Id de la composición Remotion (null si aún no construida). */
  composition: string | null;
  /** Si necesita transcripción Whisper (subtítulos, audiogramas...). */
  needsWhisper?: boolean;
}
