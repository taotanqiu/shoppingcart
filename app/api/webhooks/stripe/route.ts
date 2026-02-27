import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderReceipt } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: NextRequest) {
  console.log('=== Stripe Webhook Received ===');

  const body = await req.text();
  const sig = (await headers()).get('stripe-signature');

  if (!sig) {
    return new NextResponse('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 只处理支付完成事件
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error('No orderId in webhook metadata');
    return NextResponse.json({ received: true });
  }

  const paymentEmail = session.customer_details?.email;

  try {
    // 1. 更新订单状态为 PAID
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      console.error('Order not found', orderId);
      return NextResponse.json({ received: true });
    }

    // 2. 减库存
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 3. 清空购物车
    if (order.userId) {
      const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    } else if (session.metadata?.anonymousCartId) {

      console.log("清空购物车清空购物车清空购物车")
      
      const cart = await prisma.cart.findUnique({
        where: { anonymousId: session.metadata.anonymousCartId },
      });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    // 4. 发邮件（忽略错误）
  if (paymentEmail && order) {   // 关键：检查 order 是否存在
  try {
    await sendOrderReceipt(order, paymentEmail);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}
    console.log(`Webhook processed successfully for order ${orderId}`);
  } catch (error) {
    console.error('Error processing webhook:', error);
    // 不返回错误，避免 Stripe 重试（可选择性返回500）
    // 这里返回200，记录错误日志即可
  }

  return NextResponse.json({ received: true });
}