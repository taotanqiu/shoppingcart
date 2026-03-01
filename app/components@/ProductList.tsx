// app/components/ProductList.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductDeleteButton from "@/app/components@/ProductDeleteButton";
import ProductEditButton from "@/app/components@/ProductEditButton";
import AddToCartButton from "@/app/components@/AddToCartButton";
import { Prisma } from '@prisma/client';

// Pagination component (internal)
async function Pagination({
  currentPage,
  totalPages,
  searchTerm,
}: {
  currentPage: number;
  totalPages: number;
  searchTerm: string;
}) {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  // 构建链接，保留搜索词
  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (searchTerm) params.set('q', searchTerm);
    return `/?${params.toString()}`;
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      {prevPage && (
        <Link href={buildHref(prevPage)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Previous
        </Link>
      )}
      <span>
        Page {currentPage} of {totalPages}
      </span>
      {nextPage && (
        <Link href={buildHref(nextPage)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Next
        </Link>
      )}
    </div>
  );
}

export default async function ProductList({
  searchParams,
  isAdmin,
}: {
  searchParams?: Promise<{ page?: string; q?: string }>;
  isAdmin: boolean;
}) {
  const page = Number((await searchParams)?.page) || 1;
  const searchTerm = (await searchParams)?.q || '';
  const pageSize = 8; // 每页数量

  // 构建 where 条件：如果有关键词，在 name 和 description 中模糊搜索
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(searchTerm ? {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    } : {}),
  };

  // 获取总记录数（用于分页）
  const totalProducts = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalProducts / pageSize);

  // 获取当前页商品
  const products = await prisma.product.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <>
      {products.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-3">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              {product.imageUrl && (
                <div className="relative w-full h-48">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-gray-600 mb-2">{product.description}</p>
                <p><span className="font-semibold">Price:</span> ${product.price.toString()}</p>
                <p>
                  {!isAdmin && product.stock <= 0 ? (
                    <span className="bg-red-500 text-white px-2 py-1 rounded">Out of Stock</span>
                  ) : (
                    <span className="font-semibold">Stock: {product.stock}</span>
                  )}
                </p>
                <p>{isAdmin && <span className="font-semibold">Active: {product.isActive ? 'Yes' : 'No'}</span>}</p>
              </CardContent>
              {!isAdmin && product.stock > 0 && <AddToCartButton productId={product.id} />}
              {isAdmin && (
                <CardFooter className="bg-blue-200 flex gap-5 justify-center items-center px-3 py-1 mx-3">
                  <ProductDeleteButton productId={product.id} />
                  <ProductEditButton productId={product.id} />
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 分页控件 */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} searchTerm={searchTerm} />
      )}
    </>
  );
}