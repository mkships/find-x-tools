// Human-facing listing dates; keep ISO values in datetime attributes.
export function formatListingDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(date);
  return `${month}, ${date.getUTCDate()}`;
}
