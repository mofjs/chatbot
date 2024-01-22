export function formatDateTime(
  value: Date | number,
  locale: Intl.LocalesArgument = "id",
) {
  const date = value instanceof Date ? value : new Date(value * 1000);
  return date.toLocaleString(locale);
}
