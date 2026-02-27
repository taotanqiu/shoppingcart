// app/api/order/[orderId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> } // 注意 params 是 Promise
) {
  try {
    const { orderId } = await params; // ✅ 必须 await

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true }, // 只返回状态字段
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ status: order.status });
  } catch (error) {
    console.error('Failed to fetch order status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}