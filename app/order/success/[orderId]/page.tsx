'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react'; 


type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl: string | null;
  };
};

type Order = {
  id: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export default function OrderSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
 
  const { orderId } = React.use(params);

  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setTimeoutReached(true);
        router.push('/cart');
      }
    }, 30000); 

    const fetchOrderStatus = async () => {
      try {
     
        const statusRes = await fetch(`/api/order/${orderId}/status`);
        if (!statusRes.ok) throw new Error('Failed to fetch status');
        const { status } = await statusRes.json();

        if (status === 'PAID') {
      
          const orderRes = await fetch(`/api/order/${orderId}`);
          if (!orderRes.ok) throw new Error('Failed to fetch order');
          const orderData = await orderRes.json();
          if (isMounted) {
            setOrder(orderData);
            setLoading(false);
            clearTimeout(timeoutId); 
          }
        } else {
        
          setTimeout(fetchOrderStatus, 2000);
        }
      } catch (error) {
        console.error('Error polling order:', error);
        if (isMounted) {
         
          setTimeout(() => router.push('/cart'), 5000);
        }
      }
    };

    fetchOrderStatus();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [orderId, router]);

  if (timeoutReached) {
    return null; 
  }

  if (loading || !order) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Processing your order, please wait...</p>
        <p className="text-sm text-gray-500 mt-4">
          If no response for a while, you'll be automatically returned to the cart.


        </p>
      </div>
    );
  }

  
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-green-600 mb-6">🎉 Payment successful! Thank you for your purchase.

</h1>
      <p className="text-gray-600 mb-8">Order ID：{order.id}</p>

      {/* 订单商品列表 */}
      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
            <div className="w-16 h-16 relative flex-shrink-0">
              <Image
                src={item.product.imageUrl || '/placeholder.png'}
                alt={item.product.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-gray-500">Quantity：{item.quantity}</p>
            </div>
            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        <div className="flex justify-end text-xl font-bold mt-4">
          Total：${order.total.toFixed(2)}
        </div>
      </div>

      <p className="text-sm text-gray-500">
       Your electronic receipt has been sent to your email and should arrive within a few minutes.


      </p>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => router.push('/')}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
       Continue Shopping
        </button>
      </div>
    </div>
  );
}