'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/app/contexts@/CartContext';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AddToCartButton({ productId }: { productId: string }) {
  const { addToCart,totalQuantity,
        totalAmount, } = useCart();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {




    setLoading(true);
    try {
      await addToCart(productId, 1);
      
    } finally {
      setLoading(false);
    }
  };

  return (
   <Button onClick={handleClick} disabled={loading} className="w-full bg-green-500 hover:bg-green-600 ">
  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
  Add to Cart
</Button>
  );
}