/**
 * Philippine Time (Asia/Manila, UTC+8) helpers for the frontend
 */

export function getPHDate() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
}

export function formatPHDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' });
}

export function formatPHDateOnly(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium' });
}

export function formatPHTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', timeStyle: 'short' });
}
