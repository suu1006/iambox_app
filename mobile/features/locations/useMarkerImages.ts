import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Directory, File, Paths } from 'expo-file-system';
import { PixelRatio } from 'react-native';
import { MarkerImageCache, markerImageKey } from '../../utils/markerImageCache';
import { formatLocationPrice } from '../../utils/formatLocationPrice';
import type { BranchMapItem } from '../../utils/branchClusters';

export type MarkerImageRequest = { key: string; kind: 'price' | 'cluster'; name: string; price: string; selected: boolean; scale: number };
let nextFileId = 0;
const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
let sessionDirectory: Directory | undefined;

function markerDirectory() {
  if (sessionDirectory) return sessionDirectory;
  const root = new Directory(Paths.cache, 'iambox-markers');
  root.create({ idempotent: true, intermediates: true });
  for (const previous of root.list()) if (previous.name !== sessionId) previous.delete();
  // Clean PNGs created by the previous implementation as well.
  for (const previous of Paths.cache.list()) {
    if (previous instanceof File && previous.name.startsWith('iambox-marker-') && previous.name.endsWith('.png')) previous.delete();
  }
  sessionDirectory = new Directory(root, sessionId);
  sessionDirectory.create({ idempotent: true, intermediates: true });
  return sessionDirectory;
}

function imageRequest(item: BranchMapItem, selectedId: string | undefined, scale: number): MarkerImageRequest {
  const kind = item.kind === 'point' ? 'price' : 'cluster';
  const name = item.kind === 'point' ? item.location.name : `${item.count}${item.district ? ` ${item.district}` : ''}`;
  const price = item.kind === 'point' ? formatLocationPrice(item.location.priceFromKrw) : '';
  const selected = item.kind === 'point' && item.location.id === selectedId;
  return { key: markerImageKey(name, price, selected, scale, kind), kind, name, price, selected, scale };
}

export function useMarkerImages({ items, selectedId }: { items: readonly BranchMapItem[]; selectedId?: string }) {
  const cache = useRef(new MarkerImageCache(128)).current;
  const failed = useRef(new Set<string>());
  const [revision, setRevision] = useState(0);
  const [job, setJob] = useState<MarkerImageRequest | null>(null);
  const scale = Math.max(1, PixelRatio.get());
  const requests = useMemo(() => {
    const unique = new Map<string, MarkerImageRequest>();
    for (const item of items) { const request = imageRequest(item, selectedId, scale); unique.set(request.key, request); }
    return [...unique.values()].sort((a, b) => Number(b.selected) - Number(a.selected) || Number(b.kind === 'cluster') - Number(a.kind === 'cluster'));
  }, [items, selectedId, scale]);
  const latestRequests = useRef(requests);
  latestRequests.current = requests;

  useEffect(() => {
    const keys = new Set(requests.map((request) => request.key));
    cache.setPinnedKeys(keys);
    failed.current = new Set([...failed.current].filter((key) => keys.has(key)));
    setJob((current) => {
      if (current && keys.has(current.key) && !cache.get(current.key) && !failed.current.has(current.key)) return current;
      return requests.find((request) => !cache.get(request.key) && !failed.current.has(request.key)) ?? null;
    });
  }, [cache, requests, revision]);
  useEffect(() => () => cache.clear(), [cache]);

  const complete = useCallback((request: MarkerImageRequest, base64: string, size: { width: number; height: number }) => {
    if (!latestRequests.current.some((current) => current.key === request.key)) return;
    let file: File | undefined;
    try {
      if (!base64 || !(size.width > 0 && size.height > 0)) throw new Error('Invalid marker image');
      file = new File(markerDirectory(), `${nextFileId++}.png`);
      file.write(base64, { encoding: 'base64' });
      const imageFile = file;
      const stored = cache.put(request.key, { uri: file.uri, ...size, release: () => { if (imageFile.exists) imageFile.delete(); } });
      if (!stored) failed.current.add(request.key); // Full pinned cache: retain captions, never retry in a loop.
    } catch {
      if (file?.exists) file.delete();
      failed.current.add(request.key);
    }
    setJob(null);
    setRevision((value) => value + 1);
  }, [cache]);
  const fail = useCallback((request: MarkerImageRequest) => {
    if (!latestRequests.current.some((current) => current.key === request.key)) return;
    failed.current.add(request.key);
    setJob((current) => current?.key === request.key ? null : current);
    setRevision((value) => value + 1);
  }, []);
  const images = useMemo(() => {
    const result = new Map<string, ReturnType<MarkerImageCache['get']>>();
    for (const request of requests) { const image = cache.get(request.key); if (image) result.set(request.key, image); }
    return result;
  }, [cache, requests, revision]);
  const getImage = (item: BranchMapItem) => images.get(imageRequest(item, selectedId, scale).key);
  return { job, complete, fail, getImage };
}
