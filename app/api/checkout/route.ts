import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getAnonymousId } from '@/lib/anonymous';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    // Get user session or anonymous ID
    const session = await auth.api.getSession({ headers: req.headers });
    const anonymousId = !session ? await getAnonymousId() : null;

    // Order snapshot from frontend
    const { items } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }

    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Check if products exist
    if (products.length !== productIds.length) {
      const missingIds = productIds.filter(id => !products.find(p => p.id === id));
      return NextResponse.json({ error: `Products not found: ${missingIds.join(', ')}` }, { status: 400 });
    }

    // Check stock
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Product ${product.name} is out of stock` }, { status: 400 });
      }
    }

    // Calculate total amount
    const total = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    // Create local order
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id,
        total,
        status: 'PENDING',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: products.find(p => p.id === item.productId)!.price,
          })),
        },
      },
    });

    // Stripe line items
    const lineItems = items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      return {
        price_data: {
          currency: 'cny',
          product_data: { name: product.name },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: item.quantity,
      };
    });

    const origin = req.headers.get('origin') ?? 'http://localhost:3000';
    const successUrl = `${origin}/order/success/${order.id}`;
    const cancelUrl = `${origin}/cart`;

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: order.id,
        ...(anonymousId ? { anonymousCartId: anonymousId } : {}),
      },
    });

    // Save Stripe session information
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeSessionId: stripeSession.id,
        stripeSessionUrl: stripeSession.url,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: stripeSession.id,
      url: stripeSession.url,
      orderId: order.id,
    });

  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}