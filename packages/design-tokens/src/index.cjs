const colors = require('./colors.json');
const type = require('./typography.json');
const space = require('./spacing.json');
const radius = require('./radii.json');
const shadows = require('./shadows.json');

// JSON 원본의 참조를 한 곳에서 해석한다. Tailwind와 TS/JS 소비자는 같은 값을 읽는다.
const mapValues = (values, resolve) => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, resolve(value)]));
const aliases = (scale, roles) => ({ ...scale, ...mapValues(roles, key => scale[key]) });

exports.colors = colors;
exports.fontSizes = type.fontSize;
exports.lineHeights = type.lineHeight;
exports.fontWeights = type.fontWeight;
exports.letterSpacing = type.letterSpacing;
exports.fontFamilies = type.fontFamily;
exports.spacing = aliases(space.scale, space.roles);
exports.radii = aliases(radius.scale, radius.roles);
exports.typography = mapValues(type.styles, style => ({
  fontSize: type.fontSize[style.fontSize],
  lineHeight: type.lineHeight[style.lineHeight],
  ...(style.fontWeight ? { fontWeight: type.fontWeight[style.fontWeight] } : {}),
  ...(style.letterSpacing ? { letterSpacing: type.letterSpacing[style.letterSpacing] } : {}),
}));
exports.nativeShadows = mapValues(shadows, ({ colorToken, ...style }) => ({
  ...style,
  shadowColor: typeof colors[colorToken] === 'string' ? colors[colorToken] : colors[colorToken].DEFAULT,
}));
