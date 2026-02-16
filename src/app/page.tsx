"use client";

import { MenuStats } from "./_components/dashboard/MenuStats";
import { MenuQR, QuickActions } from "./_components/dashboard/DashboardModules";
import { RecentProducts } from "./_components/dashboard/RecentProducts";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Modal } from "@/components/ui/modal";
import { CategoryForm } from "./categories/_components/CategoryForm";
import { ProductForm } from "./products/_components/ProductForm";
import { storage } from "@/lib/storage";
import { Category, CreateCategoryInput } from "@/types/category";
import { Product, CreateProductInput } from "@/types/product";
import { useEffect, useState } from "react";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal States
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form States
  const [catFormData, setCatFormData] = useState<CreateCategoryInput>({
    name: "",
    description: "",
    image: "",
    order: 0,
    isActive: true,
  });

  const [prodFormData, setProdFormData] = useState<CreateProductInput>({
    categoryId: "",
    name: "",
    description: "",
    image: "",
    price: 0,
    isAvailable: true,
    order: 0,
  });

  useEffect(() => {
    setCategories(storage.get<Category>("CATEGORIES"));
    setProducts(storage.get<Product>("PRODUCTS"));
  }, [refreshKey]);

  const handleSaveCategory = () => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      ...catFormData,
      order: categories.length + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...categories, newCategory];
    storage.set("CATEGORIES", updated);
    setCategories(updated);
    setIsCatModalOpen(false);
    setRefreshKey(prev => prev + 1);
    // Reset form
    setCatFormData({ name: "", description: "", image: "", order: 0, isActive: true });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProdFormData({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description || "",
      image: product.image || "",
      price: product.price,
      isAvailable: product.isAvailable,
      order: product.order,
    });
    setIsProdModalOpen(true);
  };

  const handleSaveProduct = () => {
    let updated: Product[];

    if (editingProduct) {
      updated = products.map(p =>
        p.id === editingProduct.id
          ? { ...p, ...prodFormData, updatedAt: Date.now() }
          : p
      );
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        ...prodFormData,
        order: products.length + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updated = [...products, newProduct];
    }

    storage.set("PRODUCTS", updated);
    setProducts(updated);
    setIsProdModalOpen(false);
    setEditingProduct(null);
    setRefreshKey(prev => prev + 1);
    // Reset form
    setProdFormData({ categoryId: "", name: "", description: "", image: "", price: 0, isAvailable: true, order: 0 });
  };

  const closeProdModal = () => {
    setIsProdModalOpen(false);
    setEditingProduct(null);
    setProdFormData({ categoryId: "", name: "", description: "", image: "", price: 0, isAvailable: true, order: 0 });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-10 md:py-16">
        {/* Header Section */}
        <SectionHeader
          title="Overview"
          description="Welcome back to Menura. Here&apos;s what&apos;s happening."
        />
        {/* Top Metrics Row */}
        <MenuStats key={refreshKey} />
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RecentProducts key={`recent-${refreshKey}`} onEditProduct={handleEditProduct} />
          <div className="flex flex-col gap-8">
            <MenuQR />
            <QuickActions
              onAddCategory={() => setIsCatModalOpen(true)}
              onAddItem={() => {
                setEditingProduct(null);
                setIsProdModalOpen(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        className="max-w-2xl !p-0 !rounded-3xl"
      >
        <CategoryForm
          formData={catFormData}
          setFormData={setCatFormData}
          categories={categories}
          onSave={handleSaveCategory}
          onCancel={() => setIsCatModalOpen(false)}
          isEditing={false}
        />
      </Modal>

      {/* Product Modal */}
      <Modal
        isOpen={isProdModalOpen}
        onClose={closeProdModal}
        className="max-w-2xl !p-0 !rounded-3xl"
      >
        <ProductForm
          formData={prodFormData}
          setFormData={setProdFormData}
          categories={categories}
          topCategories={categories.slice(0, 5)}
          products={products}
          onSave={handleSaveProduct}
          onCancel={closeProdModal}
          isEditing={!!editingProduct}
          editingId={editingProduct?.id}
        />
      </Modal>
    </div>
  );
}

