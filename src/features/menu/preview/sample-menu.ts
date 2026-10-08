import type { PublicMenu, PublicProduct } from "../types";

/**
 * Static sample menu for the phone preview on the landing page. Everything here is a fixed
 * product sample ("Lezzet Durağı"); the photos are small webp files in `public/preview`.
 * The dashboard preview passes the restaurant's real data instead.
 */

const product = (overrides: Partial<PublicProduct> & Pick<PublicProduct, "id" | "name" | "priceMinor">): PublicProduct => ({
  description: null,
  imageUrl: null,
  discountPriceMinor: null,
  isAvailable: true,
  isFeatured: false,
  prepTime: null,
  calories: null,
  allergens: [],
  tags: [],
  ...overrides,
});

const corba = product({
  id: "sample-corba",
  name: "Domates Çorbası",
  description: "Közlenmiş domates, taze fesleğen ve bir kaşık krema ile.",
  imageUrl: "/preview/corba.webp",
  priceMinor: 11000,
  prepTime: "10 dk",
  allergens: ["milk"],
  tags: ["vegetarian"],
});

const tavuk = product({
  id: "sample-tavuk",
  name: "Çıtır Tavuk",
  description: "Tarator sos eşliğinde çıtır tavuk parmakları.",
  imageUrl: "/preview/tavuk.webp",
  priceMinor: 29000,
  discountPriceMinor: 24650,
  prepTime: "15 dk",
  allergens: ["gluten", "eggs", "milk"],
});

const humus = product({
  id: "sample-humus",
  name: "Humus",
  description: "Pastırma ve sıcak tereyağı ile servis edilen klasik humus.",
  priceMinor: 9500,
  allergens: ["sesame", "milk"],
});

const antrikot = product({
  id: "sample-antrikot",
  name: "Antrikot Izgara",
  description: "Patates püresi ve ızgara sebzeler eşliğinde.",
  imageUrl: "/preview/antrikot.webp",
  priceMinor: 58000,
  isFeatured: true,
  prepTime: "25 dk",
  calories: 720,
  allergens: ["milk"],
  tags: ["chef_choice"],
});

const somon = product({
  id: "sample-somon",
  name: "Somon Izgara",
  description: "Kuşkonmaz ve limonlu tereyağı sosu ile.",
  imageUrl: "/preview/somon.webp",
  priceMinor: 46000,
  prepTime: "20 dk",
  calories: 540,
  allergens: ["fish", "milk"],
  tags: ["gluten_free"],
});

const tiramisu = product({
  id: "sample-tiramisu",
  name: "Tiramisu",
  description: "Mascarpone peynirli ve espresso ıslatmalı klasik İtalyan tatlısı.",
  imageUrl: "/preview/tiramisu.webp",
  priceMinor: 16000,
  allergens: ["gluten", "milk", "eggs"],
  tags: ["vegetarian"],
});

const brownie = product({
  id: "sample-brownie",
  name: "Sıcak Brownie",
  description: "Dondurma ve sıcak çikolata sosuyla servis edilen yoğun çikolatalı brownie.",
  imageUrl: "/preview/brownie.webp",
  priceMinor: 15500,
  allergens: ["gluten", "milk", "eggs", "nuts"],
  tags: ["vegetarian", "new"],
});

const categories = [
  { id: "sample-baslangiclar", name: "Başlangıçlar", description: null, products: [corba, tavuk, humus] },
  { id: "sample-ana-yemekler", name: "Ana yemekler", description: null, products: [antrikot, somon] },
  { id: "sample-tatlilar", name: "Tatlılar", description: null, products: [tiramisu, brownie] },
];

export const SAMPLE_MENU: PublicMenu = {
  restaurant: {
    id: "sample-restaurant",
    slug: "ornek",
    name: "Lezzet Durağı",
    description: "Mahallenin sıcak mutfağı: güne kahvaltıyla başlar, akşamı ızgarayla kapatır.",
    logoUrl: null,
    coverUrl: "/preview/cover.webp",
    phone: "+90 362 555 01 23",
    address: "Atakum, Samsun",
    instagram: "lezzetduragi",
    website: null,
    wifiName: "Lezzet-Misafir",
    wifiPassword: null,
    currency: "TRY",
    themeColor: "#c2410c",
    isPublished: true,
    showVatNote: true,
    hideUnavailable: false,
  },
  categories,
  featured: categories.flatMap((category) => category.products).filter((item) => item.isFeatured && item.isAvailable),
  isOwner: false,
  isPreview: false,
};
