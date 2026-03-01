// app/api/cart/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAnonymousId } from '@/lib/anonymous';
import { auth } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const { itemId, quantity } = await req.json();
    if (!itemId || quantity < 1) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: req.headers });
    const anonymousId = !session ? await getAnonymousId() : null;

    // 验证该商品属于当前购物车（可选，但安全）
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) return NextResponse.json({ error: '商品不存在' }, { status: 404 });

    const cart = item.cart;
    const isOwner = session?.user?.id
      ? cart.userId === session.user.id
      : cart.anonymousId === anonymousId;

    if (!isOwner) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    // 返回更新后的购物车（可选）
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
  

include: {
    items: {
      include: { product: true },
      orderBy: [
        { createdAt: 'asc' },
        { id: 'asc' }     // 后备排序字段
      ],
    },
  },



    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('PUT /api/cart/update error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}