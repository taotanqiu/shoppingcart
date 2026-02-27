import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProductEditForm from '@/app/components@/ProductEditForm';

interface PageProps {
  params: Promise<{ id: string }>; 
}

export default async function EditProductPage({ params }: PageProps) {
 
  const { id } = await params;


  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/'); 
  }


  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();


  const serializedProduct = {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,  
    price: product.price.toNumber ? product.price.toNumber() : Number(product.price),  
    stock: product.stock,
    imageUrl: product.imageUrl ?? undefined,
    isActive: product.isActive,
  };

 
  return <ProductEditForm product={serializedProduct} />;
}