import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

const CLOUDINARY_CONFIG = {
    cloudName: extra.CLOUDINARY_CLOUD_NAME || process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: extra.CLOUDINARY_UPLOAD_PRESET || process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
    apiKey: extra.CLOUDINARY_API_KEY || process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '',
};

export default CLOUDINARY_CONFIG;
