import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { get } from "node:https";
import type { IncomingMessage } from "node:http";
import { DomainError } from "../src/campus/lib/domain";

// Allow only globally routable IPv4; IPv6 is deliberately refused, including
// IPv4-mapped, translation and tunnelling addresses. DNS is pinned per request.
export function publicAddress(address: string) {
  if (isIP(address) !== 4) return false;
  const [a, b, c] = address.split(".").map(Number);
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99))) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113)
  );
}
export function downloadUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new DomainError("Enter a direct HTTPS file link.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    raw.length > 2000
  )
    throw new DomainError(
      "Enter a public HTTPS link without a password or custom port.",
    );
  if (isIP(url.hostname) && !publicAddress(url.hostname))
    throw new DomainError("Private network addresses cannot be imported.");
  return url;
}
export async function openDownload(
  raw: string,
  signal: AbortSignal,
  redirects = 0,
): Promise<IncomingMessage> {
  const url = downloadUrl(raw);
  signal.throwIfAborted();
  const addresses = await lookup(url.hostname, { all: true, family: 4 });
  if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
    throw new DomainError("This link does not point to a public file server.");
  const pinned = addresses[0].address;
  const response = await new Promise<IncomingMessage>((resolve, reject) => {
    const request = get(
      url,
      {
        signal,
        headers: {
          "User-Agent": "LESSGOOO-Campus/1.0",
          "Accept-Encoding": "identity",
        },
        lookup: (_hostname, options, callback) => {
          if (typeof options === "object" && options.all)
            callback(null, [{ address: pinned, family: 4 }] as never, 4);
          else callback(null, pinned, 4);
        },
      },
      resolve,
    );
    request.setTimeout(30000, () =>
      request.destroy(
        new Error("The file server stopped responding. Try again."),
      ),
    );
    request.on("error", reject);
  });
  if ([301, 302, 303, 307, 308].includes(response.statusCode || 0)) {
    response.destroy();
    if (redirects >= 4 || !response.headers.location)
      throw new DomainError("Too many redirects. Use the final file link.");
    return openDownload(
      new URL(response.headers.location, url).toString(),
      signal,
      redirects + 1,
    );
  }
  if (response.statusCode !== 200) {
    response.destroy();
    throw new DomainError(
      `The file server returned ${response.statusCode}. Use a public download link.`,
    );
  }
  if (
    response.headers["content-encoding"] &&
    response.headers["content-encoding"] !== "identity"
  ) {
    response.destroy();
    throw new DomainError(
      "Compressed web responses are not supported. Use a direct file link.",
    );
  }
  const type = response.headers["content-type"] || "";
  if (
    /text\/html|application\/(json|xhtml|vnd.apple.mpegurl)|mpegurl/i.test(type)
  ) {
    response.destroy();
    throw new DomainError(
      "This is a web page or stream. Copy the direct download link for the file.",
    );
  }
  return response;
}
