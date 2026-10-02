export type MarkerArtworkLayout = { width: number; height: number; nameLines: string[]; priceFontSize: number };
type MeasuredLine = { text: string; width: number };

export function markerArtworkLayout(kind: 'price' | 'cluster', lines: readonly MeasuredLine[], priceWidth: number): MarkerArtworkLayout {
  const nameLines = lines.slice(0, 2).map((line) => line.text.trim());
  if (lines.length > 2) nameLines[1] = `${nameLines[1]?.slice(0, -1) ?? ''}…`;
  const nameWidth = Math.max(0, ...lines.slice(0, 2).map((line) => line.width));
  // Measurement reserves 12pt so a final ellipsis also fits within the maximum width.
  const width = Math.min(280, Math.max(kind === 'cluster' ? 64 : 120, Math.ceil(nameWidth + (kind === 'cluster' ? 24 : 50) + (lines.length > 2 ? 12 : 0)), Math.ceil(priceWidth + 24)));
  return {
    width, height: (kind === 'cluster' ? 46 : 76) + Math.max(0, nameLines.length - 1) * 16,
    nameLines, priceFontSize: Math.min(17, Math.max(8, 17 * (width - 24) / Math.max(1, priceWidth))),
  };
}
