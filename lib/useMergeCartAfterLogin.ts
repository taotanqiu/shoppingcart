import { useCart } from "@/app/contexts@/CartContext";
import { useCallback } from "react";

export function useMergeCartAfterLogin() {
  const { refreshCart } = useCart();

  const mergeCart = useCallback(async (anonymousId: string | null) => {
    if (!anonymousId) return;

    try {
      const response = await fetch('/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ anonymousId }),
      });
      if (!response.ok) throw new Error('Merge failed');
      await refreshCart();
    } catch (error) {
      console.error('Merge error:', error);
    }
  }, [refreshCart]);

  return mergeCart;
}

