"use client";

import { useEffect } from "react";
import { storage } from "@/lib/storage";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "@/lib/initialData";

export function DataInitializer() {
    useEffect(() => {
        // Check if initial load is needed
        const categories = storage.get("CATEGORIES", []);
        const products = storage.get("PRODUCTS", []);
        const isInitialized = localStorage.getItem("MENURA_INITIAL_SEED_V1");

        // Seed if first time V1 OR if both are completely empty
        if (!isInitialized || (categories.length === 0 && products.length === 0)) {
            console.log("Menura: Seed data initialization started...");

            storage.set("CATEGORIES", INITIAL_CATEGORIES);
            storage.set("PRODUCTS", INITIAL_PRODUCTS);
            localStorage.setItem("MENURA_INITIAL_SEED_V1", "true");

            console.log("Menura: 8 categories and 64 menu items seeded successfully.");

            // Reload to ensure all components pick up the new data
            window.location.reload();
        } else {
            console.log("Menura: Data already initialized.", {
                categories: categories.length,
                products: products.length
            });
        }
    }, []);

    return null;
}
