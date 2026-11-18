const BAR_DURATIONS = [0.9, 0.7, 1.1, 0.8];
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const HEIGHT = 14;

export function createEqualizerSvg(color: string) {
  const width = BAR_DURATIONS.length * (BAR_WIDTH + BAR_GAP) - BAR_GAP;
  const bars = BAR_DURATIONS.map(
    (duration, index) =>
      `<rect class="eq" x="${index * (BAR_WIDTH + BAR_GAP)}" y="0" width="${BAR_WIDTH}" height="${HEIGHT}" rx="1" style="animation-duration:${duration}s;animation-delay:-${index * 0.3}s"/>`
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}" viewBox="0 0 ${width} ${HEIGHT}">`,
    "<style>",
    `.eq{fill:${color};transform-box:fill-box;transform-origin:bottom;animation:eq-bounce ease-in-out infinite alternate}`,
    "@keyframes eq-bounce{from{transform:scaleY(.25)}to{transform:scaleY(1)}}",
    "@media (prefers-reduced-motion:reduce){.eq{animation:none;transform:scaleY(.6)}}",
    "</style>",
    ...bars,
    "</svg>",
  ].join("");
}

export const EQUALIZER_SIZE = {
  height: HEIGHT,
  width: BAR_DURATIONS.length * (BAR_WIDTH + BAR_GAP) - BAR_GAP,
};
