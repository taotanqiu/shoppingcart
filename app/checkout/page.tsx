'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/app/contexts@/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, loading, totalQuantity, totalAmount } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!cart || cart.items.length === 0)) {
      router.push('/cart');
    }
  }, [loading, cart, router]);

  const handleSubmit = async () => {
    if (!cart) return;

    setSubmitting(true);
    setError('');

    try {
      // Build order data
      const orderItems = cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      // Redirect to Stripe
      window.location.href = data.url;
    } catch (err: unknown) {
  // 如果是 Error 对象
  if (err instanceof Error) {
    setError(err.message);
  } 
  // 如果是字符串
  else if (typeof err === 'string') {
    setError(err);
  } 
  // 其他情况
  else {
    setError('An unknown error occurred');
  }
  setSubmitting(false);
}
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Order Confirmation</h1>

      {/* Items list */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 relative flex-shrink-0">
                  <Image
                    src={item.product.imageUrl || '/placeholder.png'}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">
                    Unit price: ${item.product.price}
                  </p>
                </div>

                <div className="text-sm">x {item.quantity}</div>

                <div className="font-medium">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between text-lg">
            <span>Total items:</span>
            <span className="font-semibold">{totalQuantity} items</span>
          </div>

          <div className="flex justify-between text-2xl font-bold mt-4">
            <span>Total amount:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/cart')}
          disabled={submitting}
        >
          Back to Cart
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          size="lg"
          className="min-w-[120px] bg-green-500"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Place Order'
          )}
        </Button>
      </div>

      <p className="text-sm text-gray-500 mt-6 text-center">
        By placing your order, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}