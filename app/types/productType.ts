import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

 

 
export type FormDataType = z.infer<typeof productSchema>;
export type FormErrors = Partial<Record<keyof FormDataType, string>>;