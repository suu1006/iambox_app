import { forwardRef } from 'react';
import { fontSizes, fontWeights } from '@iambox/design-tokens';
import colors from '@iambox/design-tokens/colors.json';
import Svg, { G, Path, Rect, Text } from 'react-native-svg';
import LogoSymbol from '../../assets/iambox-logo-symbol.svg';
import type { MarkerArtworkLayout } from '../../utils/markerArtworkLayout';
import type { MarkerImageRequest } from './useMarkerImages';

export const MarkerArtwork = forwardRef<Svg, { request: MarkerImageRequest; layout: MarkerArtworkLayout }>(
  function MarkerArtwork({ request, layout }, ref) {
    const { width: w, height: h, nameLines } = layout;
    const cluster = request.kind === 'cluster';
    const fill = request.selected ? colors.primary.DEFAULT : colors.surface;
    const text = request.selected ? colors.onPrimary : colors.heading;
    return (
      <Svg ref={ref} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Path d={`M13.5 1.5H${w - 13.5}Q${w - 1.5} 1.5 ${w - 1.5} 13.5V${h - 20.5}Q${w - 1.5} ${h - 8.5} ${w - 13.5} ${h - 8.5}H${w / 2 + 7}L${w / 2} ${h - 1.5}L${w / 2 - 7} ${h - 8.5}H13.5Q1.5 ${h - 8.5} 1.5 ${h - 20.5}V13.5Q1.5 1.5 13.5 1.5Z`}
          fill={fill} stroke={colors.primary.DEFAULT} strokeWidth={3} strokeLinejoin="round" />
        {!cluster && <>
          <Rect x={10.5} y={7.5} width={22.6} height={25} rx={4} fill={colors.surface} />
          <G transform="translate(12 9)"><LogoSymbol width={19.8} height={22} /></G>
        </>}
        {nameLines.map((line, i) => <Text key={i} x={cluster ? w / 2 : 38} y={(cluster ? 25 : 24) + i * 16}
          textAnchor={cluster ? 'middle' : 'start'} fontSize={cluster ? fontSizes['14'] : fontSizes['12']}
          fontWeight={fontWeights.bold} fill={text}>{line}</Text>)}
        {!cluster && <Text x={w / 2} y={h - 22} textAnchor="middle" fontSize={layout.priceFontSize}
          fontWeight={fontWeights.extrabold} fill={request.selected ? colors.onPrimary : colors.primary.DEFAULT}>{request.price}</Text>}
      </Svg>
    );
  },
);
