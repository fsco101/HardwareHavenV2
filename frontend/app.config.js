const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = ({ config }) => {
  const apiHost = process.env.API_HOST || 'auto';
  const apiPort = process.env.API_PORT || '4000';
  const explicitApiURL = (process.env.API_URL || '').trim();
  const apiURL = explicitApiURL || (apiHost.toLowerCase() === 'auto' ? '' : `http://${apiHost}:${apiPort}/api/v1/`);
  const easProjectId = (process.env.EAS_PROJECT_ID || '41f3b1da-e246-4c32-99a1-46146e354259').trim();
  const appScheme = process.env.APP_SCHEME || config.expo?.scheme || 'hardwarehaven';
  const androidPackage = process.env.ANDROID_PACKAGE || config.expo?.android?.package || 'com.hardwarehavenexpo.app';

  return {
    ...config,
    expo: {
      ...config.expo,
      scheme: appScheme,
      android: {
        ...(config.expo?.android || {}),
        package: androidPackage,
      },
      plugins: Array.from(new Set([...(config.expo?.plugins || []), 'expo-sqlite', 'expo-secure-store', 'expo-web-browser', 'expo-notifications'])),
      extra: {
        ...(config.expo?.extra || {}),
        ...(easProjectId
          ? {
              eas: {
                ...((config.expo?.extra && config.expo.extra.eas) ? config.expo.extra.eas : {}),
                projectId: easProjectId,
              },
            }
          : {}),
        API_HOST: apiHost,
        API_PORT: apiPort,
        API_URL: apiURL,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
        CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || '',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
        GOOGLE_EXPO_CLIENT_ID: process.env.GOOGLE_EXPO_CLIENT_ID || '',
        GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID || '',
        GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID || '',
        GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID || '',
      },
    },
  };
};
