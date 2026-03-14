import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

const extra = Constants?.expoConfig?.extra || Constants?.manifest2?.extra || Constants?.manifest?.extra || {};

const API_HOST = (extra.API_HOST || '').trim();
const API_PORT = String(extra.API_PORT || process.env.EXPO_PUBLIC_API_PORT || '4000').trim();
const RAW_API_URL = (extra.API_URL || process.env.EXPO_PUBLIC_API_URL || '').trim();

const ensureApiSuffix = (url) => {
    const trimmed = String(url || '').trim().replace(/\/+$/, '');
    if (!trimmed) return '';
    return trimmed.endsWith('/api/v1') ? `${trimmed}/` : `${trimmed}/api/v1/`;
};

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

const parseHost = (value) => {
    const input = String(value || '').trim();
    if (!input) return '';

    try {
        if (/^(?:https?|exp|exps):\/\//i.test(input)) {
            return new URL(input).hostname || '';
        }
    } catch {
        // fall through to plain host parsing
    }

    const withoutProtocol = input.replace(/^(?:https?|exp|exps):\/\//i, '');
    return withoutProtocol.split('/')[0].split(':')[0].trim();
};

const normalizeRuntimeHost = (host) => {
    const parsed = parseHost(host);
    if (!parsed) return '';
    if (!LOCAL_HOSTS.has(parsed)) return parsed;

    if (Platform.OS === 'android') {
        return '10.0.2.2';
    }

    return 'localhost';
};

const resolveRuntimeHost = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
        return normalizeRuntimeHost(window.location.hostname);
    }

    const candidates = [
        Constants?.expoConfig?.hostUri,
        Constants?.manifest?.debuggerHost,
        Constants?.manifest?.hostUri,
        NativeModules?.SourceCode?.scriptURL,
    ];

    for (const candidate of candidates) {
        const parsed = normalizeRuntimeHost(candidate);
        if (parsed) return parsed;
    }

    return '';
};

const resolveConfiguredHost = (inputHost) => {
    const host = String(inputHost || '').trim();
    if (!host) return '';
    if (host.toLowerCase() === 'auto' || host === '0.0.0.0') {
        return resolveRuntimeHost() || (Platform.OS === 'web' ? 'localhost' : '127.0.0.1');
    }
    return host;
};

const replaceUnroutableHost = (inputURL) => {
    if (!inputURL) return '';
    try {
        const parsed = new URL(inputURL);
        if (LOCAL_HOSTS.has(parsed.hostname)) {
            parsed.hostname = resolveRuntimeHost() || (Platform.OS === 'web' ? 'localhost' : '127.0.0.1');
        }
        return ensureApiSuffix(parsed.toString());
    } catch {
        return ensureApiSuffix(inputURL);
    }
};

const envApiURL = replaceUnroutableHost(RAW_API_URL);
const fallbackHost = resolveRuntimeHost() || (Platform.OS === 'web' ? 'localhost' : '127.0.0.1');
const resolvedConfigHost = resolveConfiguredHost(API_HOST);
const configHostURL = resolvedConfigHost ? ensureApiSuffix(`http://${resolvedConfigHost}:${API_PORT}`) : '';
const fallbackApiURL = `http://${fallbackHost}:${API_PORT}/api/v1/`;

const baseURL = envApiURL || configHostURL || fallbackApiURL;

if (__DEV__) {
    if (!envApiURL && !configHostURL) {
        console.log('[API] API config not found in frontend/config/.env. Using fallback:', baseURL);
        console.log('[API] Set API_HOST and API_PORT in frontend/config/.env (API_HOST can be auto)');
    } else {
        console.log('[API] baseURL:', baseURL);
    }
}

export default baseURL;
