
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

 
 
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    
    // 1. Verify admin permissions
    const authResult = await requireRole("ADMIN");
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
 
    const { id } = await params;

    
    if (!id?.trim()) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // 3. Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // 4. Parse and validate request body
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

    // 5. Update product
    const updated = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    // 6. Return success response
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Product updated successfully"
    });

  } catch (error) {
    // 7. Centralized error handling
    console.error("Failed to update product:", error);
    
    // Handle specific error types
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


 

 