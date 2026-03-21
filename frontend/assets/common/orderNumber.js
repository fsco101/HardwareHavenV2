export const formatOrderNumber = (orderOrId) => {
    if (!orderOrId) return '000000';

    if (typeof orderOrId === 'object') {
        if (typeof orderOrId.orderNumber === 'string' && /^\d{6}$/.test(orderOrId.orderNumber)) {
            return orderOrId.orderNumber;
        }

        if (orderOrId._id || orderOrId.id) {
            return formatOrderNumber(orderOrId._id || orderOrId.id);
        }
    }

    const raw = String(orderOrId).trim();
    if (!raw) return '000000';

    if (/^\d{1,6}$/.test(raw)) {
        return raw.padStart(6, '0');
    }

    let hash = 0;
    for (let i = 0; i < raw.length; i += 1) {
        hash = (hash * 31 + raw.charCodeAt(i)) % 1000000;
    }

    return String(hash).padStart(6, '0');
};
