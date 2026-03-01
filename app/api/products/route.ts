
// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";


import { requireRole } from "@/lib/requireRole";
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});


 

// ==================================

export async function GET() {
  try {
    // Verify admin permissions


    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error("Failed to fetch products:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


// ==================================

export async function POST(req: Request) {
  try {


    
    // 1. Verify admin permissions
    const authResult = await requireRole("ADMIN");
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }


    // 2. Parse and validate request body
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    
 
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: parsed.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    // 3. Create product
    const product = await prisma.product.create({
      data: parsed.data,
    });

    // 4. Return success response
    return NextResponse.json({
      success: true,
      data: product,
      message: "Product created successfully"
    }, { status: 201 });

  } catch (error) {
    // 5. Centralized error handling
    console.error("Failed to create product:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("Prisma")) {
        return NextResponse.json(
          { error: "Database operation failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ==================================
 
 

 
