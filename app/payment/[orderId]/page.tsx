// app/payment/[orderId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Prisma } from '@prisma/client';


type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: { include: { product: true } } }
}>;

export default function PaymentPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderWithItems | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/order/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        if (!data.stripeSessionUrl) {
          setError('Order payment link does not exist, please reorder');
        } else {
          // Automatically redirect to payment page (optional)
          window.location.href = data.stripeSessionUrl;
        }
      })
      .catch(() => setError('Failed to fetch order'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePayment = () => {
    if (order?.stripeSessionUrl) {
      window.location.href = order.stripeSessionUrl; // key redirect
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Order Payment</h1>
      <p>Order number: {order?.id}</p>
      <p>Amount: ${order?.total?.toFixed(2)}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handlePayment} disabled={!order?.stripeSessionUrl}>
        Pay Now
      </button>
    </div>
  );
}