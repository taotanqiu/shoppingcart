// app/api/cart/merge/route.ts
import { NextResponse,NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    // Get anonymous ID from cookie
    const anonymousId = req.cookies.get('anonymous_id')?.value;
    if (!anonymousId) {
      return NextResponse.json({ success: true }); // No anonymous cart, nothing to merge
    }

    // Find anonymous cart
    const anonymousCart = await prisma.cart.findUnique({
      where: { anonymousId },
      include: { items: true },
    });
    if (!anonymousCart) {
      return NextResponse.json({ success: true });
    }

    // Find or create user cart
    const userCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });

    if (!userCart) {
      // Transfer anonymous cart to the user directly
      await prisma.cart.update({
        where: { id: anonymousCart.id },
        data: { userId: session.user.id, anonymousId: null },
      });
      // Clear anonymous cookie
      const response = NextResponse.json({ success: true });
      response.cookies.delete('anonymous_id');
      return response;
    } else {
      // Merge items
      for (const item of anonymousCart.items) {
        const existing = userCart.items.find(i => i.productId === item.productId);
        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
      }
      // Delete anonymous cart
      await prisma.cart.delete({ where: { id: anonymousCart.id } });
      // Clear anonymous cookie
      const response = NextResponse.json({ success: true });
      response.cookies.delete('anonymous_id');
      return response;
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}