import CLOUDINARY_CONFIG from '../../config/cloudinary';

/**
 * Uploads a single image to Cloudinary.
 * @param {string} uri - local file URI
 * @param {string} folder - Cloudinary folder name (e.g., 'products', 'avatars')
 * @returns {Promise<string>} - the secure URL of the uploaded image
 */
export const uploadToCloudinary = async (uri, folder = 'hardwarehaven') => {
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
        throw new Error(data.error?.message || 'Cloudinary upload failed');
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
    const uploads = uris.map((uri) => uploadToCloudinary(uri, folder));
    return Promise.all(uploads);
};
