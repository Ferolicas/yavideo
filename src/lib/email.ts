import "./env";
import { Resend } from "resend";

let _resend: Resend | null = null;
function resend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  return _resend;
}

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function from(): string {
  return process.env.EMAIL_FROM ?? "yavideo <no-reply@olcas.app>";
}

const wrap = (title: string, body: string) => `
  <div style="font-family:system-ui,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
    <div style="font-size:22px;font-weight:800;margin-bottom:16px">ya<span style="color:#6d5efc">video</span></div>
    <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
    ${body}
    <p style="margin-top:28px;font-size:12px;color:#888">yavideo · Parte del holding Olcas</p>
  </div>`;

export async function sendJobDoneEmail(opts: {
  to: string;
  count: number;
  appUrl: string;
}) {
  if (!emailConfigured() || !opts.to) return;
  try {
    await resend().emails.send({
      from: from(),
      to: opts.to,
      subject: `Tus ${opts.count} vídeo(s) están listos 🎬`,
      html: wrap(
        "Tu lote está listo",
        `<p>Hemos terminado de generar <strong>${opts.count} vídeo(s)</strong>.</p>
         <p><a href="${opts.appUrl}/panel/biblioteca" style="display:inline-block;margin-top:8px;background:#6d5efc;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600">Ver en mi biblioteca</a></p>`,
      ),
    });
  } catch (e) {
    console.error("[email] sendJobDoneEmail:", e);
  }
}
