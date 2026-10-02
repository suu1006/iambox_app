import { useEffect, useMemo, useRef, useState } from 'react';
import { createBranchClusterIndex, getBranchClusters, type MapBBox, type BranchMapItem } from '../../utils/branchClusters';
import type { LocationPoint } from '../../types/location';

export function useBranchClusters({ locations, bbox, zoom }: { locations: readonly LocationPoint[]; bbox: MapBBox | null; zoom: number }) {
  const model = useMemo(() => createBranchClusterIndex(locations), [locations]);
  const items = useMemo(() => getBranchClusters(model, bbox, zoom), [model, bbox, zoom]);
  return { model, items };
}

function itemKey(item: BranchMapItem, generation: number) {
  return item.kind === 'point' ? `point:${item.location.id}` : `cluster:${generation}:${item.id}`;
}

// Only newly appearing overlays fade; retained points never remount or blink.
export function useMarkerTransition({ items, generation }: { items: readonly BranchMapItem[]; generation: number }) {
  const previous = useRef(new Set<string>());
  const [fade, setFade] = useState<{ source: readonly BranchMapItem[]; keys: Set<string>; alpha: number }>({ source: [], keys: new Set(), alpha: 1 });
  const entries = useMemo(() => items.map((item) => ({ item, key: itemKey(item, generation) })), [items, generation]);
  const entering = fade.source === items ? fade.keys : new Set(entries.filter((entry) => !previous.current.has(entry.key)).map((entry) => entry.key));
  const alpha = fade.source === items ? fade.alpha : 0;
  useEffect(() => {
    const keys = new Set(entries.filter((entry) => !previous.current.has(entry.key)).map((entry) => entry.key));
    previous.current = new Set(entries.map((entry) => entry.key));
    setFade({ source: items, keys, alpha: keys.size ? 0 : 1 });
    const timers = keys.size ? [50, 100, 150].map((ms) => setTimeout(() => setFade({ source: items, keys, alpha: ms / 150 }), ms)) : [];
    return () => timers.forEach(clearTimeout);
  }, [entries, items]);
  return entries.map((entry) => ({ ...entry, alpha: entering.has(entry.key) ? alpha : 1 }));
}
