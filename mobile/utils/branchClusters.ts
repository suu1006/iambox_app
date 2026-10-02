import Supercluster from 'supercluster';
import type { LocationPoint } from '../types/location';

export type MarkerRegion = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
export type MapBBox = [number, number, number, number];
type PointProperties = { branchId: string; name: string; lowestPrice: number | null; district?: string };
type ClusterProperties = { district?: string };
export type BranchCluster = { kind: 'cluster'; id: number; latitude: number; longitude: number; count: number; district?: string };
export type BranchMapItem = BranchCluster | { kind: 'point'; location: LocationPoint };
export const MAX_MAP_ZOOM = 21;
let generation = 0;

export function createBranchClusterIndex(locations: readonly LocationPoint[]) {
  const byId = new Map<string, LocationPoint>();
  for (const location of locations) {
    if (!location.id || byId.has(location.id) || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)
      || Math.abs(location.latitude) > 85.051129 || Math.abs(location.longitude) > 180) continue;
    byId.set(location.id, location);
  }
  const index = new Supercluster<PointProperties, ClusterProperties>({
    radius: 96, extent: 256, maxZoom: MAX_MAP_ZOOM,
    map: (props) => ({ district: props.district?.trim() || undefined }),
    reduce: (accumulated, props) => {
      if (accumulated.district !== props.district) accumulated.district = undefined;
    },
  });
  index.load([...byId.values()].map((location) => ({
    type: 'Feature',
    properties: { branchId: location.id, name: location.name, lowestPrice: location.priceFromKrw, district: location.district },
    geometry: { type: 'Point', coordinates: [location.longitude, location.latitude] },
  })));
  return { index, byId, generation: ++generation };
}
export type BranchClusterIndex = ReturnType<typeof createBranchClusterIndex>;

export function regionToBBox(region: MarkerRegion | null): MapBBox | null {
  if (!region || !Object.values(region).every(Number.isFinite) || region.latitudeDelta <= 0 || region.longitudeDelta <= 0) return null;
  return [
    region.longitude - region.longitudeDelta * 0.05,
    Math.max(-85.051129, region.latitude - region.latitudeDelta * 0.05),
    region.longitude + region.longitudeDelta * 1.05,
    Math.min(85.051129, region.latitude + region.latitudeDelta * 1.05),
  ];
}

export function getBranchClusters(model: BranchClusterIndex, bbox: MapBBox | null, zoom: number): BranchMapItem[] {
  if (!bbox || !bbox.every(Number.isFinite) || !Number.isFinite(zoom)) return [];
  return model.index.getClusters(bbox, Math.max(0, Math.min(MAX_MAP_ZOOM, Math.floor(zoom)))).flatMap((feature): BranchMapItem[] => {
    if ('cluster' in feature.properties && feature.properties.cluster) return [{
      kind: 'cluster', id: feature.properties.cluster_id, count: feature.properties.point_count,
      district: feature.properties.district, longitude: feature.geometry.coordinates[0]!, latitude: feature.geometry.coordinates[1]!,
    }];
    const location = model.byId.get((feature.properties as PointProperties).branchId);
    return location ? [{ kind: 'point', location }] : [];
  });
}

export function getClusterCamera(model: BranchClusterIndex, cluster: BranchCluster) {
  return {
    latitude: cluster.latitude, longitude: cluster.longitude,
    zoom: Math.min(MAX_MAP_ZOOM, model.index.getClusterExpansionZoom(cluster.id)), duration: 450,
  };
}
