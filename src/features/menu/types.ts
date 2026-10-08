/**
 * Shapes of the public menu. Shared by the server query, the guest page and the embedded phone
 * preview, so this module must stay free of `server-only` imports.
 */

export type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceMinor: number;
  discountPriceMinor: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  prepTime: string | null;
  calories: number | null;
  allergens: string[];
  tags: string[];
};

export type PublicCategory = {
  id: string;
  name: string;
  description: string | null;
  products: PublicProduct[];
};

/** The restaurant fields a guest may see. The owner id and timestamps stay on the server. */
export type PublicRestaurant = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  address: string | null;
  instagram: string | null;
  website: string | null;
  wifiName: string | null;
  wifiPassword: string | null;
  currency: string;
  themeColor: string;
  isPublished: boolean;
  showVatNote: boolean;
  hideUnavailable: boolean;
};

export type PublicMenu = {
  restaurant: PublicRestaurant;
  /** Active categories by position; categories without visible products are skipped. */
  categories: PublicCategory[];
  /** Available products flagged as featured, in menu order. */
  featured: PublicProduct[];
  /** The signed-in viewer owns this restaurant. */
  isOwner: boolean;
  /** The owner is looking at a menu that guests cannot see yet. */
  isPreview: boolean;
};
