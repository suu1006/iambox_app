import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NaverMapView, type NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { StyleSheet, View } from 'react-native';
import { LocationMarker } from './LocationMarker';
import { ClusterMarker } from './ClusterMarker';
import { MarkerImageRenderer } from './MarkerImageRenderer';
import { useMarkerImages } from './useMarkerImages';
import { useBranchClusters, useMarkerTransition } from './useBranchClusters';
import { getClusterCamera, regionToBBox, MAX_MAP_ZOOM, type BranchCluster, type MarkerRegion } from '../../utils/branchClusters';
import type { LocationPoint } from '../../types/location';

type Props = {
  locations: readonly LocationPoint[];
  selectedLocationId?: string;
  onSelectLocation: (location: LocationPoint) => void;
  onSelectClusterLocations?: (locations: readonly LocationPoint[]) => void;
};
const initialCamera = { latitude: 37.4965, longitude: 127.0175, zoom: 13 };

export function NaverLocationMap({ locations, selectedLocationId, onSelectLocation, onSelectClusterLocations }: Props) {
  const mapRef = useRef<NaverMapViewRef>(null);
  const initialized = useRef(false);
  const cameraRevision = useRef(0);
  const cameraZoom = useRef(initialCamera.zoom);
  const selectedId = useRef(selectedLocationId);
  selectedId.current = selectedLocationId;
  const [camera, setCamera] = useState<{ region: MarkerRegion | null; zoom: number }>({ region: null, zoom: initialCamera.zoom });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const latestViewport = useRef(viewport);
  latestViewport.current = viewport;
  const boundsRead = useRef({ running: false, pending: false });
  const bbox = useMemo(() => regionToBBox(camera.region), [camera.region]);
  const { model, items } = useBranchClusters({ locations, bbox, zoom: camera.zoom });
  const latestModel = useRef(model);
  latestModel.current = model;
  const entries = useMarkerTransition({ items, generation: model.generation });
  const { job, complete, fail, getImage } = useMarkerImages({ items, selectedId: selectedLocationId });

  const moveToLocation = useCallback((location: LocationPoint) => {
    if (initialized.current && location) mapRef.current?.animateCameraTo({
      latitude: location.latitude, longitude: location.longitude,
      zoom: Math.max(16, cameraZoom.current), duration: 450, pivot: { x: 0.5, y: 0.35 },
    });
  }, []);
  const moveSelected = useCallback(() => {
    const location = selectedLocationId ? model.byId.get(selectedLocationId) : undefined;
    if (location) moveToLocation(location);
  }, [model, selectedLocationId, moveToLocation]);
  useEffect(moveSelected, [moveSelected]);
  const selectLocation = useCallback((location: LocationPoint) => {
    if (location.id === selectedId.current) moveToLocation(location);
    onSelectLocation(location);
  }, [moveToLocation, onSelectLocation]);

  const readInitialBounds = useCallback(async function readBounds() {
    if (boundsRead.current.running) { boundsRead.current.pending = true; return; }
    const map = mapRef.current;
    const viewport = latestViewport.current;
    if (!map || !viewport.width || !viewport.height) return;
    boundsRead.current.running = true;
    const revision = ++cameraRevision.current;
    try {
      const corners = [];
      // SDK 2.9.0 keeps only one pending screenToCoordinate request.
      for (const [screenX, screenY] of [[0, 0], [viewport.width, 0], [0, viewport.height], [viewport.width, viewport.height]]) {
        const corner = await map.screenToCoordinate({ screenX, screenY });
        if (revision !== cameraRevision.current || !corner.isValid) return;
        corners.push(corner);
      }
      const south = Math.min(...corners.map((corner) => corner.latitude));
      const west = Math.min(...corners.map((corner) => corner.longitude));
      setCamera({ zoom: cameraZoom.current, region: {
        latitude: south, longitude: west,
        latitudeDelta: Math.max(...corners.map((corner) => corner.latitude)) - south,
        longitudeDelta: Math.max(...corners.map((corner) => corner.longitude)) - west,
      } });
    } catch { /* An idle event can supply bounds if initialization was interrupted. */ }
    finally {
      boundsRead.current.running = false;
      if (boundsRead.current.pending) {
        boundsRead.current.pending = false;
        if (initialized.current) void readBounds();
      }
    }
  }, []);
  useEffect(() => { if (initialized.current) void readInitialBounds(); }, [viewport, readInitialBounds]);
  useEffect(() => () => { initialized.current = false; cameraRevision.current += 1; }, []);

  const expandCluster = useCallback((cluster: BranchCluster) => {
    // Ignore callbacks from overlays belonging to an obsolete filtered index.
    if (latestModel.current !== model) return;
    try {
      const target = getClusterCamera(model, cluster);
      if (cameraZoom.current >= MAX_MAP_ZOOM) {
        const members = model.index.getLeaves(cluster.id, Infinity).flatMap((feature) => {
          const location = model.byId.get(feature.properties.branchId);
          return location ? [location] : [];
        });
        onSelectClusterLocations?.(members);
      } else mapRef.current?.animateCameraTo(target);
    } catch { /* The native overlay may disappear while a tap is being delivered. */ }
  }, [model, onSelectClusterLocations]);

  return <View style={styles.map} onLayout={({ nativeEvent: { layout } }) => {
    setViewport((current) => current.width === layout.width && current.height === layout.height ? current : { width: layout.width, height: layout.height });
  }}>
    <NaverMapView ref={mapRef} accessibilityLabel="네이버 지점 지도" initialCamera={initialCamera} maxZoom={MAX_MAP_ZOOM}
      mapType="Basic" locale="ko" isShowLocationButton={false} isShowZoomControls={false}
      logoAlign="TopLeft" logoMargin={{ left: 12, top: 12 }} style={styles.map}
      onInitialized={() => { initialized.current = true; moveSelected(); return readInitialBounds(); }}
      onCameraIdle={({ region, zoom }) => {
        cameraRevision.current += 1;
        cameraZoom.current = zoom ?? cameraZoom.current;
        setCamera({ region, zoom: cameraZoom.current });
      }}>
      {entries.map(({ item, key, alpha }) => item.kind === 'cluster'
        ? <ClusterMarker key={key} cluster={item} image={getImage(item)} alpha={alpha} onExpand={expandCluster} />
        : <LocationMarker key={key} location={item.location} selected={selectedLocationId === item.location.id}
          image={getImage(item)} alpha={alpha} onSelect={selectLocation} />)}
    </NaverMapView>
    {job && <MarkerImageRenderer key={job.key} request={job} onComplete={complete} onFailure={fail} />}
  </View>;
}
const styles = StyleSheet.create({ map: { flex: 1 } });
