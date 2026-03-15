import CLOUDINARY_CONFIG from '../../config/cloudinary';

const assertCloudinaryConfig = () => {
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
        throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in frontend/.env.');
    }
};

/**
 * Uploads a single image to Cloudinary.
 * @param {string} uri - local file URI
 * @param {string} folder - Cloudinary folder name (e.g., 'products', 'avatars')
 * @returns {Promise<string>} - the secure URL of the uploaded image
 */
export const uploadToCloudinary = async (uri, folder = 'hardwarehaven') => {
    assertCloudinaryConfig();

    if (!uri || typeof uri !== 'string' || !uri.trim()) {
        throw new Error('Image URI is empty. Please pick or capture an image before uploading.');
    }

    const formData = new FormData();

    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', { uri, name: filename, type });
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        { method: 'POST', body: formData }
    );

    const data = await response.json();

    if (!response.ok) {
        const cloud = CLOUDINARY_CONFIG.cloudName || 'unknown-cloud';
        const preset = CLOUDINARY_CONFIG.uploadPreset || 'unknown-preset';
        throw new Error(`${data.error?.message || 'Cloudinary upload failed'} (cloud: ${cloud}, preset: ${preset})`);
    }

    return data.secure_url;
};

/**
 * Uploads multiple images to Cloudinary.
 * @param {string[]} uris - array of local file URIs
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string[]>} - array of secure URLs
 */
export const uploadMultipleToCloudinary = async (uris, folder = 'hardwarehaven') => {
    assertCloudinaryConfig();

    const uploads = uris.map((uri) => uploadToCloudinary(uri, folder));
    return Promise.all(uploads);
};
