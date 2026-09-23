import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { WorkspaceStore } from "./workspace-store";
import type { Media } from "../src/campus/lib/workspace";

// Only inert, recognised containers may be rendered in the browser. SVG and
// document formats always remain attachments, regardless of their claimed MIME.
export function previewType(bytes: Uint8Array): string {
  const b = Buffer.from(bytes);
  if (b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return "image/png";
  if (b[0] === 255 && b[1] === 216 && b[2] === 255) return "image/jpeg";
  if (["GIF87a", "GIF89a"].includes(b.toString("ascii", 0, 6)))
    return "image/gif";
  if (
    b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";
  if (b.toString("ascii", 4, 8) === "ftyp") return "video/mp4";
  if (
    b.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163])) &&
    b.subarray(0, 4096).includes(Buffer.from("webm"))
  )
    return "video/webm";
  if (b.toString("ascii", 0, 4) === "OggS") return "video/ogg";
  return "";
}

export async function serveMedia(
  req: IncomingMessage,
  res: ServerResponse,
  store: WorkspaceStore,
  file: Media,
  inline: boolean,
) {
  const type = inline ? file.preview : "";
  let start = 0,
    end = file.size - 1,
    partial = false;
  const range = req.headers.range;
  if (range && req.method !== "HEAD") {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match && (match[1] || match[2])) {
      if (!match[1]) {
        start = Math.max(0, file.size - Number(match[2]));
      } else {
        start = Number(match[1]);
        if (match[2]) end = Math.min(end, Number(match[2]));
      }
      partial = true;
    }
    if (
      !partial ||
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start > end ||
      start >= file.size
    ) {
      res.writeHead(416, {
        "Content-Range": `bytes */${file.size}`,
        "Content-Length": "0",
      });
      res.end();
      return;
    }
  }
  res.writeHead(partial ? 206 : 200, {
    "Content-Type": type || "application/octet-stream",
    "Content-Length": String(end - start + 1),
    "Accept-Ranges": "bytes",
    "Content-Disposition": `${type ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
    "Content-Security-Policy": "default-src 'none'; sandbox",
    ...(partial
      ? { "Content-Range": `bytes ${start}-${end}/${file.size}` }
      : {}),
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  await pipeline(Readable.from(store.byteRange(file.id, start, end)), res);
}
