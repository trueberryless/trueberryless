const NUMBER_FORMAT = new Intl.NumberFormat("en-US");
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatNumber(value: number) {
  return NUMBER_FORMAT.format(value);
}

export function formatShortDate(isoDate: string) {
  return DATE_FORMAT.format(new Date(isoDate));
}
