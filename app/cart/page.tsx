'use client';

import { useCart } from '@/app/contexts@/CartContext';
import { CartItem } from '@/app/components@/CartItem';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CartPage() {
  const { cart, loading, totalAmount, updateQuantity, removeItem ,clearCart} = useCart();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 capitalize">cart is empty</h2>
        <Button onClick={() => router.push('/')} className='bg-green-500 capitalize'>go shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Cart</h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
          />
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="flex justify-between text-xl font-bold">
          <span>total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between   mt-5 ">
          <Button
          className="text-xl bg-red-500"
     
          onClick={() => clearCart()}
        >
          clear cart
        </Button>
        <Button
          className="text-xl bg-green-500"
     
          onClick={() => router.push('/checkout')}
        >
          checkout
        </Button>
        </div>
      
      </div>
    </div>
  );
}