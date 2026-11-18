import sharp from "sharp";

const FETCH_ATTEMPTS = 3;
const FETCH_TIMEOUT = 30_000;

export async function fetchBuffer(url: string): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });
      if (!response.ok) {
        throw new Error(
          `[profile] Fetching \`${url}\` failed with \`${response.status} ${response.statusText}\`.`
        );
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (attempt >= FETCH_ATTEMPTS) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

export function toDataUri(content: Buffer | string, mimeType: string) {
  return `data:${mimeType};base64,${Buffer.from(content).toString("base64")}`;
}

export async function createImageDataUri(
  image: Buffer,
  { height, width }: ImageSize,
  options?: ImageOptions
) {
  const scale = options?.scale ?? 2;
  let pipeline = sharp(image).resize(
    Math.round(width * scale),
    Math.round(height * scale),
    { fit: options?.fit ?? "cover", position: options?.position ?? "centre" }
  );
  if (options?.brightness !== undefined) {
    pipeline = pipeline.modulate({ brightness: options.brightness });
  }
  if (options?.blur) pipeline = pipeline.blur(options.blur * scale);

  const jpeg = await pipeline
    .jpeg({ mozjpeg: true, quality: options?.quality ?? 78 })
    .toBuffer();

  return toDataUri(jpeg, "image/jpeg");
}

export interface ImageSize {
  height: number;
  width: number;
}

interface ImageOptions {
  blur?: number;
  brightness?: number;
  fit?: "contain" | "cover";
  position?: "attention" | "centre" | "top";
  quality?: number;
  scale?: number;
}
