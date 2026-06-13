import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#?[0-9a-fA-F]{6}$/u, "Color hex inválido (ej. 0EA5E9)")
  .transform((v) => (v.startsWith("#") ? v.slice(1) : v));

// Frases motivacionales: una lista de frases + marca → un vídeo por frase.
export const frasesSchema = z.object({
  frases: z
    .array(z.string().trim().min(1).max(220))
    .min(1, "Añade al menos una frase")
    .max(100, "Máximo 100 frases por lote"),
  marca: z.string().trim().max(40).optional().default(""),
  usuario: z.string().trim().max(40).optional().default(""),
  colorFondo: hexColor.optional().default("0EA5E9"),
  colorTexto: hexColor.optional().default("FFFFFF"),
});

export type FrasesInput = z.infer<typeof frasesSchema>;

// Mapa key → esquema. Solo automatizaciones activas.
export const automationSchemas: Record<string, z.ZodTypeAny> = {
  frases: frasesSchema,
};

export function getSchema(key: string): z.ZodTypeAny | undefined {
  return automationSchemas[key];
}
