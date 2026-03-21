const { getFirebaseMessaging } = require('./firebaseAdmin');

function isExpoPushToken(token) {
    return typeof token === 'string' && token.startsWith('ExponentPushToken[') && token.endsWith(']');
}

function isLikelyFcmToken(token) {
    if (typeof token !== 'string') return false;
    const value = token.trim();
    if (!value) return false;
    if (isExpoPushToken(value)) return false;
    if (value.includes(' ')) return false;
    return value.length >= 32;
}

function isValidPushToken(token) {
    return isLikelyFcmToken(token);
}

async function sendFirebasePushNotifications(tokens = [], { title, body, data = {} } = {}) {
    const validTokens = tokens.filter(isLikelyFcmToken);
    if (!validTokens.length) {
        return { sent: 0, staleTokens: [] };
    }

    const messaging = getFirebaseMessaging();
    if (!messaging) {
        console.warn('Firebase messaging is not configured. Skipping push delivery.');
        return { sent: 0, staleTokens: [] };
    }

    const staleTokenSet = new Set();

    for (let i = 0; i < validTokens.length; i += 500) {
        const chunk = validTokens.slice(i, i + 500);

        try {
            const response = await messaging.sendEachForMulticast({
                tokens: chunk,
                notification: {
                    title: title || 'HardwareHaven',
                    body: body || '',
                },
                data: Object.entries(data || {}).reduce((acc, [key, value]) => {
                    if (value === undefined || value === null) return acc;
                    acc[String(key)] = String(value);
                    return acc;
                }, {}),
            });

            response.responses.forEach((item, idx) => {
                if (item.success) return;

                const code = item.error?.code || '';
                if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
                    const staleToken = chunk[idx];
                    if (staleToken) staleTokenSet.add(staleToken);
                }
            });
        } catch (error) {
            console.error('Firebase push send error:', error?.message || error);
        }
    }

    return {
        sent: validTokens.length,
        staleTokens: Array.from(staleTokenSet),
    };
}

module.exports = {
    isValidPushToken,
    sendFirebasePushNotifications,
};
