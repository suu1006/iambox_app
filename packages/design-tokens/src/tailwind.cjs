const tokens = require('./index.cjs');
const px = values => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, `${value}px`]));

module.exports = {
  colors: tokens.colors,
  spacing: px(tokens.spacing),
  borderRadius: px(tokens.radii),
  fontSize: {
    ...Object.fromEntries(Object.entries(tokens.fontSizes).map(([size, value]) => [`size-${size}`, `${value}px`])),
    ...Object.fromEntries(Object.entries(tokens.typography).map(([name, { fontSize, lineHeight, fontWeight, letterSpacing }]) => [
      name, [`${fontSize}px`, {
        lineHeight: `${lineHeight}px`,
        ...(fontWeight === undefined ? {} : { fontWeight: String(fontWeight) }),
        ...(letterSpacing === undefined ? {} : { letterSpacing }),
      }],
    ])),
  },
  lineHeight: {
    ...px(Object.fromEntries(Object.entries(tokens.lineHeights).map(([size, value]) => [`line-${size}`, value]))),
    ...Object.fromEntries(Object.entries(tokens.lineHeights).filter(([size]) => Number(size) % 4 === 0).map(([size, value]) => [String(Number(size) / 4), `${value}px`])),
  },
  fontWeight: tokens.fontWeights,
  letterSpacing: tokens.letterSpacing,
};
