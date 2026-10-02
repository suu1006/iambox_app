import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type Svg from 'react-native-svg';
import { MarkerArtwork } from './MarkerArtwork';
import { markerArtworkLayout } from '../../utils/markerArtworkLayout';
import type { MarkerImageRequest } from './useMarkerImages';

type Props = {
  request: MarkerImageRequest;
  onComplete: (request: MarkerImageRequest, base64: string, size: { width: number; height: number }) => void;
  onFailure: (request: MarkerImageRequest) => void;
};

export function MarkerImageRenderer({ request, onComplete, onFailure }: Props) {
  const svgRef = useRef<Svg>(null);
  const [nameLines, setNameLines] = useState<readonly { text: string; width: number }[] | null>(null);
  const [priceWidth, setPriceWidth] = useState<number | null>(request.kind === 'cluster' ? 0 : null);
  const layout = useMemo(() => nameLines && priceWidth !== null ? markerArtworkLayout(request.kind, nameLines, priceWidth) : null, [nameLines, priceWidth, request.kind]);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    const timeout = setTimeout(() => { if (active.current) { active.current = false; onFailure(request); } }, 3000);
    return () => { active.current = false; clearTimeout(timeout); };
  }, [request, onFailure]);
  useEffect(() => {
    if (!layout) return;
    let secondFrame = 0;
    let disposed = false;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (disposed || !active.current) return;
        try {
          // Native SVG export already uses device scale. Extra dimensions create padding on iOS.
          svgRef.current?.toDataURL((base64) => {
            if (disposed || !active.current) return;
            active.current = false;
            onComplete(request, base64, { width: layout.width, height: layout.height });
          });
        } catch { if (active.current) { active.current = false; onFailure(request); } }
      });
    });
    return () => { disposed = true; cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame); };
  }, [request, layout, onComplete, onFailure]);

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" collapsable={false}
      style={{ position: 'absolute', left: 0, top: 0, width: 280, height: layout?.height ?? 100, zIndex: -1 }}>
      <Text allowFontScaling={false} onTextLayout={({ nativeEvent }) => setNameLines(nativeEvent.lines)}
        style={{ position: 'absolute', opacity: 0, width: request.kind === 'cluster' ? 244 : 218, fontSize: request.kind === 'cluster' ? 14 : 12, fontWeight: '700', lineHeight: 16, includeFontPadding: false }}>{request.name}</Text>
      {request.kind === 'price' && <Text allowFontScaling={false} onTextLayout={({ nativeEvent }) => setPriceWidth(Math.max(0, ...nativeEvent.lines.map((line) => line.width)))}
        style={{ position: 'absolute', opacity: 0, width: 3000, fontSize: 17, fontWeight: '800', includeFontPadding: false }}>{request.price}</Text>}
      {layout && <MarkerArtwork ref={svgRef} request={request} layout={layout} />}
    </View>
  );
}
