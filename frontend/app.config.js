const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, 'config/.env') });

module.exports = ({ config }) => {
  const apiHost = process.env.API_HOST || 'auto';
  const apiPort = process.env.API_PORT || '4000';
  const explicitApiURL = (process.env.API_URL || '').trim();
  const apiURL = explicitApiURL || (apiHost.toLowerCase() === 'auto' ? '' : `http://${apiHost}:${apiPort}/api/v1/`);

  return {
    ...config,
    expo: {
      ...config.expo,
      plugins: Array.from(new Set([...(config.expo?.plugins || []), 'expo-sqlite', 'expo-secure-store'])),
      extra: {
        ...(config.expo?.extra || {}),
        API_HOST: apiHost,
        API_PORT: apiPort,
        API_URL: apiURL,
      },
    },
  };
};
