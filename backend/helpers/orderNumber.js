function normalizeId(orderOrId) {
    if (!orderOrId) return '';

    if (typeof orderOrId === 'string' || typeof orderOrId === 'number') {
        return String(orderOrId);
    }

    if (typeof orderOrId === 'object') {
        // Do not read orderOrId.orderNumber here because it may be a Mongoose
        // virtual that calls toOrderNumber(), which would recurse infinitely.
        if (orderOrId._id) return String(orderOrId._id);
        if (orderOrId.id) return String(orderOrId.id);
    }

    return String(orderOrId);
}

function toOrderNumber(orderOrId) {
    const raw = normalizeId(orderOrId).trim();
    if (!raw) return '000000';

    if (/^\d{1,6}$/.test(raw)) {
        return raw.padStart(6, '0');
    }

    // Deterministic hash to 6 digits so existing IDs map consistently.
    let hash = 0;
    for (let i = 0; i < raw.length; i += 1) {
        hash = (hash * 31 + raw.charCodeAt(i)) % 1000000;
    }

    return String(hash).padStart(6, '0');
}

module.exports = {
    toOrderNumber,
};
