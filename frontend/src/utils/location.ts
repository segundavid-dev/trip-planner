export function cityLabel(location: string | undefined): string {
  if (!location) {
    return "";
  }
  return location.split(",")[0].trim();
}