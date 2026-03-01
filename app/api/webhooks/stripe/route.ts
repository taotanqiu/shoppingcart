import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderReceipt } from '@/lib/email';
import { revalidatePath } from 'next/cache';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
 

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
  // 3. 清空购物车
let cartToDelete = null;

if (order.userId) {
  // 优先通过 userId 找
  cartToDelete = await prisma.cart.findUnique({ where: { userId: order.userId } });
} else if (session.metadata?.anonymousCartId) {
  // 其次通过 anonymousId 找
  cartToDelete = await prisma.cart.findUnique({
    where: { anonymousId: session.metadata.anonymousCartId },
  });
}

if (cartToDelete) {
  console.log("准备删除购物车:", cartToDelete.id);
  
  // 使用 deleteMany 即使有关联报错也更容易排查，且不会因为记录不存在而崩溃
  await prisma.cart.delete({
    where: { id: cartToDelete.id }
  });

  // 关键：如果你用了 Next.js App Router，一定要在删除后清除缓存
  revalidatePath('/cart');
  // 如果是全站通用的购物车小图标，建议也刷新首页
}

    // 4. 发邮件（忽略错误）
if (paymentEmail && order) {
  try {
    // 转换 Decimal 为 number
    const emailOrder = {
      ...order,
      total: Number(order.total),
      // 如果订单项中的 price 也是 Decimal，也需要转换
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
      })),
    };
    await sendOrderReceipt(emailOrder, paymentEmail);
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