// app/api/cart/merge/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. 验证用户是否登录
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    // 2. 从 cookie 获取匿名 ID
    const anonymousId = req.cookies.get('anonymous_id')?.value;
    if (!anonymousId) {
      // 没有匿名购物车，直接返回成功
      return NextResponse.json({ success: true });
    }

    // 3. 查找匿名购物车
    const anonymousCart = await prisma.cart.findUnique({
      where: { anonymousId },
      include: { items: true },
    });

    if (!anonymousCart || anonymousCart.items.length === 0) {
      // 没有有效匿名购物车，只需清除 cookie 即可
      const response = NextResponse.json({ success: true });
      response.cookies.delete('anonymous_id');
      return response;
    }

    // 4. 查找或创建用户购物车
    const userCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });

    // 使用事务保证所有操作原子性
    const result = await prisma.$transaction(async (tx) => {
      let finalCart;

      if (!userCart) {
        // 情况 A：用户没有购物车 → 直接将匿名购物车转移给用户
        finalCart = await tx.cart.update({
          where: { id: anonymousCart.id },
          data: {
            userId: session.user.id,
            anonymousId: null,
          },
          include: { items: true },
        });
      } else {
        // 情况 B：用户已有购物车 → 合并商品
        for (const item of anonymousCart.items) {
          const existing = userCart!.items.find(i => i.productId === item.productId);
          if (existing) {
            // 更新数量（假设后端已做库存验证，这里简单累加）
            await tx.cartItem.update({
              where: { id: existing.id },
              data: { quantity: existing.quantity + item.quantity },
            });
          } else {
            // 新增商品
            await tx.cartItem.create({
              data: {
                cartId: userCart!.id,
                productId: item.productId,
                quantity: item.quantity,
              },
            });
          }
        }
        // 删除匿名购物车
        await tx.cart.delete({ where: { id: anonymousCart.id } });

        // 获取更新后的用户购物车
        finalCart = await tx.cart.findUnique({
          where: { id: userCart!.id },
          include: { items: true },
        });
      }

      return finalCart;
    });

    // 5. 清除客户端的匿名 cookie
    const response = NextResponse.json({ success: true, cart: result });
    response.cookies.delete('anonymous_id');

    return response;
  } catch (error) {
    console.error('Cart merge error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}