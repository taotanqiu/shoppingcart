import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductDeleteButton from "./components@/ProductDeleteButton";
import ProductEditButton from "./components@/ProductEditButton";
import { auth } from "@/lib/auth"; // Your Better Auth instance
import { headers } from "next/headers";
import Link from 'next/link'
import AddToCartButton from "./components@/AddToCartButton";

export default async function Home() {
  // 1. Get current user session
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // 2. Determine if user is ADMIN
  const isAdmin = session?.user?.role === "ADMIN";
  
  // 3. Fetch data
  const allProduct = await prisma.product.findMany({where: { isActive: true }});

 


  return (
    <div   >
      <h1 className="text-center text-3xl mt-5 font-bold leading-none">All Products</h1>

   
  {isAdmin && (
 <div className="flex justify-end w-full ">
  <Link href="/admin/product/add" className="bg-green-500 hover:bg-green-600 p-1">Add Products</Link>
</div>
  )}
 

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-3">
        {allProduct.map((product) => (
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
              <p>
                <span className="font-semibold">Price:</span> ${product.price.toString()}
              </p>
              <p>
                 {!isAdmin && product.stock <=0 ? <span className="bg-red-500">Out of Stock</span> : <span className="font-semibold">Stock:{product.stock}</span> }
              </p>
              <p>

   {isAdmin && <span className="font-semibold">Active:{product.isActive ? "Yes" : "No"}</span>  }



                
              </p>
            </CardContent>

            
 {!isAdmin && product.stock >0 && <AddToCartButton productId={product.id} />}



 {isAdmin && <CardFooter className=" bg-blue-200 flex gap-5 justify-center items-center px-3 py-1 mx-3">
           
              <ProductDeleteButton productId={product.id} />
              <ProductEditButton productId={product.id} />
            </CardFooter>}
 

            
          </Card>
        ))}
      </div>
    </div>
  );
}