"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export async function deleteProductAction(productId: string) {


 

  await prisma.product.update({
  where: { id: productId },
  data: { isActive: false },
});

  revalidatePath("/")
}