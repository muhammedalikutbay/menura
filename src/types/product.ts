export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  discountPrice?: number;
  isAvailable: boolean;
  order: number;
  preparationTime?: string; // e.g. "15-20 dk"
  calories?: number;
  allergens?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateProductInput extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {}

export interface ProductFilter {
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
}
