// app/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from 'next/link';
import { Suspense } from "react";
import ProductList from "./components@/ProductList";
import { ProductsSkeleton } from "./components@/ProductsSkeleton";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; q?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const isAdmin = session?.user?.role === "ADMIN";

  // 解析当前搜索词和页码（用于分页链接）
  const currentQ = (await searchParams)?.q || '';
  const currentPage = Number((await searchParams)?.page) || 1;

  return (
    <div>
<div className="flex  justify-between mt-5 items-center gap-10 flex-col sm:flex-row">
        <h1 className="text-center text-3xl  font-bold flex-1">All Products</h1>

  <form action="/" method="GET" className="flex gap-2  flex-col sm:flex-row">
    <input
      type="text"
      name="q"
      defaultValue={currentQ}
      placeholder="Search products..."
      className="flex-1 border border-gray-300 rounded px-3 py-2"
    />
    <button
      type="submit"
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Search
    </button>
    {currentQ && (
      <Link
        href="/"
        className="bg-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-400"
      >
        Clear
      </Link>
    )}
  </form>

  {isAdmin && (
        <div className="">
          <Link
            href="/admin/product/add"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Products
          </Link>
        </div>
      )}
</div>
 
      



 

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductList searchParams={searchParams} isAdmin={isAdmin} />
      </Suspense>
    </div>
  );
}