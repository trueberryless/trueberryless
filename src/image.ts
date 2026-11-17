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
 * Resizes a raster image to twice its display size, so it stays sharp on high density
 * screens without bloating the SVG, and re-encodes it as JPEG.
 */
export async function createImageDataUri(
  image: Buffer,
  { height, width }: ImageSize,
  options?: ImageOptions
) {
  let pipeline = sharp(image).resize(width * 2, height * 2, {
    fit: options?.fit ?? "cover",
  });
  if (options?.blur) pipeline = pipeline.blur(options.blur);

  const jpeg = await pipeline.jpeg({ mozjpeg: true, quality: 78 }).toBuffer();

  return toDataUri(jpeg, "image/jpeg");
}

export interface ImageSize {
  height: number;
  width: number;
}

interface ImageOptions {
  blur?: number;
  fit?: "contain" | "cover";
}
