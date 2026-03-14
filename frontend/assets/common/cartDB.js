import * as SQLite from 'expo-sqlite';

const DB_NAME = 'hardwarehaven_cart.db';
const TABLE_NAME = 'cart_items';

let dbPromise = null;

const getDB = async () => {
    if (!dbPromise) {
        dbPromise = SQLite.openDatabaseAsync(DB_NAME);
    }
    return dbPromise;
};

export const initCartDB = async () => {
    const db = await getDB();
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
            itemId TEXT PRIMARY KEY NOT NULL,
            payload TEXT NOT NULL
        );
    `);
};

export const saveCartItems = async (items = []) => {
    await initCartDB();
    const db = await getDB();

    await db.withExclusiveTransactionAsync(async () => {
        await db.runAsync(`DELETE FROM ${TABLE_NAME}`);

        for (const item of items) {
            const itemId = String(item?._id || item?.id || '');
            if (!itemId) {
                continue;
            }

            await db.runAsync(
                `INSERT OR REPLACE INTO ${TABLE_NAME} (itemId, payload) VALUES (?, ?)` ,
                [itemId, JSON.stringify(item)]
            );
        }
    });
};

export const loadCartItems = async () => {
    await initCartDB();
    const db = await getDB();
    const rows = await db.getAllAsync(`SELECT payload FROM ${TABLE_NAME}`);

    return rows
        .map((row) => {
            try {
                return JSON.parse(row.payload);
            } catch {
                return null;
            }
        })
        .filter(Boolean);
};

export const clearCart = async () => {
    await initCartDB();
    const db = await getDB();
    await db.runAsync(`DELETE FROM ${TABLE_NAME}`);
};
