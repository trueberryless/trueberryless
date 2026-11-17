import sharp from "sharp";

const FETCH_ATTEMPTS = 3;

export async function fetchBuffer(url: string): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url);
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

/**
 * Resizes and re-encodes a raster image as a JPEG data URI. By default it renders at
 * twice the display size, so it stays sharp on high density screens.
 */
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
  /** Blur radius in display pixels. */
  blur?: number;
  brightness?: number;
  fit?: "contain" | "cover";
  position?: "attention" | "centre" | "top";
  quality?: number;
  /** Pixel density of the output. Blurred images look the same at a lower density. */
  scale?: number;
}
