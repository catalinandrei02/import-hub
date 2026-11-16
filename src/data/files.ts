// PDF files kept in Firestore (no Firebase Storage needed, works on the free plan):
// files/{id} = { name, type, size, chunks, carId, addedAt } and files/{id}/chunks/{000..} = { d: base64 piece }.
import { queue } from "./store";
import type { Backend } from "./backend";

export const MAX_PDF = 10 * 1024 * 1024;
const CHUNK = 700_000; // base64 characters per piece, well under Firestore's 1 MiB per document

export function splitChunks(s: string, size = CHUNK): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
  return out.length ? out : [""];
}
const pad = (n: number) => String(n).padStart(3, "0");
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf); let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Uploads a PDF; calls onProgress(0..100). Returns the new file id. */
export async function uploadPdf(file: File, carId: string, onProgress: (p: number) => void): Promise<string> {
  const id = newId();
  const parts = splitChunks(toBase64(await file.arrayBuffer()));
  await queue("files/" + id, async (b: Backend) => {
    for (let i = 0; i < parts.length; i++) { await b.set(`files/${id}/chunks/${pad(i)}`, { d: parts[i] }); onProgress(Math.round(((i + 1) / parts.length) * 95)); }
    await b.set("files/" + id, { name: file.name.slice(0, 120), type: "application/pdf", size: file.size, chunks: parts.length, carId, addedAt: new Date().toISOString() });
  });
  onProgress(100);
  return id;
}

/** Reads a PDF back into a Blob. */
export async function readPdf(id: string): Promise<Blob> {
  return queue("files/" + id, async (b: Backend) => {
    const meta = await b.get("files/" + id);
    if (!meta) throw new Error("missing");
    const parts = (await b.list(`files/${id}/chunks`)).sort((x, y) => x.id.localeCompare(y.id)).map(c => String(c.data.d || ""));
    const bin = atob(parts.join(""));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: "application/pdf" });
  });
}

/** Deletes a PDF and its pieces. */
export function deletePdf(id: string): Promise<void> {
  return queue("files/" + id, async (b: Backend) => {
    const meta = await b.get("files/" + id);
    for (let i = 0; i < (meta?.chunks || 0); i++) await b.remove(`files/${id}/chunks/${pad(i)}`);
    await b.remove("files/" + id);
  });
}
