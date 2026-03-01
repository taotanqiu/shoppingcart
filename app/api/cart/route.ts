// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAnonymousId } from '@/lib/anonymous';
import { auth } from '@/lib/auth';

// ==================== GET 获取购物车 ====================
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    // 直接从 cookie 读取 anonymousId，绝不自动生成新 ID
    const anonymousId = req.cookies.get('anonymous_id')?.value;

    let cart = null;

    if (session?.user?.id) {
      cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
        include: {
          items: {
            include: { product: true },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          },
        },
      });
      // ❌ 不再自动创建购物车
    } else if (anonymousId) {
      cart = await prisma.cart.findUnique({
        where: { anonymousId },
        include: {
          items: {
            include: { product: true },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          },
        },
      });
      // ❌ 不再自动创建购物车
    }

    // 如果没找到购物车，返回空结构（不创建新购物车）
    return NextResponse.json(cart || { items: [] });
  } catch (error) {
    console.error('GET /api/cart error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
// ==================== POST 添加商品 ====================
export async function POST(req: NextRequest) {
  try {
    const { productId, quantity = 1 } = await req.json();
    const session = await auth.api.getSession({ headers: req.headers });

    // 从 cookie 中读取匿名 ID
    let anonymousId = req.cookies.get('anonymous_id')?.value;

    // 如果没有登录且没有匿名 ID，则生成一个新的（但先不设置 cookie，等购物车创建成功后再设置）
    if (!session?.user?.id && !anonymousId) {
      anonymousId = crypto.randomUUID(); // 或使用其他生成方法
    }

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

    // 添加商品逻辑...
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

    const response = NextResponse.json(updatedCart);

    // 如果是新生成的匿名ID（且之前没有 cookie），则在响应中设置 cookie
    if (!session?.user?.id && anonymousId && !req.cookies.get('anonymous_id')) {
      response.cookies.set('anonymous_id', anonymousId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: false,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    console.error('POST /api/cart error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
// ==================== DELETE 删除单个商品 ====================
export async function DELETE(req: NextRequest) {
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
    console.error('DELETE /api/cart error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ==================== PUT 更新商品数量 ====================
export async function PUT(req: NextRequest) {
  try {
    const { itemId, quantity } = await req.json();
    if (!itemId || quantity < 1) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
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

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/cart error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}