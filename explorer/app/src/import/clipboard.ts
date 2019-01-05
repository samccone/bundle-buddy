export async function toClipboard(text: string) {
  await (navigator as (Navigator & {
    clipboard: { writeText: (t: string) => Promise<void> };
  })).clipboard.writeText(text);
}
