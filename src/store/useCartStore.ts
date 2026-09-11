import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (
    product: {
      id: string;
      sku: string;
      name: string;
      slug: string;
      price: number;
      images?: string[];
    },
    quantity?: number
  ) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getEstimatedSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.productId === product.id);
        const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;

        if (existingIndex !== -1) {
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += quantity;
          set({ items: updatedItems });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product.id,
                sku: product.sku,
                name: product.name,
                slug: product.slug,
                price: Number(product.price),
                imageUrl,
                quantity: Math.max(1, quantity),
              },
            ],
          });
        }
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getEstimatedSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'construcenter-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
