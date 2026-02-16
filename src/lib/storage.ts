const STORAGE_KEYS = {
    CATEGORIES: "menura_categories",
    PRODUCTS: "menura_products",
    QR_CONFIG: "menura_qr_config",
};

export const storage = {
    get: <T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T => {
        if (typeof window === "undefined") return defaultValue;
        try {
            const data = localStorage.getItem(STORAGE_KEYS[key]);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error reading from storage (${key}):`, error);
            return defaultValue;
        }
    },

    set: <T>(key: keyof typeof STORAGE_KEYS, data: T): void => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
        } catch (error) {
            console.error(`Error writing to storage (${key}):`, error);
        }
    },
};
