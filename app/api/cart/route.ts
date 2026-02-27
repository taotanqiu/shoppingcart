// app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAnonymousId } from '@/lib/anonymous';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const anonymousId = !session ? await getAnonymousId() : null;

    let cart = null;

    if (session?.user?.id) {
      cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
        include: { items: { include: { product: true } } },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: session.user.id },
          include: { items: { include: { product: true } } },
        });
      }
    } else if (anonymousId) {
      cart = await prisma.cart.findUnique({
        where: { anonymousId },
        include: { items: { include: { product: true } } },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { anonymousId },
          include: { items: { include: { product: true } } },
        });
      }
    }
    return NextResponse.json(cart || { items: [] });
  } catch (error) {
    console.error('GET /api/cart error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { productId, quantity = 1 } = await req.json();
    const session = await auth.api.getSession({ headers: req.headers });
    const anonymousId = !session ? await getAnonymousId() : null;

    let cart;

    if (session?.user?.id) {
      cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
        include: { items: true },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: session.user.id },
          include: { items: true },
        });
      }
    } else if (anonymousId) {
      cart = await prisma.cart.findUnique({
        where: { anonymousId },
        include: { items: true },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { anonymousId },
          include: { items: true },
        });
      }
    } else {
      return NextResponse.json({ error: 'User not recognized' }, { status: 400 });
    }

    const existingItem = cart.items.find(item => item.productId === productId);
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('POST /api/cart error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: req.headers });
    const anonymousId = !session ? await getAnonymousId() : null;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const cart = item.cart;
    const isOwner = session?.user?.id
      ? cart.userId === session.user.id
      : cart.anonymousId === anonymousId;

    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cart/remove error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { itemId, quantity } = await req.json();
    if (!itemId || quantity < 1) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: req.headers });
    const anonymousId = !session ? await getAnonymousId() : null;

    // Verify that the product belongs to the current cart (optional but safe)
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const cart = item.cart;
    const isOwner = session?.user?.id
      ? cart.userId === session.user.id
      : cart.anonymousId === anonymousId;

    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}