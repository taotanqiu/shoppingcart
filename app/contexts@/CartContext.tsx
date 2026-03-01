'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';



interface Cart {
  id: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  totalQuantity: number;
  totalAmount: number;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
 
}

// CartContext.tsx
export interface CartItem {   // 添加 export
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    stock: number;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  // ===== Calculate total quantity =====
  const totalQuantity = useMemo(() => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  }, [cart]);

  // ===== Calculate total amount =====
  const totalAmount = useMemo(() => {
    return cart?.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ) ?? 0;
  }, [cart]);

  // ===== Fetch cart =====
  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart');
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();

      setCart(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // ===== Add item to cart =====
  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!res.ok) throw new Error('Failed to add');

    const updatedCart = await res.json();
    setCart(updatedCart);
  }, []);

  // ===== Update quantity (optimistic update) =====
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!cart) return;

      const previousCart = cart;

      // Optimistic update
      setCart((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity }
              : item
          ),
        };
      });

      try {
        const res = await fetch('/api/cart/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, quantity }),
        });

        if (!res.ok) throw new Error('Update failed');

        const updatedCart = await res.json();
        setCart(updatedCart); // Finally update with server data
      } catch (error) {
        // Rollback
        setCart(previousCart);
        throw error;
      }
    },
    [cart]
  );

  // ===== Remove item (optimistic update) =====
  const removeItem = useCallback(
    async (itemId: string) => {
      if (!cart) return;

      const previousCart = cart;

      // Optimistic update
      setCart((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.filter((item) => item.id !== itemId),
        };
      });

      try {
        const res = await fetch(`/api/cart?itemId=${itemId}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error('Remove failed');
      } catch (error) {
        setCart(previousCart);
        throw error;
      }
    },
    [cart]
  );

  // ===== Clear cart =====
const clearCart = useCallback(async () => {
  const previousCart = cart;

 
  setCart(null);

  try {
    const res = await fetch('/api/cart/clear', {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Clear failed');
  
  } catch (error) {
  
    setCart(previousCart);
    throw error;
  }
}, [cart]);

 

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalQuantity,
        totalAmount,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
    
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}