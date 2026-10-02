import { memo } from 'react';
import { NaverMapMarkerOverlay } from '@mj-studio/react-native-naver-map';
import colors from '@iambox/design-tokens/colors.json';
import type { BranchCluster } from '../../utils/branchClusters';
import type { MarkerImage } from '../../utils/markerImageCache';

type Props = { cluster: BranchCluster; image?: MarkerImage; alpha: number; onExpand: (cluster: BranchCluster) => void };

export const ClusterMarker = memo(function ClusterMarker({ cluster, image, alpha, onExpand }: Props) {
  const label = `${cluster.count}${cluster.district ? ` ${cluster.district}` : ''}`;
  return <NaverMapMarkerOverlay latitude={cluster.latitude} longitude={cluster.longitude}
    image={image ? { httpUri: image.uri } : { symbol: 'black' }}
    tintColor={image ? undefined : colors.primary.DEFAULT}
    width={image?.width ?? 26} height={image?.height ?? 34} alpha={alpha}
    anchor={{ x: 0.5, y: 1 }} zIndex={0}
    caption={image ? undefined : { text: label, textSize: 14, color: colors.heading, haloColor: colors.surface }}
    onTap={() => onExpand(cluster)} />;
}, (previous, next) => previous.image === next.image && previous.alpha === next.alpha && previous.onExpand === next.onExpand
  && previous.cluster.id === next.cluster.id && previous.cluster.count === next.cluster.count
  && previous.cluster.latitude === next.cluster.latitude && previous.cluster.longitude === next.cluster.longitude
  && previous.cluster.district === next.cluster.district);
