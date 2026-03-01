import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getAnonymousId } from '@/lib/anonymous';

export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const anonymousId = !session ? await getAnonymousId() : null;

    if (session?.user?.id) {
      // Delete all items in the user's cart

 
     

await prisma.$transaction([
  prisma.cartItem.deleteMany({
        where: { cart: { userId:session?.user?.id  } },
      }),
  prisma.cart.deleteMany({ where: { userId:session?.user?.id } }),
]);



    } else if (anonymousId) {
     await prisma.$transaction([
  prisma.cartItem.deleteMany({ where: { cart: { anonymousId } } }),
  prisma.cart.deleteMany({ where: { anonymousId } }),
]);
    } else {
      return NextResponse.json({ error: 'Cannot identify user' }, { status: 400 });
    }

    // Return an empty cart representation (or just success)
    return NextResponse.json({ success: true, cart: { items: [] } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}