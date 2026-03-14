const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

function isExpoPushToken(token) {
    return typeof token === 'string' && token.startsWith('ExponentPushToken[') && token.endsWith(']');
}

async function sendExpoPushNotifications(tokens = [], { title, body, data = {} } = {}) {
    const validTokens = tokens.filter(isExpoPushToken);
    if (!validTokens.length) {
        return { sent: 0, staleTokens: [] };
    }

    const messages = validTokens.map((to) => ({
        to,
        sound: 'default',
        title: title || 'HardwareHaven',
        body: body || '',
        data,
    }));

    const staleTokenSet = new Set();

    for (let i = 0; i < messages.length; i += 100) {
        const chunk = messages.slice(i, i + 100);

        try {
            const response = await fetch(EXPO_PUSH_URL, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk),
            });

            const payload = await response.json();
            const tickets = payload?.data || [];

            tickets.forEach((ticket, idx) => {
                if (ticket?.status !== 'error') {
                    return;
                }

                const details = ticket?.details || {};
                if (details?.error === 'DeviceNotRegistered') {
                    const staleToken = chunk[idx]?.to;
                    if (staleToken) {
                        staleTokenSet.add(staleToken);
                    }
                }
            });
        } catch (error) {
            console.error('Expo push send error:', error?.message || error);
        }
    }

    return {
        sent: validTokens.length,
        staleTokens: Array.from(staleTokenSet),
    };
}

module.exports = {
    isExpoPushToken,
    sendExpoPushNotifications,
};
