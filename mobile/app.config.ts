import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const clientId = process.env.NAVER_MAP_CLIENT_ID?.trim() ?? '';

  return {
    ...config,
    name: config.name ?? 'iambox',
    slug: config.slug ?? 'iambox',
    ios: {
      ...config.ios,
      bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER?.trim() || 'com.iambox.app',
    },
    android: {
      ...config.android,
      package: process.env.ANDROID_PACKAGE?.trim() || 'com.iambox.app',
    },
    plugins: [
      ...(config.plugins ?? []),
      ['@mj-studio/react-native-naver-map', { client_id: clientId }],
      [
        'expo-build-properties',
        {
          ios: {
            enableSceneSupport: true,
          },
          android: {
            extraMavenRepos: ['https://repository.map.naver.com/archive/maven'],
          },
        },
      ],
      'expo-dev-client',
    ],
    extra: {
      ...config.extra,
      // Only expose readiness to JavaScript. The SDK reads the ID from native configuration.
      naverMapConfigured: clientId.length > 0,
    },
  };
};
