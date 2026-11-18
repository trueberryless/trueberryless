export const RING_INSET = 6;
const STROKE_WIDTH = 3;

export function createProgressRingSvg(
  diameter: number,
  progress: number,
  { color, track }: { color: string; track: string }
) {
  const center = diameter / 2;
  const radius = center - STROKE_WIDTH / 2;
  const circumference = 2 * Math.PI * radius;
  const length = Math.max(0, Math.min(1, progress)) * circumference;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}">`,
    `<circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${track}" stroke-width="${STROKE_WIDTH}"/>`,
    `<circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${color}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-dasharray="${length.toFixed(2)} ${circumference.toFixed(2)}" transform="rotate(-90 ${center} ${center})"/>`,
    "</svg>",
  ].join("");
}
