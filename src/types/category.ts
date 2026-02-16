export interface Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
    order: number;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
}

export type CreateCategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt">;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
