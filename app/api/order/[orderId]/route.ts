// app/api/order/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 将 Decimal 字段转换为数字
    const serializedOrder = {
      ...order,
      total: order.total ? Number(order.total) : 0,
      items: order.items.map(item => ({
        ...item,
        price: item.price ? Number(item.price) : 0,
        product: {
          ...item.product,
          // 如果 product 也有 Decimal 字段，也转换
          price: item.product.price ? Number(item.product.price) : 0,
        },
      })),
    };

    return NextResponse.json(serializedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}