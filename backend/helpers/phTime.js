/**
 * Philippine Time (Asia/Manila, UTC+8) helper
 */
function getPHTime() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
}

function toPHTimeISO() {
    const now = new Date();
    const ph = new Date(now.getTime() + (8 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000));
    return ph.toISOString().replace('Z', '+08:00');
}

module.exports = { getPHTime, toPHTimeISO };
