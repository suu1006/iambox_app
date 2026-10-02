export type MarkerImage = { uri: string; width: number; height: number; release: () => void };

export function markerImageKey(name: string, price: string, selected: boolean, scale: number, kind = 'price'): string {
  return JSON.stringify(['map-bubble-v2', kind, name, price, selected, scale]);
}

// Pinned entries belong to mounted overlays: never delete their files during a load.
export class MarkerImageCache {
  private entries = new Map<string, MarkerImage>();
  private pinned = new Set<string>();
  private capacity: number;

  constructor(capacity = 128) { this.capacity = capacity; }
  get size() { return this.entries.size; }
  setPinnedKeys(keys: Set<string>) { this.pinned = keys; }
  get(key: string): MarkerImage | undefined {
    const entry = this.entries.get(key);
    if (entry) { this.entries.delete(key); this.entries.set(key, entry); }
    return entry;
  }
  put(key: string, image: MarkerImage): boolean {
    if (this.entries.has(key)) { image.release(); return true; }
    while (this.entries.size >= this.capacity) {
      const victim = [...this.entries.keys()].find((candidate) => !this.pinned.has(candidate));
      if (victim === undefined) { image.release(); return false; }
      this.entries.get(victim)?.release();
      this.entries.delete(victim);
    }
    this.entries.set(key, image);
    return true;
  }
  clear() {
    for (const image of this.entries.values()) image.release();
    this.entries.clear();
    this.pinned.clear();
  }
}
