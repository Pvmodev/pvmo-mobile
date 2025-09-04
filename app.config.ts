import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'PVMO Mobile',
    slug: 'pvmo-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#1a1a2e'
    },
    assetBundlePatterns: [
        "**/*"
    ],
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.pvmo.mobile'
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/images/adaptive-icon.png',
            backgroundColor: '#1a1a2e'
        },
        package: 'com.pvmo.mobile'
    },
    web: {
        favicon: './assets/images/favicon.png',
        bundler: 'metro'
    },
    scheme: 'pvmo-mobile',
    plugins: [
        'expo-router'
    ],

});